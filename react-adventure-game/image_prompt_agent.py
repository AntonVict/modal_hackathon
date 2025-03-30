"""
Image Prompt Agent - Creates optimal prompts for image generation
based on game state, character and world information.
"""

import os
import sys
import logging
from typing import Dict, Any, Optional
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

# Add parent directory to path to import game modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImagePromptAgent:
    """Agent that creates optimized image prompts based on game context"""
    
    def __init__(self):
        # Initialize Gemini LLM
        try:
            self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.3)
            
            # Define prompt template for image prompt creation
            self.prompt_template = PromptTemplate(
                input_variables=["description", "character_description", "world_type", "world_context"],
                template="""
                You are an expert image prompt engineer. Your task is to create 
                detailed, vivid prompts for an image generation model. Focus on the most important 
                visual elements from the scene description. Create prompts that are:
                
                1. Visually focused (colors, lighting, composition, style)
                2. Concise but detailed
                3. Highlight the most important elements
                4. Appropriate for the world style
                5. Include visual style guidance
                
                Scene description: {description}
                
                World type: {world_type} - {world_context}
                
                Character description: {character_description}
                
                DO NOT include meta-instructions like "generate an image" or "create a picture".
                Focus ONLY on describing what should be IN the image. Return ONLY the final prompt text.
                """
            )
            
            # Create the prompt generation chain
            self.prompt_chain = LLMChain(llm=self.llm, prompt=self.prompt_template)
            self.has_llm = True
            logger.info("Gemini LLM initialized for image prompt generation")
            
        except Exception as e:
            logger.error(f"Error initializing Gemini LLM: {str(e)}")
            self.has_llm = False
            logger.warning("Using fallback prompt generation without LLM")
    
    def create_prompt(self, 
                     description: str, 
                     character_description: Optional[str] = None,
                     world_type: str = "fantasy") -> str:
        """
        Create an optimized image generation prompt based on game context
        
        Args:
            description: The current scene description
            character_description: Description of the player character
            world_type: The type of game world (fantasy, sci-fi, etc.)
            
        Returns:
            An optimized prompt for image generation
        """
        # If no LLM is available, use basic prompt formatting
        if not self.has_llm:
            return self._create_basic_prompt(description, character_description, world_type)
            
        try:
            # Use Gemini LLM to create an optimized prompt
            return self._create_llm_prompt(description, character_description, world_type)
        except Exception as e:
            logger.error(f"Error creating optimized prompt: {str(e)}")
            # Fall back to basic prompt
            return self._create_basic_prompt(description, character_description, world_type)
    
    def _create_basic_prompt(self, 
                           description: str, 
                           character_description: Optional[str],
                           world_type: str) -> str:
        """Create a basic prompt without using an LLM"""
        
        # World-specific style guidance
        style_map = {
            "fantasy": "fantasy art style, magical, mystical, detailed, vibrant colors",
            "space": "sci-fi art style, futuristic, space, technology, cosmic, stars",
            "pirate": "pirate art style, naval, ships, treasure, ocean, swashbuckling adventure",
            "regular": "realistic art style, modern world, detailed environment",
            "hackathon": "cyber art style, digital, neon, glowing, technology themed"
        }
        
        style_guidance = style_map.get(world_type, style_map["fantasy"])
        
        # Create the prompt with structured format
        prompt = f"A detailed illustration in {style_guidance}. Scene: {description}"
        
        if character_description:
            prompt += f". Include a character who is {character_description}."
            
        # Add quality boosters
        prompt += " Dramatic lighting, detailed environment, professional quality rendering."
        
        return prompt
    
    def _create_llm_prompt(self, 
                         description: str, 
                         character_description: Optional[str],
                         world_type: str) -> str:
        """Use Gemini to create an optimized image generation prompt"""
        
        # World descriptions for context
        world_descriptions = {
            "fantasy": "A magical medieval world with dragons, wizards and ancient mysteries.",
            "space": "A futuristic space-faring civilization with advanced technology and alien worlds.",
            "pirate": "A swashbuckling world of pirate ships, treasure hunting and naval adventures.",
            "regular": "A modern world similar to our own reality.",
            "hackathon": "A cyberpunk digital realm with hackers, neon lights, and advanced technology."
        }
        
        world_context = world_descriptions.get(world_type, world_descriptions["fantasy"])
        
        # Ensure character_description is a string
        if character_description is None:
            character_description = "None"
        
        # Generate the prompt using LangChain
        prompt = self.prompt_chain.run({
            "description": description,
            "character_description": character_description,
            "world_type": world_type,
            "world_context": world_context
        }).strip()
        
        logger.info(f"Generated image prompt: {prompt[:100]}...")
        
        return prompt
        
# For testing
if __name__ == "__main__":
    agent = ImagePromptAgent()
    test_prompt = agent.create_prompt(
        description="A dark forest with a mysterious glowing object in the distance",
        character_description="A young wizard with a blue robe and a long white beard",
        world_type="fantasy"
    )
    print("Generated prompt:")
    print(test_prompt)
