import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys

# Add parent directory to path so we can import game modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from game import AdventureGame
from character import Character
from dotenv import load_dotenv
from image_api import image_api  # Import the image API blueprint

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register the image API blueprint
app.register_blueprint(image_api, url_prefix='/api/image')

# Store active games by session ID
active_games = {}
logger.info(f"Active games on startup: {active_games}")

@app.route('/api/worlds', methods=['GET'])
def get_worlds():
    """Get all available game worlds"""
    temp_game = AdventureGame()
    return jsonify({
        'worlds': [
            {
                'key': key,
                'name': key.capitalize(),
                'description': description
            } for key, description in temp_game.available_worlds.items()
        ]
    })

@app.route('/api/character/create', methods=['POST'])
def create_character():
    """Create a new character with the given attributes"""
    data = request.json
    session_id = data.get('sessionId')
    world_key = data.get('worldKey')
    name = data.get('name')
    attributes = data.get('attributes')
    description = data.get('description', f"A brave adventurer named {name}")
    
    logger.info(f"Creating character for session {session_id}, world: {world_key}, name: {name}")
    
    if not session_id or not world_key or not name or not attributes:
        logger.error(f"Missing required parameters: session_id={session_id}, world_key={world_key}, name={name}, attributes={attributes}")
        return jsonify({'error': 'All fields are required'}), 400
    
    # Create game instance for this session
    game = AdventureGame()
    game.select_world(world_key)
    
    try:
        game.create_character(name, attributes, description)
        active_games[session_id] = game
        logger.info(f"Created character and added to active_games. Active sessions: {list(active_games.keys())}")
        
        return jsonify({
            'success': True,
            'character': {
                'name': game.character.name,
                'attributes': game.character.attributes,
                'description': game.character.description
            }
        })
    except Exception as e:
        logger.error(f"Error creating character: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/game/init', methods=['POST'])
def initialize_game():
    """Initialize a new game with the selected world and character"""
    data = request.json
    session_id = data.get('sessionId')
    
    logger.info(f"Initializing game for session {session_id}")
    logger.info(f"Current active sessions: {list(active_games.keys())}")
    
    if not session_id:
        logger.error("No sessionId provided")
        return jsonify({'error': 'SessionId is required'}), 400
    
    if session_id not in active_games:
        logger.error(f"Session {session_id} not found in active_games")
        return jsonify({'error': 'No character found. Create a character first.'}), 400
    
    game = active_games[session_id]
    
    try:
        # Initialize the game with an intro prompt
        logger.info("Calling game.initialize_game()")
        response = game.initialize_game()
        logger.info(f"Response from initialize_game: {response[:100]}...") # Print the first 100 chars
        
        # Extract options from response
        options = []
        if "OPTIONS:" in response:
            options_text = response.split("OPTIONS:")[1].strip()
            lines = options_text.split("\n")
            
            for line in lines:
                if line.strip() and any(line.strip().startswith(str(i)) for i in range(1, 10)):
                    option_text = line.strip()[2:].strip()  # Remove number and dot
                    options.append(option_text)
        
        # Extract description
        description = ""
        if "DESCRIPTION:" in response:
            description = response.split("DESCRIPTION:")[1].split("OPTIONS:")[0].strip()
        else:
            description = response
            
        print(f"Extracted description: {description[:100]}...") # Print the first 100 chars
        
        # Limit the description length if it's extremely long
        if len(description) > 2000:
            description = description[:2000] + "..."
        
        result = {
            'success': True,
            'story': response,
            'description': description,
            'options': options
        }
        
        print(f"Options extracted: {options}")
        return jsonify(result)
    except Exception as e:
        print(f"Error in initialize_game: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/game/action', methods=['POST'])
def process_action():
    """Process a player action and return the updated game state"""
    data = request.json
    session_id = data.get('sessionId')
    action = data.get('action')
    
    if not session_id or not action:
        return jsonify({
            'error': 'Missing sessionId or action'
        }), 400
    
    if session_id not in active_games:
        return jsonify({
            'error': 'No active game found for this session'
        }), 404
    
    game = active_games[session_id]
    
    try:
        # Process the action using the correct method
        response = game.process_user_action(action)
        
        # Extract state changes from response if present
        state_changes = {}
        if "STATE_CHANGES:" in response:
            state_changes_text = response.split("STATE_CHANGES:")[1].split("\n")[0].strip()
            try:
                # Parse state changes as a dictionary
                import json
                state_changes = json.loads(state_changes_text)
                
                # Apply state changes to the game
                if 'gold' in state_changes and hasattr(game.character, 'modify_gold'):
                    game.character.modify_gold(state_changes['gold'])
                    
                if 'inventory_add' in state_changes and hasattr(game.character, 'add_to_inventory'):
                    for item in state_changes['inventory_add']:
                        game.character.add_to_inventory(item)
                        
                if 'inventory_remove' in state_changes and hasattr(game.character, 'remove_from_inventory'):
                    for item in state_changes['inventory_remove']:
                        game.character.remove_from_inventory(item)
                
                # Handle attribute changes
                if 'attributes' in state_changes and hasattr(game.character, 'modify_attribute'):
                    for attr, value in state_changes['attributes'].items():
                        game.character.modify_attribute(attr, value)
            except Exception as e:
                print(f"Error processing state changes: {str(e)}")
        
        # Extract options from response
        options = []
        if "OPTIONS:" in response:
            options_text = response.split("OPTIONS:")[1].strip()
            lines = options_text.split("\n")
            
            for line in lines:
                if line.strip() and any(line.strip().startswith(str(i)) for i in range(1, 10)):
                    option_text = line.strip()[2:].strip()  # Remove number and dot
                    options.append(option_text)
        
        # Extract description
        description = ""
        if "DESCRIPTION:" in response:
            description = response.split("DESCRIPTION:")[1].split("OPTIONS:")[0].strip()
        else:
            description = response
        
        # Limit the description length if it's extremely long
        if len(description) > 2000:
            description = description[:2000] + "..."
        
        return jsonify({
            'success': True,
            'story': response,
            'description': description,
            'options': options,
            'stateChanges': state_changes  # Return state changes to the frontend
        })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/game/inventory/add', methods=['POST'])
def add_to_inventory():
    """Add an item to the player's inventory"""
    data = request.json
    session_id = data.get('sessionId')
    item = data.get('item')
    
    if not session_id or not item:
        return jsonify({
            'error': 'Missing sessionId or item'
        }), 400
    
    if session_id not in active_games:
        return jsonify({
            'error': 'No active game found for this session'
        }), 404
    
    game = active_games[session_id]
    
    try:
        # Add item to inventory
        if hasattr(game.character, 'add_to_inventory'):
            game.character.add_to_inventory(item)
            return jsonify({
                'success': True,
                'message': f'Added {item} to inventory'
            })
        else:
            return jsonify({
                'error': 'Character does not support inventory management'
            }), 500
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/game/inventory/remove', methods=['POST'])
def remove_from_inventory():
    """Remove an item from the player's inventory"""
    data = request.json
    session_id = data.get('sessionId')
    item = data.get('item')
    
    if not session_id or not item:
        return jsonify({
            'error': 'Missing sessionId or item'
        }), 400
    
    if session_id not in active_games:
        return jsonify({
            'error': 'No active game found for this session'
        }), 404
    
    game = active_games[session_id]
    
    try:
        # Remove item from inventory
        if hasattr(game.character, 'remove_from_inventory'):
            success = game.character.remove_from_inventory(item)
            if success:
                return jsonify({
                    'success': True,
                    'message': f'Removed {item} from inventory'
                })
            else:
                return jsonify({
                    'error': f'Item {item} not found in inventory'
                }), 404
        else:
            return jsonify({
                'error': 'Character does not support inventory management'
            }), 500
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/game/currency/modify', methods=['POST'])
def modify_currency():
    """Modify the player's currency amount"""
    data = request.json
    session_id = data.get('sessionId')
    amount = data.get('amount')
    
    if not session_id or amount is None:
        return jsonify({
            'error': 'Missing sessionId or amount'
        }), 400
    
    if session_id not in active_games:
        return jsonify({
            'error': 'No active game found for this session'
        }), 404
    
    game = active_games[session_id]
    
    try:
        # Modify currency
        if hasattr(game.character, 'modify_gold'):
            game.character.modify_gold(amount)
            return jsonify({
                'success': True,
                'message': f'Modified gold by {amount}',
                'newAmount': game.character.gold if hasattr(game.character, 'gold') else 0
            })
        else:
            return jsonify({
                'error': 'Character does not support currency management'
            }), 500
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/game/status', methods=['GET'])
def get_status():
    """Get the current game status"""
    session_id = request.args.get('sessionId', 'default')
    
    if session_id not in active_games:
        return jsonify({'error': 'No game found. Create a character first.'}), 400
    
    game = active_games[session_id]
    
    if not game.game_state:
        return jsonify({'error': 'Game not initialized'}), 400
    
    return jsonify({
        'status': game.game_state.get_state_description()
    })

@app.route('/api/game/inventory', methods=['GET'])
def get_inventory():
    """Get the player's inventory"""
    session_id = request.args.get('sessionId', 'default')
    
    if session_id not in active_games:
        return jsonify({'error': 'No game found. Create a character first.'}), 400
    
    game = active_games[session_id]
    
    if not game.game_state:
        return jsonify({'error': 'Game not initialized'}), 400
    
    return jsonify({
        'inventory': game.game_state.inventory
    })

@app.route('/api/game/history', methods=['GET'])
def get_history():
    """Get the game history"""
    session_id = request.args.get('sessionId', 'default')
    
    if session_id not in active_games:
        return jsonify({'error': 'No game found. Create a character first.'}), 400
    
    game = active_games[session_id]
    
    if not game.game_state:
        return jsonify({'error': 'Game not initialized'}), 400
    
    return jsonify({
        'history': game.game_state.history
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
