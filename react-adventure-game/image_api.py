import os
import sys
import time
import threading
from flask import Blueprint, jsonify, request, send_file
from flask_cors import CORS

# Add parent directory to path so we can import game modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import image generation modules
from flux_backend import app as modal_app, image_gen_main, Model

# Create the blueprint
image_api = Blueprint('image_api', __name__)

# Store image paths by session ID
image_cache = {}

# Modal session management
modal_session = None
modal_lock = threading.Lock()

def ensure_modal_running():
    """Ensure that the Modal session is running, starting it if needed"""
    global modal_session
    
    with modal_lock:
        if modal_session is None:
            print("Starting Modal session for image generation...")
            # Start Modal in a way that keeps it alive
            modal_session = modal_app.run()
            modal_session.__enter__()  # Start the session
            print("Modal session started successfully!")
    
    return modal_session

# Start Modal when the API is loaded
try:
    ensure_modal_running()
    print("Modal session initialized for image generation API")
except Exception as e:
    print(f"Error initializing Modal session: {str(e)}")
    print("Image generation will attempt to restart Modal for each request")

@image_api.route('/generate', methods=['POST'])
def generate_image():
    """Generate an image based on the current game state"""
    global modal_session  # Move global declaration to the top of the function
    
    data = request.json
    # print("Encountering generate_image")
    # import ipdb; ipdb.set_trace()
    session_id = data.get('sessionId')
    
    if not session_id:
        return jsonify({'error': 'SessionId is required'}), 400
    
    # Get parameters for image generation
    description = data.get('description', '')
    character_description = data.get('characterDescription', '')
    world_type = data.get('worldType', 'fantasy')
    
    # Create a full prompt that includes all relevant information
    image_prompt = f"Generate an image with a scene as follows: {description}"
    
    if character_description:
        image_prompt += f" and a human cartoon character with description: {character_description}"
    
    image_prompt += f", in a {world_type} game world"
    
    # Generate image 
    try:
        # Ensure Modal is running (will reuse existing session if available)
        if modal_session is None:
            ensure_modal_running()
        
        # Generate the image using the existing Modal session
        print(f"Generating image for session {session_id[:8]}...")
        t0 = time.time()
        
        # Call the model inference directly without restarting Modal
        output_path = os.path.join(os.getcwd(), f"image_{session_id}.jpg")
        
        # Use Model directly without starting a new Modal session
        image_bytes = Model().inference.remote(image_prompt)
        
        print(f"Image generation latency: {time.time() - t0:.2f} seconds")
        
        # Save the image
        with open(output_path, "wb") as f:
            f.write(image_bytes)
            
        print(f"Saved image to {output_path}")
        
        # Cache the image path
        image_cache[session_id] = output_path
        
        # Add timestamp for cache busting
        timestamp = int(time.time())
        
        return jsonify({
            'success': True,
            'imagePath': f'/api/image/view/{session_id}?t={timestamp}'
        })
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        # If the session died, we'll try to restart it next time
        if "Modal session" in str(e):
            with modal_lock:
                if modal_session is not None:
                    try:
                        modal_session.__exit__(None, None, None)
                    except:
                        pass
                    modal_session = None
                    
        return jsonify({'error': str(e)}), 500

@image_api.route('/view/<session_id>', methods=['GET'])
def view_image(session_id):
    """Serve the generated image"""
    if session_id not in image_cache:
        return jsonify({'error': 'No image found for this session'}), 404
    
    image_path = image_cache[session_id]
    
    if not os.path.exists(image_path):
        return jsonify({'error': 'Image file not found'}), 404
    
    return send_file(image_path, mimetype='image/jpeg')
