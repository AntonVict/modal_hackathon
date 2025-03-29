import os
import tkinter as tk
from tkinter import ttk, scrolledtext, StringVar, IntVar, messagebox, Toplevel
from PIL import Image, ImageTk
import threading
import time
from dotenv import load_dotenv
from game import AdventureGame
import ttkbootstrap as tb  # For modern UI

# Load environment variables
load_dotenv()

class AdventureGameGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("AI Adventure Game")
        self.root.geometry("1024x768")
        
        # Use ttkbootstrap theme
        self.style = tb.Style(theme="darkly")
        
        self.game = None
        self.story_history = []  # Store full story history
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the main UI components"""
        # Create a canvas with scrollbar for the entire UI
        self.canvas = tk.Canvas(self.root, bg="#1e1e1e")
        scrollbar = ttk.Scrollbar(self.root, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = ttk.Frame(self.canvas)
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(
                scrollregion=self.canvas.bbox("all")
            )
        )
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Main frame
        main_frame = ttk.Frame(self.scrollable_frame)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Configure frame rows and columns
        main_frame.grid_columnconfigure(0, weight=1)
        main_frame.grid_rowconfigure(0, weight=0)  # Image area
        main_frame.grid_rowconfigure(1, weight=1)  # Story area
        main_frame.grid_rowconfigure(2, weight=0)  # Options area
        main_frame.grid_rowconfigure(3, weight=0)  # Custom input area
        
        # Setup game views
        self.setup_welcome_view(main_frame)
        self.setup_character_creation_view(main_frame)
        self.setup_game_view(main_frame)
        
        # Show welcome view initially
        self.show_welcome_view()
        
        # Configure mouse wheel scrolling
        self.root.bind("<MouseWheel>", self._on_mousewheel)
        
    def _on_mousewheel(self, event):
        """Handle mouse wheel scrolling"""
        self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
    def setup_welcome_view(self, parent):
        """Setup the welcome screen with world selection"""
        self.welcome_frame = ttk.Frame(parent)
        
        # Add a logo or title with colored background
        title_frame = ttk.Frame(self.welcome_frame, style="Title.TFrame")
        title_frame.pack(fill=tk.X, pady=(0, 30))
        
        title_label = ttk.Label(title_frame, text="AI ADVENTURE", 
                        font=("Arial", 36, "bold"))
        title_label.pack(pady=(20, 5))
        
        subtitle_label = ttk.Label(title_frame, text="An Interactive Storytelling Experience", 
                        font=("Arial", 14))
        subtitle_label.pack(pady=(0, 30))
        
        # World selection buttons with better card design
        ttk.Label(self.welcome_frame, text="SELECT YOUR WORLD", 
                  font=("Arial", 18)).pack(pady=(0, 20))
        
        # Card container with better layout
        worlds_frame = ttk.Frame(self.welcome_frame)
        worlds_frame.pack(fill=tk.X, pady=10, padx=50)
        
        self.world_var = StringVar()
        
        worlds = [
            ("Fantasy", "fantasy", "A magical realm of dragons, wizards, and ancient mysteries."),
            ("Space", "space", "A futuristic universe where you navigate your spaceship through the stars."),
            ("Pirate", "pirate", "A world of high seas adventures, buried treasures, and naval battles."),
            ("Regular", "regular", "A modern-day setting in a bustling city with everyday challenges."),
            ("Hackathon", "hackathon", "You are attending the Modal hackathon in Stockholm.")
        ]
        
        # Create improved card-style buttons for world selection
        for i, (world_name, world_key, world_desc) in enumerate(worlds):
            card_frame = ttk.Frame(worlds_frame, style="Card.TFrame")
            card_frame.grid(row=i//3, column=i%3, padx=15, pady=15, sticky="nsew")
            
            # Card header with color based on world type
            card_header = ttk.Frame(card_frame, style=f"{world_key.capitalize()}.TFrame")
            card_header.pack(fill=tk.X)
            
            # World title
            world_title = ttk.Label(card_header, text=world_name, 
                                  font=("Arial", 16, "bold"),
                                  style=f"{world_key.capitalize()}.TLabel")
            world_title.pack(pady=(15, 15), padx=10)
            
            # World description
            desc_label = ttk.Label(card_frame, text=world_desc, 
                                 wraplength=220, justify="center",
                                 font=("Arial", 11))
            desc_label.pack(pady=15, padx=15, fill=tk.X)
            
            # Select button - styled based on world
            select_btn = ttk.Button(card_frame, text="Select",
                                   style=f"{world_key}.TButton",
                                   command=lambda k=world_key: self.select_world(k))
            select_btn.pack(pady=(5, 15), ipadx=10, ipady=5)
        
        for i in range(3):
            worlds_frame.columnconfigure(i, weight=1)
    
    def setup_character_creation_view(self, parent):
        """Setup the character creation screen"""
        self.character_frame = ttk.Frame(parent)
        
        ttk.Label(self.character_frame, text="CREATE YOUR CHARACTER", 
                  font=("Arial", 24, "bold")).pack(pady=(20, 30))
        
        # Character creation form
        form_frame = ttk.Frame(self.character_frame)
        form_frame.pack(fill=tk.BOTH, expand=True, padx=50)
        
        # Name input
        name_frame = ttk.Frame(form_frame)
        name_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(name_frame, text="Character Name:", 
                 font=("Arial", 14)).pack(side=tk.LEFT, padx=(0, 10))
        
        self.name_var = StringVar()
        name_entry = ttk.Entry(name_frame, textvariable=self.name_var, width=30, 
                              font=("Arial", 12))
        name_entry.pack(side=tk.LEFT, padx=5)
        
        # Attributes allocation
        attr_frame = ttk.Frame(form_frame)
        attr_frame.pack(fill=tk.X, pady=20)
        
        ttk.Label(attr_frame, text="ATTRIBUTE POINTS", 
                 font=("Arial", 16, "bold")).pack(anchor="w", pady=(0, 10))
        
        # Track remaining points
        points_frame = ttk.Frame(attr_frame)
        points_frame.pack(fill=tk.X, pady=(0, 15))
        
        ttk.Label(points_frame, text="Remaining Points:", 
                 font=("Arial", 12)).pack(side=tk.LEFT)
        
        self.remaining_points = IntVar(value=20)
        ttk.Label(points_frame, textvariable=self.remaining_points, 
                 font=("Arial", 14, "bold"), 
                 foreground="lime").pack(side=tk.LEFT, padx=5)
        
        # Attribute sliders
        self.attributes = {}
        attributes_list = ["Strength", "Intelligence", "Dexterity", "Charisma", "Luck"]
        
        for attr in attributes_list:
            attr_row = ttk.Frame(attr_frame)
            attr_row.pack(fill=tk.X, pady=8)
            
            # Equal spacing columns
            attr_row.columnconfigure(0, weight=1)
            attr_row.columnconfigure(1, weight=3)
            attr_row.columnconfigure(2, weight=1)
            
            ttk.Label(attr_row, text=f"{attr}:", 
                     font=("Arial", 12)).grid(row=0, column=0, sticky="w")
            
            self.attributes[attr.lower()] = IntVar()
            
            # Value display
            value_frame = ttk.Frame(attr_row)
            value_frame.grid(row=0, column=2, sticky="e")
            
            # Minus button
            minus_btn = ttk.Button(value_frame, text="-",
                                  style="danger.Outline.TButton",
                                  width=2,
                                  command=lambda a=attr.lower(): self.adjust_attr(a, -1))
            minus_btn.pack(side=tk.LEFT, padx=2)
            
            # Value display
            value_label = ttk.Label(value_frame, textvariable=self.attributes[attr.lower()], 
                                   font=("Arial", 12, "bold"), width=2)
            value_label.pack(side=tk.LEFT, padx=5)
            
            # Plus button
            plus_btn = ttk.Button(value_frame, text="+",
                                 style="success.Outline.TButton",
                                 width=2,
                                 command=lambda a=attr.lower(): self.adjust_attr(a, 1))
            plus_btn.pack(side=tk.LEFT, padx=2)
            
            # Progress bar for attribute visualization
            attr_progress = ttk.Progressbar(attr_row, orient="horizontal", 
                                          mode="determinate",
                                          variable=self.attributes[attr.lower()],
                                          maximum=10)
            attr_progress.grid(row=0, column=1, sticky="ew", padx=15)
        
        # Character description
        desc_frame = ttk.Frame(form_frame)
        desc_frame.pack(fill=tk.X, pady=20)
        
        ttk.Label(desc_frame, text="Character Description:", 
                 font=("Arial", 14)).pack(anchor="w", pady=(0, 10))
        
        self.description_var = StringVar()
        desc_entry = ttk.Entry(desc_frame, textvariable=self.description_var, 
                              font=("Arial", 12))
        desc_entry.pack(fill=tk.X, pady=5)
        
        # Create character button
        button_frame = ttk.Frame(self.character_frame)
        button_frame.pack(pady=30)
        
        create_button = ttk.Button(button_frame, text="Create Character & Start Adventure",
                                  style="success.TButton",
                                  command=self.create_character)
        create_button.pack(ipadx=20, ipady=10)
    
    def adjust_attr(self, attr, delta):
        """Adjust attribute value with buttons"""
        # Get current value
        current = self.attributes[attr].get()
        
        # Calculate total points currently used
        total_used = sum(self.attributes[a].get() for a in self.attributes)
        remaining = 20 - total_used
        
        # Check limits for increment
        if delta > 0 and remaining <= 0:
            return  # Can't increment if no points left
        
        # Check limits for decrement
        if delta < 0 and current <= 0:
            return  # Can't decrement below 0
        
        # Check upper limit
        if current + delta > 10:
            return  # Can't go above 10
            
        # Apply change
        self.attributes[attr].set(current + delta)
        
        # Update remaining
        self.update_points(attr)
    
    def setup_game_view(self, parent):
        """Setup the main game screen with image, story text, and options"""
        self.game_frame = ttk.Frame(parent)
        
        # Top navbar with game commands - enhanced with icons and better spacing
        self.navbar_frame = ttk.Frame(self.game_frame, style="Navbar.TFrame")
        self.navbar_frame.pack(fill=tk.X, pady=(0, 15))
        
        # Create a left section for game controls
        left_section = ttk.Frame(self.navbar_frame)
        left_section.pack(side=tk.LEFT, fill=tk.Y)
        
        commands = [
            ("Status", lambda: self.show_popup("Status", self.get_status_content)),
            ("Inventory", lambda: self.show_popup("Inventory", self.get_inventory_content)),
            ("Help", lambda: self.show_popup("Help", self.get_help_content)),
            ("History", self.show_history_popup)
        ]
        
        for text, cmd in commands:
            cmd_button = ttk.Button(left_section, text=text,
                                   style="info.Outline.TButton",
                                   command=cmd)
            cmd_button.pack(side=tk.LEFT, padx=5, pady=5)
        
        # Create right section for new game button
        right_section = ttk.Frame(self.navbar_frame)
        right_section.pack(side=tk.RIGHT, fill=tk.Y)
        
        new_game_btn = ttk.Button(right_section, text="New Game",
                                 style="danger.TButton",
                                 command=self.new_game)
        new_game_btn.pack(side=tk.RIGHT, padx=10, pady=5)
        
        # Main content area with better padding
        content_frame = ttk.Frame(self.game_frame)
        content_frame.pack(fill=tk.BOTH, expand=True, padx=15)
        
        # Image area with border and better styling
        self.image_frame = ttk.Frame(content_frame, style="Image.TFrame")
        self.image_frame.pack(fill=tk.X, pady=10)
        
        # Default placeholder image
        self.placeholder_img = tk.PhotoImage(width=800, height=400)
        self.image_label = ttk.Label(self.image_frame, image=self.placeholder_img, 
                                    style="Image.TLabel")
        self.image_label.pack(padx=10, pady=10)
        
        # Story text area with better styling
        self.story_frame = ttk.Frame(content_frame)
        self.story_frame.pack(fill=tk.BOTH, expand=True, pady=15)
        
        # Story header
        story_header = ttk.Frame(self.story_frame, style="StoryHeader.TFrame")
        story_header.pack(fill=tk.X)
        
        story_title = ttk.Label(story_header, text="STORY", 
                               font=("Arial", 14, "bold"))
        story_title.pack(pady=8)
        
        # Story content
        self.story_text = scrolledtext.ScrolledText(self.story_frame, wrap=tk.WORD, 
                                                  width=80, height=10, 
                                                  font=("Arial", 12),
                                                  bg="#2d2d2d", fg="#ffffff",
                                                  padx=15, pady=15)
        self.story_text.pack(fill=tk.BOTH, expand=True)
        self.story_text.config(state=tk.DISABLED)
        
        # Options area with better styling
        options_container = ttk.Frame(content_frame)
        options_container.pack(fill=tk.X, pady=15)
        
        options_header = ttk.Frame(options_container, style="OptionsHeader.TFrame")
        options_header.pack(fill=tk.X)
        
        options_title = ttk.Label(options_header, text="ACTIONS", 
                                font=("Arial", 14, "bold"))
        options_title.pack(pady=8)
        
        self.options_frame = ttk.Frame(options_container)
        self.options_frame.pack(fill=tk.X, pady=5)
        
        # We'll create option buttons dynamically - only create 3 instead of 4
        self.option_buttons = []
        for i in range(3):
            option_button = ttk.Button(self.options_frame, text=f"Option {i+1}",
                                      style="primary.TButton",
                                      command=lambda idx=i: self.select_option(idx))
            option_button.pack(fill=tk.X, pady=4, ipady=5, padx=10)
            self.option_buttons.append(option_button)
        
        # Custom action area with better styling
        self.action_frame = ttk.Frame(content_frame)
        self.action_frame.pack(fill=tk.X, pady=15, padx=10)
        
        # Custom action label
        action_label = ttk.Label(self.action_frame, text="CUSTOM ACTION:", 
                               font=("Arial", 12, "bold"))
        action_label.pack(side=tk.LEFT, padx=(0, 10))
        
        self.action_var = StringVar()
        action_entry = ttk.Entry(self.action_frame, textvariable=self.action_var, 
                               font=("Arial", 12))
        action_entry.insert(0, "Type your own action")
        action_entry.bind("<FocusIn>", lambda e: action_entry.delete(0, tk.END) if action_entry.get() == "Type your own action" else None)
        action_entry.bind("<FocusOut>", lambda e: action_entry.insert(0, "Type your own action") if not action_entry.get() else None)
        action_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        
        action_button = ttk.Button(self.action_frame, text="Submit",
                                  style="success.TButton",
                                  command=self.submit_custom_action)
        action_button.pack(side=tk.RIGHT, ipadx=10, ipady=2)

    def get_status_content(self):
        """Get the current status content for popup"""
        if not self.game:
            return "No active game."
        return self.game.game_state.get_state_description()
    
    def get_inventory_content(self):
        """Get the inventory content for popup"""
        if not self.game:
            return "No active game."
        
        inventory = self.game.game_state.inventory
        if not inventory:
            return "Your inventory is empty."
        
        return "\n".join([f"• {item}" for item in inventory])
    
    def get_help_content(self):
        """Get help content for popup"""
        return """Available Commands:

