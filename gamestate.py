from typing import List, Dict, Any
import re

class Location:
    def __init__(self, region: str, area: str, description: str = ""):
        self.region = region
        self.area = area
        self.description = description
    
    def __str__(self):
        return f"{self.region}: {self.area}"

class NPC:
    def __init__(self, name: str, description: str, dialogue: Dict[str, str] = None):
        self.name = name
        self.description = description
        self.dialogue = dialogue or {}
        self.disposition = 50  # 0-100 scale, 50 is neutral
    
    def __str__(self):
        return f"{self.name} - {self.description[:50]}..."

class GameState:
    def __init__(self, character, world_setting):
        self.character = character
        self.world_setting = world_setting
        self.inventory = []
        self.quest_log = []
        self.history = []
        
        # Initialize location based on world setting
        self.initialize_location()
        
        # Initialize NPCs
        self.npcs = {}
        self.active_npcs = []  # NPCs in the current location
        
        # Initialize other state variables
        self.health = 100
        self.gold = 50
        
    def initialize_location(self):
        """Set initial location based on world setting"""
        world_type = self.world_setting.world_type
        
        if world_type == "fantasy":
            self.location = Location("Kingdom of Eldoria", "Village of Riverdale", 
                                     "A peaceful village nestled between rolling hills and a serene river.")
        elif world_type == "space":
            self.location = Location("Alpha Centauri System", "Your Spaceship Bridge", 
                                     "The command center of your vessel, filled with blinking consoles and viewscreens.")
        elif world_type == "pirate":
            self.location = Location("Caribbean Sea", "Aboard the 'Sea Serpent'", 
                                     "The deck of your ship sways gently as waves lap against its hull.")
        elif world_type == "regular":
            self.location = Location("Metropolis City", "Downtown Apartment", 
                                     "Your modest but comfortable living space in the heart of the city.")
        elif world_type == "hackathon":
            self.location = Location("Stockholm", "Modal Hackathon Venue", 
                                     "A buzzing space filled with developers, venture capitalists, and Modal staff.")
        else:
            self.location = Location("Unknown", "Starting Area", 
                                     "A mysterious place where your adventure begins.")
    
    def add_to_inventory(self, item):
        """Add an item to character inventory"""
        self.inventory.append(item)
    
    def remove_from_inventory(self, item):
        """Remove an item from character inventory"""
        if item in self.inventory:
            self.inventory.remove(item)
            return True
        return False
    
    def add_quest(self, quest):
        """Add a new quest to the quest log"""
        self.quest_log.append(quest)
    
    def complete_quest(self, quest_name):
        """Mark a quest as completed"""
        for quest in self.quest_log:
            if quest["name"] == quest_name and not quest["completed"]:
                quest["completed"] = True
                return True
        return False
    
    def change_location(self, region, area, description=""):
        """Change the current location"""
        self.location = Location(region, area, description)
        self.update_active_npcs()
    
    def add_npc(self, npc_id, npc):
        """Add an NPC to the game world"""
        self.npcs[npc_id] = npc
    
    def update_active_npcs(self):
        """Update the list of NPCs in the current location"""
        # This would be implemented to determine which NPCs are in the current location
        # For now, it's a placeholder
        self.active_npcs = []
    
    def interact_with_npc(self, npc_id, interaction_type="talk"):
        """Interact with an NPC"""
        if npc_id in self.npcs:
            npc = self.npcs[npc_id]
            
            if interaction_type == "talk" and "default" in npc.dialogue:
                return npc.dialogue["default"]
            
            return f"You attempted to {interaction_type} with {npc.name}."
        
        return f"There is no one named {npc_id} here."
    
    def add_to_history(self, entry):
        """Add an entry to the game history"""
        self.history.append(entry)
    
    def get_recent_history(self, count=5):
        """Get the most recent history entries"""
        return "\n".join(self.history[-count:]) if self.history else "No history yet."
    
    def get_state_description(self):
        """Get a description of the current game state"""
        health_status = "Healthy" if self.health > 70 else "Injured" if self.health > 30 else "Critical"
        
        state = f"""
        Location: {self.location}
        Health: {self.health}/100 ({health_status})
        Gold: {self.gold}
        
        Inventory ({len(self.inventory)} items): {', '.join(self.inventory) if self.inventory else 'Empty'}
        
        Active Quests:
        {self._format_quests()}
        
        NPCs Present:
        {', '.join([npc for npc in self.active_npcs]) if self.active_npcs else 'None'}
        """
        
        return state
    
    def _format_quests(self):
        """Format quest log for display"""
        if not self.quest_log:
            return "No active quests."
        
        quest_strings = []
        for quest in self.quest_log:
            status = "✓" if quest.get("completed", False) else "⋯"
            quest_strings.append(f"{status} {quest['name']}")
        
        return "\n".join(quest_strings)
    
    def parse_state_changes(self, ai_response):
        """
        Parse the AI response to extract any state changes
        This is a simple implementation that would be expanded based on game needs
        """
        # Example: Detecting location changes
        location_match = re.search(r"LOCATION_CHANGE: ([^:]+):([^\n]+)", ai_response)
        if location_match:
            region, area = location_match.groups()
            self.change_location(region.strip(), area.strip())
        
        # Example: Detecting inventory additions
        item_add_match = re.search(r"INVENTORY_ADD: ([^\n]+)", ai_response)
        if item_add_match:
            item = item_add_match.group(1).strip()
            self.add_to_inventory(item)
        
        # Example: Detecting health changes
        health_match = re.search(r"HEALTH_CHANGE: ([+-]\d+)", ai_response)
        if health_match:
            health_change = int(health_match.group(1))
            self.health = max(0, min(100, self.health + health_change))
        
        # More parsing could be added for other state changes
