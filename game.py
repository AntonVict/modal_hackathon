import os
from dotenv import load_dotenv
from langchain.chains import LLMChain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from gamestate import GameState
from character import Character
from world_settings import WorldSettings

# Load environment variables (for API keys)
load_dotenv()

class AdventureGame:
    def __init__(self):
        self.available_worlds = {
            "fantasy": "A magical realm of dragons, wizards, and ancient mysteries.",
            "space": "A futuristic universe where you navigate your spaceship through the stars.",
            "pirate": "A world of high seas adventures, buried treasures, and naval battles.",
            "regular": "A modern-day setting in a bustling city with everyday challenges.",
            "hackathon": "You are attending the Modal hackathon in Stockholm, hosted by venture capital firms and the cloud computing company."
        }
        
        self.character = None
        self.world_setting = None
        self.game_state = None
        
        # Initialize LLM using Google Gemini
        print(f"API Key loaded in game.py: {'GOOGLE_API_KEY' in os.environ}")  # Debug line
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.7, google_api_key="AIzaSyA2OiiBJAqq66r_m6mrIPRa0LRU7J7a734") # Add location parameter)
        
    def select_world(self, world_key):
        """Select a predefined world setting"""
        if world_key not in self.available_worlds:
            raise ValueError(f"Unknown world: {world_key}")
        
        self.world_setting = WorldSettings(world_key, self.available_worlds[world_key])
        return self.world_setting
    
    def create_character(self, name, attributes, description):
        """Create a character with the given attributes"""
        self.character = Character(name, attributes, description)
        return self.character
    
    def initialize_game(self):
        """Initialize the game state based on character and world"""
        if not self.character or not self.world_setting:
            raise ValueError("Character and world setting must be created before initializing the game")
        
        self.game_state = GameState(self.character, self.world_setting)
        
        # Create storyteller prompt
        self.storyteller_template = PromptTemplate(
            input_variables=["game_state", "character", "world", "history", "user_input"],
            template="""
            You are the AI storyteller for an adventure game set in {world}.
            
            # Current Game State:
            {game_state}
            
            # Character Information:
            {character}
            
            # History:
            {history}
            
            # User Action:
            {user_input}
            
            Respond with:
            1. A vivid description of what happens based on the user's action
            2. Three specific choice options for the player
            3. A reminder that they can also type a custom action
            
            Format your response as:
            DESCRIPTION: [your detailed narrative here]
            
            OPTIONS:
            1. [option 1]
            2. [option 2]
            3. [option 3]
            4. [Type your own action]
            """
        )
        
        self.storyteller_chain = LLMChain(
            llm=self.llm,
            prompt=self.storyteller_template,
            verbose=True
        )
        
        # Generate initial story introduction
        initial_story = self.generate_introduction()
        self.game_state.add_to_history("STORYTELLER: " + initial_story)
        
        return initial_story
    
    def generate_introduction(self):
        """Generate the initial story introduction"""
        intro_template = PromptTemplate(
            input_variables=["character", "world"],
            template="""
            Create an engaging introduction for a game where:
            
            World Setting: {world}
            Player Character: {character}
            
            Create a vivid opening scene that:
            1. Describes the world and immediate surroundings
            2. Establishes the character's initial situation
            3. Hints at possible adventures or challenges ahead
            4. Ends with three specific choices the player can make
            

            Have the text be about 200 words, not more.
            Format your response as:
            DESCRIPTION: [your detailed introduction here]
            
            OPTIONS:
            1. [option 1]
            2. [option 2]
            3. [option 3]
            4. [Type your own action]
            """
        )
        
        intro_chain = LLMChain(
            llm=self.llm,
            prompt=intro_template,
            verbose=True
        )
        
        response = intro_chain.run(
            character=self.character.get_description(),
            world=self.world_setting.description
        )
        
        return response
    
    def process_user_action(self, user_input):
        """Process the user's chosen action and update the game state"""
        # Check for special commands
        if user_input.lower() in ["status", "stats", "state"]:
            self.game_state.add_to_history(f"PLAYER: {user_input}")
            status_response = f"DESCRIPTION: Here's your current status:\n\n{self.game_state.get_state_description()}\n\nOPTIONS:\n1. Continue your adventure\n2. Check your inventory\n3. Look around\n4. [Type your own action]"
            self.game_state.add_to_history(f"STORYTELLER: {status_response}")
            return status_response
            
        if user_input.lower() in ["inventory", "items", "i"]:
            self.game_state.add_to_history(f"PLAYER: {user_input}")
            inventory_list = "\n".join([f"- {item}" for item in self.game_state.inventory]) if self.game_state.inventory else "Your inventory is empty."
            inventory_response = f"DESCRIPTION: You check your belongings:\n\n{inventory_list}\n\nOPTIONS:\n1. Continue your adventure\n2. Use an item\n3. Look around\n4. [Type your own action]"
            self.game_state.add_to_history(f"STORYTELLER: {inventory_response}")
            return inventory_response
            
        if user_input.lower() in ["help", "commands", "?"]:
            self.game_state.add_to_history(f"PLAYER: {user_input}")
            help_response = """DESCRIPTION: Available commands:
            
- status/stats - View your current game state
- inventory/items/i - View your inventory
- help/commands/? - Display this help message
- quit/exit - Exit the game

You can also type any action you want to perform.

OPTIONS:
1. Continue your adventure
2. Check your status
3. Check your inventory
4. [Type your own action]"""
            self.game_state.add_to_history(f"STORYTELLER: {help_response}")
            return help_response
        
        # Parse user input and update game state accordingly
        self.game_state.add_to_history(f"PLAYER: {user_input}")
        
        # Generate response using LLM
        response = self.storyteller_chain.run(
            game_state=self.game_state.get_state_description(),
            character=self.character.get_description(),
            world=self.world_setting.description,
            history=self.game_state.get_recent_history(5),
            user_input=user_input
        )
        
        # Update game state with AI response
        self.game_state.add_to_history(f"STORYTELLER: {response}")
        
        # Parse any state changes from the AI response
        self.game_state.parse_state_changes(response)
        
        return response

def main():
    # Initialize game
    game = AdventureGame()
    
    # Simple CLI interface for testing
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
            points = int(input(f"{attr} (0-10, {remaining_points} points remaining): "))
            if 0 <= points <= min(10, remaining_points):
                attributes[attr.lower()] = points
                remaining_points -= points
                break
            else:
                print(f"Invalid input. Please enter a value between 0 and {min(10, remaining_points)}.")
    
    description = input("\nDescribe your character's appearance: ")
    
    game.create_character(name, attributes, description)
    
    # Initialize game and display introduction
    intro = game.initialize_game()
    print("\n" + intro)
    
    # Main game loop
    while True:
        user_action = input("\nWhat will you do? ")
        if user_action.lower() in ["quit", "exit"]:
            break
        
        response = game.process_user_action(user_action)
        print("\n" + response)

if __name__ == "__main__":
    main()