• Status - View your current game state
• Inventory - View your inventory
• Help - Display this help message
• History - View the full story history
• New Game - Start a new game

You can also click on action buttons or type your own custom action."""
    
    def show_popup(self, title, content_func):
        """Show a popup with given title and content function"""
        popup = Toplevel(self.root)
        popup.title(title)
        popup.geometry("500x500")
        popup.transient(self.root)  # Set to be on top of the main window
        popup.grab_set()  # Modal
        
        # Configure the popup with better styling
        popup_frame = ttk.Frame(popup, padding=20)
        popup_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title with colored header
        title_frame = ttk.Frame(popup_frame, style="PopupTitle.TFrame")
        title_frame.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(title_frame, text=title, 
                 font=("Arial", 18, "bold")).pack(pady=15)
        
        # Content with better scrolled text
        content = content_func()
        content_text = scrolledtext.ScrolledText(popup_frame, wrap=tk.WORD, 
                                               width=50, height=15, 
                                               font=("Arial", 12),
                                               padx=15, pady=15)
        content_text.pack(fill=tk.BOTH, expand=True, pady=(0, 20))
        
        # Parse markdown-like formatting in the content
        self._format_text_widget(content_text, content)
        content_text.config(state=tk.DISABLED)
        
        # Close button centered and better styled
        button_frame = ttk.Frame(popup_frame)
        button_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Button(button_frame, text="Close", 
                  style="danger.TButton",
                  command=popup.destroy).pack(ipadx=20, ipady=5)
    
    def _format_text_widget(self, text_widget, content):
        """Apply markdown-like formatting to a text widget"""
        # Configure text tags for formatting
        text_widget.tag_configure("bold", font=("Arial", 12, "bold"))
        text_widget.tag_configure("italic", font=("Arial", 12, "italic"))
        text_widget.tag_configure("underline", underline=True)
        text_widget.tag_configure("title", font=("Arial", 14, "bold"), foreground="#3498db")
        text_widget.tag_configure("bullet", lmargin1=20, lmargin2=30)
        
        # Insert and format content
        lines = content.split('\n')
        for line in lines:
            # Check for bullet points
            if line.strip().startswith('•'):
                text_widget.insert(tk.END, line + '\n', "bullet")
                continue
                
            # Process inline formatting
            i = 0
            start_idx = text_widget.index(tk.END + "-1c")  # Current end position
            
            text_widget.insert(tk.END, line + '\n')
            end_idx = text_widget.index(tk.END + "-1c")
            
            # Apply bold formatting
            while '**' in line:
                bold_start = line.find('**')
                if bold_start != -1:
                    bold_end = line.find('**', bold_start + 2)
                    if bold_end != -1:
                        # Calculate positions in text widget
                        start_pos = f"{start_idx} + {bold_start} chars"
                        end_pos = f"{start_idx} + {bold_end + 2} chars"
                        
                        # Apply tag
                        text_widget.tag_add("bold", start_pos, end_pos)
                        
                        # Remove the markers from search
                        line = line[:bold_start] + "  " + line[bold_start+2:bold_end] + "  " + line[bold_end+2:]
                    else:
                        break
                else:
                    break
            
            # Apply italic formatting
            while '_' in line:
                it_start = line.find('_')
                if it_start != -1:
                    it_end = line.find('_', it_start + 1)
                    if it_end != -1:
                        # Calculate positions in text widget
                        start_pos = f"{start_idx} + {it_start} chars"
                        end_pos = f"{start_idx} + {it_end + 1} chars"
                        
                        # Apply tag
                        text_widget.tag_add("italic", start_pos, end_pos)
                        
                        # Remove the markers from search
                        line = line[:it_start] + " " + line[it_start+1:it_end] + " " + line[it_end+1:]
                    else:
                        break
                else:
                    break

    def show_history_popup(self):
        """Show a popup with the complete story history"""
        popup = Toplevel(self.root)
        popup.title("Story History")
        popup.geometry("700x500")
        popup.transient(self.root)
        popup.grab_set()
        
        # Configure the popup
        popup_frame = ttk.Frame(popup, padding=20)
        popup_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        ttk.Label(popup_frame, text="Complete Story History", 
                 font=("Arial", 18, "bold")).pack(pady=(0, 20))
        
        # History content
        history_text = scrolledtext.ScrolledText(popup_frame, wrap=tk.WORD, 
                                               width=80, height=20, 
                                               font=("Arial", 12))
        history_text.pack(fill=tk.BOTH, expand=True, pady=(0, 20))
        
        for entry in self.story_history:
            history_text.insert(tk.END, f"{entry}\n\n")
        
        history_text.config(state=tk.DISABLED)
        
        # Close button
        ttk.Button(popup_frame, text="Close", 
                  style="danger.TButton",
                  command=popup.destroy).pack(pady=(0, 10))
    
    # Navigation methods
    def show_welcome_view(self):
        """Show the welcome screen with world selection"""
        self.character_frame.pack_forget() if hasattr(self, 'character_frame') else None
        self.game_frame.pack_forget() if hasattr(self, 'game_frame') else None
        self.welcome_frame.pack(fill=tk.BOTH, expand=True)
    
    def show_character_creation(self):
        """Show the character creation screen"""
        self.welcome_frame.pack_forget()
        self.game_frame.pack_forget() if hasattr(self, 'game_frame') else None
        self.character_frame.pack(fill=tk.BOTH, expand=True)
    
    def show_game_view(self):
        """Show the main game screen"""
        self.welcome_frame.pack_forget() if hasattr(self, 'welcome_frame') else None
        self.character_frame.pack_forget() if hasattr(self, 'character_frame') else None
        self.game_frame.pack(fill=tk.BOTH, expand=True)
    
    # Game logic methods
    def select_world(self, world_key):
        """Handle world selection"""
        self.world_key = world_key
        self.show_character_creation()
    
    def update_points(self, attr):
        """Update remaining points when attributes are changed"""
        # Calculate total points allocated
        total_allocated = sum(self.attributes[a].get() for a in self.attributes)
        
        # If over 20, reduce the current attribute
        if total_allocated > 20:
            current_val = self.attributes[attr].get()
            self.attributes[attr].set(current_val - (total_allocated - 20))
            total_allocated = 20
        
        # Update remaining points
        self.remaining_points.set(20 - total_allocated)
    
    def create_character(self):
        """Create character and start the game"""
        name = self.name_var.get()
        if not name:
            # Show error - name is required
            messagebox.showerror("Error", "Character name is required.")
            return
        
        # Collect attributes
        attributes = {attr: self.attributes[attr].get() for attr in self.attributes}
        description = self.description_var.get() or f"A brave adventurer named {name}"
        
        # Initialize game
        self.game = AdventureGame()
        self.game.select_world(self.world_key)
        self.game.create_character(name, attributes, description)
        
        # Reset story history
        self.story_history = []
        
        # Start game and get initial story
        initial_story = self.game.initialize_game()
        
        # Switch to game view
        self.show_game_view()
        
        # Update UI with initial story
        self.update_story_text(initial_story)
        self.update_options(initial_story)
        
        # Store in history
        self.story_history.append(initial_story)
        
        # Load placeholder image for now
        # In the future, this would generate an image based on the story
        self.update_game_image()
    
    def update_story_text(self, story_text, stream=False):
        """Update the story text area with the latest narrative"""
        # Extract description part
        if "DESCRIPTION:" in story_text:
            description = story_text.split("DESCRIPTION:")[1].split("OPTIONS:")[0].strip()
        else:
            description = story_text
            
        # Clear previous content
        self.story_text.config(state=tk.NORMAL)
        self.story_text.delete(1.0, tk.END)
        
        # Configure text tags for formatting
        self.story_text.tag_configure("bold", font=("Arial", 12, "bold"))
        self.story_text.tag_configure("italic", font=("Arial", 12, "italic"))
        self.story_text.tag_configure("underline", underline=True)
        self.story_text.tag_configure("title", font=("Arial", 14, "bold"), foreground="#3498db")
        self.story_text.tag_configure("action", font=("Arial", 12, "italic"), foreground="#2ecc71")
        self.story_text.tag_configure("warning", foreground="#e74c3c")
        
        if stream:
            # Process and stream the text character by character
            buffer = ""
            i = 0
            while i < len(description):
                char = description[i]
                
                # Check for formatting markers
                if char == '*' and i+1 < len(description) and description[i+1] == '*':
                    # Process bold text
                    end_marker = description.find('**', i+2)
                    if end_marker != -1:
                        # First insert the buffer
                        self._insert_with_delay(buffer)
                        buffer = ""
                        
                        # Get the bold text
                        bold_text = description[i+2:end_marker]
                        self._insert_with_delay(bold_text, "bold")
                        
                        # Skip past the processed part
                        i = end_marker + 2
                        continue
                
                elif char == '_' and i+1 < len(description) and description[i+1] != '_':
                    # Process italic text
                    end_marker = description.find('_', i+1)
                    if end_marker != -1:
                        # First insert the buffer
                        self._insert_with_delay(buffer)
                        buffer = ""
                        
                        # Get the italic text
                        italic_text = description[i+1:end_marker]
                        self._insert_with_delay(italic_text, "italic")
                        
                        # Skip past the processed part
                        i = end_marker + 1
                        continue
                        
                elif char == '`':
                    # Process special action text
                    end_marker = description.find('`', i+1)
                    if end_marker != -1:
                        # First insert the buffer
                        self._insert_with_delay(buffer)
                        buffer = ""
                        
                        # Get the action text
                        action_text = description[i+1:end_marker]
                        self._insert_with_delay(action_text, "action")
                        
                        # Skip past the processed part
                        i = end_marker + 1
                        continue
                
                # Add character to buffer
                buffer += char
                i += 1
            
            # Insert any remaining buffer
            if buffer:
                self._insert_with_delay(buffer)
                
        else:
            # Process all formatting at once for non-streaming mode
            processed_text = description
            self.story_text.insert(tk.END, processed_text)
        
        # Disable editing
        self.story_text.config(state=tk.DISABLED)
    
    def _insert_with_delay(self, text, tag=None):
        """Insert text with a delay for streaming effect, applying tag if specified"""
        if tag:
            self.story_text.insert(tk.END, text, tag)
        else:
            self.story_text.insert(tk.END, text)
        self.story_text.see(tk.END)
        self.story_text.update_idletasks()
        time.sleep(0.01)  # Adjust speed as needed

    def update_options(self, story_text):
        """Update the option buttons based on available choices"""
        options = []
        
        # Extract options if they exist
        if "OPTIONS:" in story_text:
            options_text = story_text.split("OPTIONS:")[1].strip()
            lines = options_text.split("\n")
            
            for line in lines:
                if line.strip() and any(line.strip().startswith(str(i)) for i in range(1, 4)):  # Only look for options 1-3
                    option_text = line.strip()[2:].strip()  # Remove number and dot
                    options.append(option_text)
        
        # Update buttons with options or hide if not available
        for i, button in enumerate(self.option_buttons):
            if i < len(options):
                button.config(text=options[i], state=tk.NORMAL)
            else:
                button.config(text="", state=tk.DISABLED)
    
    def update_game_image(self, image_path=None):
        """Update the game image area with a new image
        In the future, this would use Modal to generate images"""
        if image_path and os.path.exists(image_path):
            try:
                img = Image.open(image_path)
                img = img.resize((800, 400), Image.LANCZOS)
                photo = ImageTk.PhotoImage(img)
                self.image_label.config(image=photo)
                self.image_label.image = photo  # Keep reference
            except Exception as e:
                print(f"Error loading image: {e}")
        else:
            # Use a placeholder with text
            self.image_label.config(image=self.placeholder_img)
            self.image_label.image = self.placeholder_img
    
    def select_option(self, option_idx):
        """Handle selection of a predefined option"""
        if not self.game:
            return
            
        option_text = self.option_buttons[option_idx].cget("text")
        if option_text:
            self.process_action(option_text)
    
    def submit_custom_action(self):
        """Handle custom action input"""
        action = self.action_var.get()
        if action and action != "Type your own action":
            self.process_action(action)
            self.action_var.set("")  # Clear input field
            
            # Set focus back to entry with empty text
            for widget in self.action_frame.winfo_children():
                if isinstance(widget, ttk.Entry):
                    widget.focus_set()
    
    def execute_command(self, command):
        """Execute a game command (status, inventory, help)"""
        if self.game:
            self.process_action(command)
    
    def process_action(self, action):
        """Process player action and update the game"""
        if not self.game:
            return
        
        # Show a thinking indicator
        self.story_text.config(state=tk.NORMAL)
        self.story_text.delete(1.0, tk.END)
        self.story_text.insert(tk.END, f"> {action}\n\n", "action")
        self.story_text.insert(tk.END, "Thinking...", "italic")
        self.story_text.config(state=tk.DISABLED)
        
        # Disable buttons while processing
        for button in self.option_buttons:
            button.config(state=tk.DISABLED)
        
        # Process the action in a separate thread to avoid UI freezing
        def process_thread():
            # Get response from game
            response = self.game.process_user_action(action)
            
            # Add to history with formatting
            self.story_history.append(f"> **{action}**\n\n{response}")
            
            # Update UI on the main thread
            self.root.after(0, lambda: self.update_story_text(response, stream=True))
            self.root.after(0, lambda: self.update_options(response))
            self.root.after(0, lambda: self.update_game_image())  # Future: generate image here
        
        threading.Thread(target=process_thread).start()
    
    def new_game(self):
        """Start a new game"""
        if messagebox.askyesno("New Game", "Are you sure you want to start a new game? All progress will be lost."):
            self.show_welcome_view()
            self.game = None
            self.story_history = []
            
            # Reset game state
            self.story_text.config(state=tk.NORMAL)
            self.story_text.delete(1.0, tk.END)
            self.story_text.config(state=tk.DISABLED)
            
            for button in self.option_buttons:
                button.config(text="", state=tk.DISABLED)


def main():
    root = tk.Tk()
    app = AdventureGameGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()