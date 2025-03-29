import os
import sys
import json
import logging
from flask import Blueprint, jsonify, request, send_file
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

# Add parent directory to path so we can import game modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the blueprint
music_api = Blueprint('music_api', __name__)

# Tracks directory
TRACKS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'tracks')

# Create tracks directory if it doesn't exist
os.makedirs(TRACKS_DIR, exist_ok=True)

# Get list of available tracks
def get_available_tracks():
    """Get list of all track files in the tracks directory"""
    tracks = []
    if os.path.exists(TRACKS_DIR):
        for filename in os.listdir(TRACKS_DIR):
            if filename.endswith(('.mp3', '.wav', '.ogg')):
                tracks.append({
                    'id': filename,
                    'name': os.path.splitext(filename)[0].replace('_', ' ').title(),
                    'path': f'/tracks/{filename}'
                })
    return tracks

# Initialize LLM for music selection
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.3)

# Define music selection prompt
music_prompt = PromptTemplate(
    input_variables=["scene_description", "available_tracks"],
    template="""
    You are a music selection AI for an adventure game. Your task is to select the most appropriate 
    background music for a given scene based on its description and mood.
    
    Current scene description:
    {scene_description}
    
    Available music tracks (track names only):
    {available_tracks}
    
    Select the SINGLE most appropriate track for this scene. Consider the mood, setting, 
    and activity described in the scene. Focus on matching emotional tone and atmosphere.
    
    Return ONLY the exact track name from the available tracks list. No explanation, just the track name.
    """
)

# Create the music selection chain
music_selector_chain = LLMChain(llm=llm, prompt=music_prompt)

# Music selection function
def select_music_for_scene(scene_description):
    """Select the most appropriate music track for a scene"""
    try:
        # Get available tracks
        tracks = get_available_tracks()
        
        if not tracks:
            logger.warning("No music tracks found in tracks directory")
            return None
            
        # Create a list of track names for the prompt
        track_names = [track['name'] for track in tracks]
        
        # Select track using LangChain
        track_name = music_selector_chain.run({
            "scene_description": scene_description,
            "available_tracks": "\n".join(track_names)
        }).strip()
        
        logger.info(f"Selected track: {track_name}")
        
        # Find the track object that matches the selected name
        selected_track = next((t for t in tracks if t['name'].lower() == track_name.lower()), None)
        
        # If no exact match, find closest match
        if not selected_track and tracks:
            # Try searching for partial matches
            for t in tracks:
                if track_name.lower() in t['name'].lower() or t['name'].lower() in track_name.lower():
                    selected_track = t
                    break
                    
            # If still no match, return the first track
            if not selected_track:
                selected_track = tracks[0]
                logger.warning(f"No matching track found for '{track_name}', defaulting to {selected_track['name']}")
        
        return selected_track
    except Exception as e:
        logger.error(f"Error selecting music: {str(e)}")
        if tracks:
            return tracks[0]  # Return first track as fallback
        return None

@music_api.route('/select', methods=['POST'])
def select_music():
    """API endpoint to select appropriate music for a scene"""
    data = request.json
    scene_description = data.get('description', '')
    
    if not scene_description:
        return jsonify({'error': 'Scene description is required'}), 400
        
    selected_track = select_music_for_scene(scene_description)
    
    if not selected_track:
        return jsonify({'error': 'No suitable track found'}), 404
        
    logger.info(f"Selected track for scene: {selected_track['name']}")
    
    return jsonify({
        'success': True,
        'track': selected_track
    })

@music_api.route('/tracks', methods=['GET'])
def get_tracks():
    """API endpoint to get all available tracks"""
    tracks = get_available_tracks()
    return jsonify({
        'success': True,
        'tracks': tracks
    })

@music_api.route('/track/<track_id>', methods=['GET'])
def get_track(track_id):
    """Serve a music track file"""
    track_path = os.path.join(TRACKS_DIR, track_id)
    
    if not os.path.exists(track_path):
        return jsonify({'error': 'Track not found'}), 404
        
    # Determine mime type based on file extension
    mime_type = 'audio/mpeg'  # Default to mp3
    if track_id.endswith('.wav'):
        mime_type = 'audio/wav'
    elif track_id.endswith('.ogg'):
        mime_type = 'audio/ogg'
        
    return send_file(track_path, mimetype=mime_type)
