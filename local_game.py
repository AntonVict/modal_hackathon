import os
from dotenv import load_dotenv
from game import AdventureGame
from flux_backend import *

# Load environment variables for Google API key
load_dotenv()


def main():
    """Run the game locally without Modal"""
    # Initialize game
    game = AdventureGame()
    
    # Simple CLI interface
    with app.run():
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
            character_skills = list(str(i) for i in list(game.character.attributes.keys()))
            power_levels = list(str(game.character.attributes[i]) for i in list(game.character.attributes.keys()))
            remaining_levels = [20-sum(list(int(x) for x in power_levels[:i])) for i in range(len(character_skills))]
            character_attr_prompt = ", ".join(character_skills[i]+" of "+power_levels[i]+" out of "+str(remaining_levels[i]) for i in range(len(character_skills)))
            image_gen_prompt = "Generate an image with a scene as follows: "+str(response[response.find("DESCRIPTION:")+12:response.find("OPTIONS")])+\
                " and a human cartoon character having the following attributes - "+str(character_attr_prompt)+\
                    ", and the cartoon character description as follows - "+str(game.character.description)+\
                    ", in a " +str(game.world_setting.world_type)+ " game world"
            # Generate images based on game state
            # with app.run():
            image_gen_main(image_gen_prompt)
            # generate_images.remote(
            #     game_response=response,
            #     character_attributes=str(game.character.attributes),
            #     character_description=game.character.description,
            #     world_type=game.world_setting.world_type
            # )

if __name__ == "__main__":
    main()
