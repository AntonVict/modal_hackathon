import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import GlobalStyles from './components/styles/GlobalStyles';
import { theme } from './components/styles/Theme';
import GameContext from './components/context/GameContext';
import WelcomeScreen from './components/WelcomeScreen';
import CharacterCreation from './components/CharacterCreation';
import GameScreen from './components/GameScreen';

function App() {
  // Game state
  const [sessionId, setSessionId] = useState(() => {
    // Get existing session ID from localStorage or create a new one
    const savedSessionId = localStorage.getItem('sessionId');
    const newSessionId = savedSessionId || uuidv4();
    
    // Always save to localStorage to ensure consistency
    localStorage.setItem('sessionId', newSessionId);
    console.log("Using session ID:", newSessionId);
    return newSessionId;
  });
  
  const [stage, setStage] = useState('welcome'); // 'welcome', 'character', 'game'
  const [worlds, setWorlds] = useState([]);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [character, setCharacter] = useState(null);
  const [gameState, setGameState] = useState({
    story: '',
    description: '',
    options: [],
    history: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load available worlds when component mounts
  useEffect(() => {
    const fetchWorlds = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/worlds');
        const data = await response.json();
        setWorlds(data.worlds);
      } catch (err) {
        console.error('Error fetching worlds:', err);
        setError('Failed to load game worlds. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorlds();
  }, [sessionId]);

  // Handle world selection
  const selectWorld = (world) => {
    setSelectedWorld(world);
    setStage('character');
  };

  // Handle character creation
  const createCharacter = async (characterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/character/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          worldKey: selectedWorld.key,
          ...characterData
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCharacter(data.character);
      
      // Initialize game
      const gameResponse = await fetch('/api/game/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId
        }),
      });
      
      const gameData = await gameResponse.json();
      
      if (gameData.error) {
        throw new Error(gameData.error);
      }
      
      setGameState({
        story: gameData.story,
        description: gameData.description,
        options: gameData.options,
        history: [gameData.description]
      });
      
      setStage('game');
    } catch (err) {
      console.error('Error creating character:', err);
      setError(err.message || 'Failed to create character. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle player action
  const processAction = async (action) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/game/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          action
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Update game state with new info
      setGameState(prev => ({
        story: data.story,
        description: data.description,
        options: data.options,
        history: [...prev.history, `> ${action}`, data.description]
      }));
    } catch (err) {
      console.error('Error processing action:', err);
      setError(err.message || 'Failed to process action. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get game status
  const getStatus = async () => {
    try {
      const response = await fetch(`/api/game/status?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.status;
    } catch (err) {
      console.error('Error getting status:', err);
      setError(err.message || 'Failed to get game status.');
      return 'Unable to retrieve status';
    }
  };

  // Get inventory
  const getInventory = async () => {
    try {
      const response = await fetch(`/api/game/inventory?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.inventory;
    } catch (err) {
      console.error('Error getting inventory:', err);
      setError(err.message || 'Failed to get inventory.');
      return [];
    }
  };

  // Start a new game
  const startNewGame = () => {
    setStage('welcome');
    setSelectedWorld(null);
    setCharacter(null);
    setGameState({
      story: '',
      description: '',
      options: [],
      history: []
    });
  };

  // Set up context value
  const contextValue = {
    sessionId,
    worlds,
    selectedWorld,
    character,
    gameState,
    isLoading,
    error,
    selectWorld,
    createCharacter,
    processAction,
    getStatus,
    getInventory,
    startNewGame
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <GameContext.Provider value={contextValue}>
        {stage === 'welcome' && <WelcomeScreen />}
        {stage === 'character' && <CharacterCreation />}
        {stage === 'game' && <GameScreen />}
      </GameContext.Provider>
    </ThemeProvider>
  );
}

export default App;
