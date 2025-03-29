class WorldSettings:
    def __init__(self, world_type, description):
        self.world_type = world_type
        self.description = description
        self.regions = self._initialize_regions()
        
    def _initialize_regions(self):
        """Initialize regions based on world type"""
        regions = {}
        
        if self.world_type == "fantasy":
            regions = {
                "Kingdom of Eldoria": {
                    "description": "A vast realm of rolling hills, dense forests, and ancient castles.",
                    "areas": [
                        "Village of Riverdale", 
                        "Drakenwood Forest", 
                        "Castle Eldoria",
                        "Mountain Peaks",
                        "Mystical Caves"
                    ]
                },
                "Arcane Isles": {
                    "description": "A cluster of islands where magic flows freely and strange creatures abound.",
                    "areas": [
                        "Wizard's Academy",
                        "Whispering Beach",
                        "Elemental Shrine"
                    ]
                }
            }
        elif self.world_type == "space":
            regions = {
                "Alpha Centauri System": {
                    "description": "The closest star system to Earth, home to multiple habitable planets.",
                    "areas": [
                        "Your Spaceship Bridge",
                        "Space Station Centauri",
                        "Planet Proxima b"
                    ]
                },
                "Nebulon Cluster": {
                    "description": "A distant region of space filled with colorful nebulae and strange phenomena.",
                    "areas": [
                        "Asteroid Belt",
                        "Abandoned Research Facility",
                        "Alien Trading Post"
                    ]
                }
            }
        elif self.world_type == "pirate":
            regions = {
                "Caribbean Sea": {
                    "description": "Warm waters filled with islands, colonial outposts, and hidden treasures.",
                    "areas": [
                        "Aboard the 'Sea Serpent'",
                        "Port Royal",
                        "Skull Island",
                        "Treasure Cove"
                    ]
                },
                "Mediterranean": {
                    "description": "Ancient waters with rich history, powerful navies, and coastal fortresses.",
                    "areas": [
                        "Barbary Coast",
                        "Merchant Shipping Lanes",
                        "Naval Fortress"
                    ]
                }
            }
        elif self.world_type == "regular":
            regions = {
                "Metropolis City": {
                    "description": "A bustling modern city with towering skyscrapers and busy streets.",
                    "areas": [
                        "Downtown Apartment",
                        "Business District",
                        "City Park",
                        "Shopping Mall"
                    ]
                },
                "Countryside": {
                    "description": "Peaceful rural areas surrounding the city, with farms and small towns.",
                    "areas": [
                        "Small Town",
                        "Highway Rest Stop",
                        "Hiking Trails"
                    ]
                }
            }
        elif self.world_type == "hackathon":
            regions = {
                "Stockholm": {
                    "description": "The beautiful capital of Sweden, hosting the Modal hackathon.",
                    "areas": [
                        "Modal Hackathon Venue",
                        "Conference Rooms",
                        "Networking Area",
                        "Coffee Station",
                        "Stockholm Old Town"
                    ]
                },
                "Virtual Space": {
                    "description": "Online areas related to the hackathon experience.",
                    "areas": [
                        "Discord Server",
                        "Project Repository",
                        "Video Conference"
                    ]
                }
            }
        
        return regions
    
    def get_areas_in_region(self, region_name):
        """Get all areas within a specific region"""
        if region_name in self.regions:
            return self.regions[region_name]["areas"]
        return []
    
    def get_region_description(self, region_name):
        """Get the description of a specific region"""
        if region_name in self.regions:
            return self.regions[region_name]["description"]
        return "Unknown region"
    
    def is_valid_location(self, region, area):
        """Check if a location (region and area) is valid in this world"""
        if region in self.regions:
            return area in self.regions[region]["areas"]
        return False
