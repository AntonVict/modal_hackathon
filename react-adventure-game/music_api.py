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

# Dictionary to store track selections by session ID
track_selections = {}

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
def select_music_for_scene(scene_description, session_id=None, force_new_selection=False):
    """Select the most appropriate music track for a scene"""
    try:
        # Get available tracks
        tracks = get_available_tracks()
        
        if not tracks:
            logger.warning("No music tracks found in tracks directory")
            return None
        
        # Check if we already have a selection for this session
        if not force_new_selection and session_id and session_id in track_selections:
            logger.info(f"Using existing track selection for session {session_id}")
            # Return the previously selected track to maintain continuity
            return track_selections[session_id]
            
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
        
        # Store the selection for this session
        if session_id:
            track_selections[session_id] = selected_track
        
        return selected_track
    except Exception as e:
        logger.error(f"Error selecting music: {str(e)}")
        if tracks:
            return tracks[0]  # Return first track as fallback
        return None

# Function to compare scene descriptions for similarity
def scenes_are_similar(prev_description, current_description):
    """Determine if scenes are similar enough to maintain the same music"""
    # Simple implementation: check for key phrase overlap
    if not prev_description or not current_description:
        return False
    
    # Extract key terms from descriptions
    prev_terms = set(prev_description.lower().split())
    current_terms = set(current_description.lower().split())
    
    # Calculate overlap
    common_terms = prev_terms.intersection(current_terms)
    
    # If more than 40% of terms overlap, consider scenes similar
    similarity = len(common_terms) / max(len(prev_terms), len(current_terms))
    
    return similarity > 0.4

@music_api.route('/select', methods=['POST'])
def select_music():
    """API endpoint to select appropriate music for a scene"""
    data = request.json
    scene_description = data.get('description', '')
    session_id = data.get('sessionId')
    
    if not scene_description:
        return jsonify({'error': 'Scene description is required'}), 400
    
    # Track the last description for this session
    prev_description = None
    if session_id and session_id in track_selections:
        prev_description = track_selections.get(f"{session_id}_description")
    
    # Store current description
    if session_id:
        track_selections[f"{session_id}_description"] = scene_description
    
    # Determine if we need a new track or can keep the current one
    force_new_selection = False
    if prev_description and not scenes_are_similar(prev_description, scene_description):
        # Scenes are different enough to warrant new music
        force_new_selection = True
        logger.info("Scene changed significantly, selecting new music track")
    
    # Get the selected track (either new or existing)
    selected_track = select_music_for_scene(
        scene_description, 
        session_id=session_id,
        force_new_selection=force_new_selection
    )
    
    if not selected_track:
        return jsonify({'error': 'No suitable track found'}), 404
    
    logger.info(f"Returning track for scene: {selected_track['name']}")
    
    # Include a field indicating if this is a new selection or continued from before
    return jsonify({
        'success': True,
        'track': selected_track,
        'is_new_selection': force_new_selection or prev_description is None
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
