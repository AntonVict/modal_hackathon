import os
import sys
import time
from flask import Blueprint, jsonify, request, send_file
from flask_cors import CORS

# Add parent directory to path so we can import game modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import image generation modules
from flux_backend import app as modal_app, image_gen_main

# Create the blueprint
image_api = Blueprint('image_api', __name__)

# Store image paths by session ID
image_cache = {}

@image_api.route('/generate', methods=['POST'])
def generate_image():
    """Generate an image based on the current game state"""
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
        # Use the modal app to generate the image
        with modal_app.run():
            output_path = os.path.join(os.getcwd(), f"image_{session_id}.jpg")
            image_gen_main(
                prompt=image_prompt, 
                twice=False, 
                output_path=output_path
            )
        
        # Cache the image path
        image_cache[session_id] = output_path
        
        return jsonify({
            'success': True,
            'imagePath': f'/api/image/view/{session_id}'
        })
    except Exception as e:
        print(f"Error generating image: {str(e)}")
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
