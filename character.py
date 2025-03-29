class Character:
    def __init__(self, name, attributes, description):
        self.name = name
        self.attributes = attributes
        self.description = description
        self.level = 1
        self.experience = 0
        self.skills = {}
        
    def get_attribute(self, attribute_name):
        """Get the value of a specific attribute"""
        return self.attributes.get(attribute_name.lower(), 0)
    
    def modify_attribute(self, attribute_name, value):
        """Modify a character attribute"""
        if attribute_name.lower() in self.attributes:
            self.attributes[attribute_name.lower()] += value
            # Ensure attributes stay within reasonable bounds (0-10)
            self.attributes[attribute_name.lower()] = max(0, min(10, self.attributes[attribute_name.lower()]))
            return True
        return False
    
    def add_skill(self, skill_name, level=1):
        """Add a new skill or upgrade existing skill"""
        self.skills[skill_name] = level
    
    def gain_experience(self, amount):
        """Add experience points and handle level ups"""
        self.experience += amount
        
        # Simple leveling formula: level = 1 + experience / 100
        new_level = 1 + self.experience // 100
        
        if new_level > self.level:
            level_gain = new_level - self.level
            self.level = new_level
            return f"Congratulations! You've advanced to level {self.level}!"
        
        return None
    
    def get_description(self):
        """Get a full description of the character"""
        attribute_desc = ", ".join([f"{attr.capitalize()}: {val}" for attr, val in self.attributes.items()])
        
        return f"""
        Name: {self.name}
        Level: {self.level} (XP: {self.experience})
        
        Attributes: {attribute_desc}
        
        Description: {self.description}
        
        Skills: {', '.join([f"{skill} (Lv.{level})" for skill, level in self.skills.items()]) if self.skills else "None"}
        """
