import time
from io import BytesIO
from pathlib import Path
import os
import modal

cuda_version = "12.4.0"  # should be no greater than host CUDA version
flavor = "devel"  # includes full CUDA toolkit
operating_sys = "ubuntu22.04"
tag = f"{cuda_version}-{flavor}-{operating_sys}"

cuda_dev_image = modal.Image.from_registry(
    f"nvidia/cuda:{tag}", add_python="3.11"
).entrypoint([])

diffusers_commit_sha = "81cf3b2f155f1de322079af28f625349ee21ec6b"

flux_image = (
    cuda_dev_image.apt_install(
        "git",
        "libglib2.0-0",
        "libsm6",
        "libxrender1",
        "libxext6",
        "ffmpeg",
        "libgl1",
    )
    .pip_install(
        "invisible_watermark==0.2.0",
        "transformers==4.44.0",
        "huggingface_hub[hf_transfer]==0.26.2",
        "accelerate==0.33.0",
        "safetensors==0.4.4",
        "sentencepiece==0.2.0",
        "torch==2.5.0",
        f"git+https://github.com/huggingface/diffusers.git@{diffusers_commit_sha}",
        "numpy<2",
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1", "HF_HUB_CACHE": "/cache"})
)

flux_image = flux_image.env(
    {
        "TORCHINDUCTOR_CACHE_DIR": "/root/.inductor-cache",
        "TORCHINDUCTOR_FX_GRAPH_CACHE": "1",
    }
)

app = modal.App("game-image-generator", image=flux_image)

with flux_image.imports():
    import torch
    from diffusers import FluxPipeline

VARIANT = "schnell"
NUM_INFERENCE_STEPS = 4

@app.cls(
    gpu="H100",
    timeout=60 * 60,  # 60 minutes
    volumes={
        "/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True),
        "/root/.nv": modal.Volume.from_name("nv-cache", create_if_missing=True),
        "/root/.triton": modal.Volume.from_name("triton-cache", create_if_missing=True),
        "/root/.inductor-cache": modal.Volume.from_name("inductor-cache", create_if_missing=True),
    },
)
class GameImageGenerator:
    @modal.enter()
    def enter(self):
        pipe = FluxPipeline.from_pretrained(
            f"black-forest-labs/FLUX.1-{VARIANT}",
            torch_dtype=torch.bfloat16
        ).to("cuda")
        self.pipe = optimize(pipe, compile=False)  # Keeping compile=False for faster startup

    @modal.method()
    def generate_scene_image(
        self,
        scene_description: str,
        world_type: str = "fantasy",
        style: str = "digital art"
    ) -> bytes:
        """Generate an image for a game scene"""
        # Enhance the prompt with style and world context
        enhanced_prompt = f"In the style of {style}, a scene from a {world_type} world: {scene_description}"
        print(f"🎨 Generating image for scene: {enhanced_prompt}")
        
        out = self.pipe(
            enhanced_prompt,
            output_type="pil",
            num_inference_steps=NUM_INFERENCE_STEPS,
        ).images[0]

        # Convert to bytes
        byte_stream = BytesIO()
        out.save(byte_stream, format="JPEG")
        return byte_stream.getvalue()

    @modal.method()
    def generate_character_portrait(
        self,
        character_description: str,
        world_type: str = "fantasy",
        style: str = "detailed character portrait"
    ) -> bytes:
        """Generate a character portrait"""
        enhanced_prompt = f"In the style of {style}, a portrait of a {world_type} character: {character_description}"
        print(f"🎨 Generating character portrait: {enhanced_prompt}")
        
        out = self.pipe(
            enhanced_prompt,
            output_type="pil",
            num_inference_steps=NUM_INFERENCE_STEPS,
        ).images[0]

        byte_stream = BytesIO()
        out.save(byte_stream, format="JPEG")
        return byte_stream.getvalue()

def optimize(pipe, compile=False):
    # fuse QKV projections in Transformer and VAE
    pipe.transformer.fuse_qkv_projections()
    pipe.vae.fuse_qkv_projections()

    # switch memory layout to Torch's preferred, channels_last
    pipe.transformer.to(memory_format=torch.channels_last)
    pipe.vae.to(memory_format=torch.channels_last)

    if not compile:
        return pipe

    # set torch compile flags
    config = torch._inductor.config
    config.disable_progress = False  # show progress bar
    config.conv_1x1_as_mm = True  # treat 1x1 convolutions as matrix muls
    # adjust autotuning algorithm
    config.coordinate_descent_tuning = True
    config.coordinate_descent_check_all_directions = True
    config.epilogue_fusion = False  # do not fuse pointwise ops into matmuls

    # tag the compute-intensive modules, the Transformer and VAE decoder, for compilation
    pipe.transformer = torch.compile(
        pipe.transformer, mode="max-autotune", fullgraph=True
    )
    pipe.vae.decode = torch.compile(
        pipe.vae.decode, mode="max-autotune", fullgraph=True
    )

    # trigger torch compilation
    print("🔦 running torch compiliation (may take up to 20 minutes)...")

    pipe(
        "dummy prompt to trigger torch compilation",
        output_type="pil",
        num_inference_steps=NUM_INFERENCE_STEPS,  # use ~50 for [dev], smaller for [schnell]
    ).images[0]

    print("🔦 finished torch compilation")

    return pipe

@app.function(gpu="H100")
def generate_images(
    game_response: str = None,
    character_attributes: str = None,
    character_description: str = None,
    world_type: str = None,
    output_dir: str = "D:\Personal\SOPs\Fall24_Docs\KTH SOPs\KTH_Academics\modal_hack\modal_hackathon\gen_img"
):
    """Wrapper function to handle both local and deployed modes"""
    if modal.is_local():
        # Create and deploy the app if needed
        generator = GameImageGenerator()
        # No need for lookup or remote calls when running locally
    else:
        # If already running on Modal
        generator = GameImageGenerator()

    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)
    
    # Generate scene image if game response is provided
    if game_response:
        t0 = time.time()
        scene_bytes = generator.generate_scene_image(
            scene_description=game_response,
            world_type=world_type
        )
        print(f"🎨 Scene generation latency: {time.time() - t0:.2f} seconds")
        
        # Save scene image
        scene_path = os.path.join(output_path, "scene.jpg")
        with open(scene_path, "wb") as f:
            f.write(scene_bytes)
        print(f"🎨 Saved scene image to {scene_path}")
    
    # Generate character portrait if description provided
    if character_description:
        # Parse character attributes from string if provided
        attributes_dict = {}
        if character_attributes:
            try:
                import ast
                attributes_dict = ast.literal_eval(character_attributes)
            except:
                print("Warning: Could not parse character attributes")
        
        # Enhance character description with attributes
        enhanced_description = character_description
        if attributes_dict:
            attributes_str = ", ".join(f"{k}: {v}" for k, v in attributes_dict.items())
            enhanced_description = f"{character_description}. Character attributes: {attributes_str}"
        
        t0 = time.time()
        portrait_bytes = generator.generate_character_portrait(
            character_description=enhanced_description,
            world_type=world_type
        )
        print(f"🎨 Portrait generation latency: {time.time() - t0:.2f} seconds")
        
        # Save character portrait
        portrait_path = os.path.join(output_path, "character.jpg")
        with open(portrait_path, "wb") as f:
            f.write(portrait_bytes)
        print(f"🎨 Saved character portrait to {portrait_path}")

# Keep your existing main function for direct Modal usage
@app.local_entrypoint()
def main(
    game_response: str = None,
    character_attributes: str = None,
    character_description: str = None,
    world_type: str = None,
    output_dir: str = "D:\Personal\SOPs\Fall24_Docs\KTH SOPs\KTH_Academics\modal_hack\modal_hackathon\gen_img"
):
    generate_images.remote(
        game_response=game_response,
        character_attributes=character_attributes,
        character_description=character_description,
        world_type=world_type,
        output_dir=output_dir
    )


