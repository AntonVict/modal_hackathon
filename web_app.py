import os
import json
from flask import Flask, render_template, request, jsonify, session
from app import initialize_new_game, run_game_turn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For session management

# Available world settings
AVAILABLE_WORLDS = {
    "fantasy": "A magical realm of dragons, wizards, and ancient mysteries.",
    "space": "A futuristic universe where you navigate your spaceship through the stars.",
    "pirate": "A world of high seas adventures, buried treasures, and naval battles.",
    "regular": "A modern-day setting in a bustling city with everyday challenges.",
    "hackathon": "You are attending the Modal hackathon in Stockholm, hosted by venture capital firms and the cloud computing company."
}

@app.route('/')
def index():
    return render_template('index.html', worlds=AVAILABLE_WORLDS)

@app.route('/character', methods=['POST'])
def character_creation():
    world_key = request.form.get('world')
    session['world_key'] = world_key
    
    return render_template('character.html', world=world_key)

@app.route('/initialize_game', methods=['POST'])
def initialize_game():
    # Get character data from form
    name = request.form.get('name')
    description = request.form.get('description')
    
    # Parse attributes
    attributes = {
        'strength': int(request.form.get('strength', 0)),
        'intelligence': int(request.form.get('intelligence', 0)),
        'dexterity': int(request.form.get('dexterity', 0)),
        'charisma': int(request.form.get('charisma', 0)),
        'luck': int(request.form.get('luck', 0))
    }
    
    # Store character data in session
    session['character'] = {
        'name': name,
        'attributes': attributes,
        'description': description
    }
    
    # Initialize game using Modal function
    world_key = session.get('world_key')
    result = initialize_new_game.remote(world_key, name, attributes, description)
    
    # Store game state in session
    session['game_state'] = result['game_state']
    
    # Parse introduction text and options
    intro_text = result['introduction']
    
    # Extract options from the response
    options = extract_options(intro_text)
    description_text = extract_description(intro_text)
    
    return render_template('game.html', 
                           description=description_text, 
                           options=options,
                           character=session['character'],
                           world=world_key)

@app.route('/action', methods=['POST'])
def process_action():
    # Get user action
    action = request.form.get('action')
    
    # Get game state and character from session
    game_state = session.get('game_state', {})
    character = session.get('character', {})
    world_key = session.get('world_key')
    
    # Process action using Modal function
    result = run_game_turn.remote(
        world_key,
        character,
        game_state,
        action
    )
    
    # Update game state in session
    session['game_state'] = result['game_state']
    
    # Parse response text and options
    response_text = result['response']
    options = extract_options(response_text)
    description_text = extract_description(response_text)
    
    return jsonify({
        'description': description_text,
        'options': options
    })

def extract_options(text):
    """Extract options from the AI response"""
    options = []
    
    # Check if OPTIONS section exists
    if "OPTIONS:" in text:
        options_section = text.split("OPTIONS:")[1].strip()
        
        # Extract numbered options
        lines = options_section.split('\n')
        for line in lines:
            if line.strip() and any(line.startswith(str(i) + ".") for i in range(1, 5)):
                # Remove the number prefix
                option_text = line.split(".", 1)[1].strip()
                options.append(option_text)
    
    # If no options found, provide default ones
    if not options:
        options = [
            "Explore your surroundings",
            "Talk to someone nearby",
            "Check your inventory"
        ]
    
    return options

def extract_description(text):
    """Extract the description from the AI response"""
    if "DESCRIPTION:" in text:
        return text.split("DESCRIPTION:")[1].split("OPTIONS:")[0].strip()
    return text

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    app.run(debug=True)
