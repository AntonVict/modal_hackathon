import os
from dotenv import load_dotenv
from game import AdventureGame
from image_generation import generate_images
# from image_generation import app
from flux_backend import *

# Load environment variables for Google API key
load_dotenv()

print(f"API Key loaded: {'GOOGLE_API_KEY' in os.environ}")  # Debug line

def main():
    """Run the game locally without Modal"""
    # Initialize game
    game = AdventureGame()
    
    # Simple CLI interface
    print("Welcome to the Adventure Game!")
    print("\nSelect a world:")
    for idx, (key, description) in enumerate(game.available_worlds.items(), 1):
        print(f"{idx}. {key.title()} - {description}")
    
    world_choice = int(input("\nEnter your choice (1-5): "))
    world_key = list(game.available_worlds.keys())[world_choice - 1]
    game.select_world(world_key)
    
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
    
    game.create_character(name, attributes, description)
    
    # Initialize game and display introduction
    intro = game.initialize_game()
    print("\n" + intro)
    
    # Main game loop
    while True:
        user_action = input("\nWhat will you do? ")
        
        # Check for special commands
        if user_action.lower() in ["quit", "exit"]:
            break
        elif user_action.lower() in ["status", "stats", "state"]:
            print("\n----- GAME STATUS -----")
            print(game.game_state.get_state_description())
            print("-----------------------")
            continue
        elif user_action.lower() in ["inventory", "items", "i"]:
            print("\n----- INVENTORY -----")
            if game.game_state.inventory:
                for i, item in enumerate(game.game_state.inventory, 1):
                    print(f"{i}. {item}")
            else:
                print("Your inventory is empty.")
            print("---------------------")
            continue
        elif user_action.lower() in ["help", "commands", "?"]:
            print("\n----- COMMANDS -----")
            print("status/stats - View your current game state")
            print("inventory/items/i - View your inventory")
            print("help/commands/? - Display this help message")
            print("quit/exit - Exit the game")
            print("--------------------")
            continue
        
        response = game.process_user_action(user_action)
        print("\n" + response)
        image_gen_prompt = "Generate an image with a scene of "+str(response)+\
            " and a character having the attributes of "+str(game.character.attributes)+\
                "and the description of "+str(game.character.description)+\
                " and a game world type of "+str(game.world_setting.world_type)      
        # Generate images based on game state
        with app.run():
            image_gen_main(image_gen_prompt)
            # generate_images.remote(
            #     game_response=response,
            #     character_attributes=str(game.character.attributes),
            #     character_description=game.character.description,
            #     world_type=game.world_setting.world_type
            # )

if __name__ == "__main__":
    main()
