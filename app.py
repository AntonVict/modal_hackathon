import os
import modal
from dotenv import load_dotenv
from game import AdventureGame

# Load environment variables
load_dotenv()

# Define the Modal app
app = modal.App("adventure-game")

# Create an image with our dependencies
image = modal.Image.debian_slim().pip_install(
    "langchain>=0.1.0",
    "langchain-core>=0.1.0",
    "langchain-google-genai>=0.0.3",
    "google-generativeai>=0.3.1",
    "pydantic>=2.5.0",
    "python-dotenv>=1.0.0"
)

@app.function(image=image, secrets=[modal.Secret.from_name("google-ai-key")])
def run_game_turn(world_key, character_data, game_state_data, user_input):
    """Run a single turn of the game, processing user input and returning the next state"""
    # Recreate game state from data
    game = AdventureGame()
    
    # Initialize world and character from provided data
    game.select_world(world_key)
    game.create_character(
        character_data["name"],
        character_data["attributes"],
        character_data["description"]
    )
    
    # Manually set game state properties from the saved state
    game.initialize_game()
    
    # Update game state based on saved data
    if game_state_data.get("inventory"):
        game.game_state.inventory = game_state_data["inventory"]
    
    if game_state_data.get("location"):
        loc = game_state_data["location"]
        game.game_state.change_location(loc["region"], loc["area"], loc.get("description", ""))
    
    if game_state_data.get("health"):
        game.game_state.health = game_state_data["health"]
    
    if game_state_data.get("gold"):
        game.game_state.gold = game_state_data["gold"]
    
    if game_state_data.get("history"):
        game.game_state.history = game_state_data["history"]
    
    # Process the user's input
    response = game.process_user_action(user_input)
    
    # Return the updated game state and AI response
    return {
        "response": response,
        "game_state": {
            "inventory": game.game_state.inventory,
            "location": {
                "region": game.game_state.location.region,
                "area": game.game_state.location.area,
                "description": game.game_state.location.description
            },
            "health": game.game_state.health,
            "gold": game.game_state.gold,
            "history": game.game_state.history
        }
    }

@app.function(image=image, secrets=[modal.Secret.from_name("google-ai-key")])
def initialize_new_game(world_key, character_name, character_attributes, character_description):
    """Initialize a new game with the given world and character settings"""
    game = AdventureGame()
    
    # Initialize world and character
    game.select_world(world_key)
    game.create_character(character_name, character_attributes, character_description)
    
    # Initialize game and get introduction
    intro = game.initialize_game()
    
    # Return initial game state
    return {
        "introduction": intro,
        "game_state": {
            "inventory": game.game_state.inventory,
            "location": {
                "region": game.game_state.location.region,
                "area": game.game_state.location.area,
                "description": game.game_state.location.description
            },
            "health": game.game_state.health,
            "gold": game.game_state.gold,
            "history": game.game_state.history
        }
    }

@app.local_entrypoint()
def main():
    # This is a simple CLI interface for testing the Modal functions
    print("Welcome to the Adventure Game!")
    print("\nSelect a world:")
    
    game = AdventureGame()
    for idx, (key, description) in enumerate(game.available_worlds.items(), 1):
        print(f"{idx}. {key.title()} - {description}")
    
    try:
        world_choice = int(input("\nEnter your choice (1-5): "))
        world_key = list(game.available_worlds.keys())[world_choice - 1]
        
        print("\nCreate your character:")
        name = input("Name: ")
        
        print("\nYou have 20 points to allocate among these attributes:")
        print("Strength, Intelligence, Dexterity, Charisma, Luck")
        
        attributes = {}
        remaining_points = 20
        
        for attr in ["Strength", "Intelligence", "Dexterity", "Charisma", "Luck"]:
            while True:
                try:
                    points = int(input(f"{attr} (0-10, {remaining_points} points remaining): "))
                    if 0 <= points <= min(10, remaining_points):
                        attributes[attr.lower()] = points
                        remaining_points -= points
                        break
                    else:
                        print(f"Invalid input. Please enter a value between 0 and {min(10, remaining_points)}.")
                except ValueError:
                    print("Please enter a number.")
        
        description = input("\nDescribe your character's appearance: ")
        
        # Initialize game using Modal function
        result = initialize_new_game.remote(world_key, name, attributes, description)
        print("\n" + result["introduction"])
        
        # Store game state
        game_state = result["game_state"]
        
        # Main game loop
        while True:
            user_action = input("\nWhat will you do? ")
            if user_action.lower() in ["quit", "exit"]:
                break
            
            # Process user action using Modal function
            result = run_game_turn.remote(
                world_key,
                {"name": name, "attributes": attributes, "description": description},
                game_state,
                user_action
            )
            
            print("\n" + result["response"])
            
            # Update game state
            game_state = result["game_state"]
    except EOFError:
        print("\nInput error detected. Try running 'python local_game.py' instead for a better command-line experience.")
    except Exception as e:
        print(f"\nError: {e}")
        print("Try running 'python local_game.py' instead for a better command-line experience.")
