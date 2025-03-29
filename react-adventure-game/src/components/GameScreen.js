import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import GameContext from './context/GameContext';
import MusicPlayer from './MusicPlayer';
import {
  PageWrapper,
  Container,
  GameHeader,
  ImageContainer,
  StoryText,
  OptionButton,
  Button,
  Flex,
  LoadingSpinner,
  Notification,
  Modal,
  ModalContent,
  CloseButton,
  Title,
  Subtitle,
  Paragraph,
  Input,
  Card
} from './styles/StyledComponents';

const GameScreen = () => {
  const {
    sessionId,
    selectedWorld,
    character,
    gameState,
    isLoading,
    error,
    processAction,
    getInventory: apiGetInventory,
    getStatus: apiGetStatus,
    startNewGame
  } = useContext(GameContext);
  
  // Local state
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [customAction, setCustomAction] = useState('');
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [gold, setGold] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [gameImage, setGameImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(null);
  
  // References
  const storyTextRef = useRef(null);
  
  // Text streaming configuration
  const streamingSpeed = 20; // ms between updates
  const charsPerUpdate = 3; // characters to reveal per update
  const [streamProgress, setStreamProgress] = useState(0);

  // Option to enable typing effect
  const useTypingEffect = true;
  
  // Skip text streaming and show full text immediately
  const handleSkipTyping = () => {
    if (gameState.description) {
      setStreamProgress(gameState.description.length);
      
      // Scroll to the bottom
      if (storyTextRef.current) {
        storyTextRef.current.scrollTop = storyTextRef.current.scrollHeight;
      }
    }
  };

  // Custom useInterval hook for reliable intervals in React
  function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  // Reset streaming progress when description changes
  useEffect(() => {
    if (gameState.description) {
      if (!useTypingEffect) {
        // If typing effect is disabled, show full text immediately
        setStreamProgress(gameState.description.length);
      } else {
        // Otherwise start streaming from the beginning
        setStreamProgress(0);
      }
    }
  }, [gameState.description, useTypingEffect]);
  
  // Update displayed text based on streaming progress
  useEffect(() => {
    if (gameState.description) {
      setDisplayedText(gameState.description.substring(0, streamProgress));
      
      // Scroll to bottom whenever text updates
      if (storyTextRef.current) {
        storyTextRef.current.scrollTop = storyTextRef.current.scrollHeight;
      }
    }
  }, [gameState.description, streamProgress]);
  
  // Advance streaming progress at fixed intervals
  useInterval(() => {
    if (gameState.description && streamProgress < gameState.description.length) {
      setStreamProgress(prev => Math.min(prev + charsPerUpdate, gameState.description.length));
    }
  }, useTypingEffect ? streamingSpeed : null);
  
  // Check if still streaming
  const isStreaming = useTypingEffect && gameState.description && 
    streamProgress < gameState.description.length;
  
  // Handle player action
  const handleOptionSelect = (option) => {
    if (isLoading) return;
    processAction(option);
  };

  // Handle custom action submission
  const handleCustomAction = (e) => {
    e.preventDefault();
    if (isLoading || !customAction.trim()) return;
    
    processAction(customAction);
    setCustomAction('');
  };

  // Process state changes received from API
  const handleStateChanges = (stateChanges) => {
    if (!stateChanges) return;
    
    let message = '';
    
    // Handle gold changes
    if (stateChanges.gold) {
      const goldChange = parseInt(stateChanges.gold);
      if (goldChange > 0) {
        message += `Gained ${goldChange} gold. `;
      } else if (goldChange < 0) {
        message += `Lost ${Math.abs(goldChange)} gold. `;
      }
      
      // Update gold state
      setGold(prevGold => prevGold + goldChange);
    }
    
    // Handle inventory additions
    if (stateChanges.inventory_add && stateChanges.inventory_add.length > 0) {
      const items = stateChanges.inventory_add.join(', ');
      message += `Added to inventory: ${items}. `;
      
      // Update inventory state
      setInventory(prev => [...prev, ...stateChanges.inventory_add]);
    }
    
    // Handle inventory removals
    if (stateChanges.inventory_remove && stateChanges.inventory_remove.length > 0) {
      const items = stateChanges.inventory_remove.join(', ');
      message += `Removed from inventory: ${items}. `;
      
      // Update inventory state
      setInventory(prev => prev.filter(item => !stateChanges.inventory_remove.includes(item)));
    }
    
    // Handle attribute changes
    if (stateChanges.attributes) {
      const changes = Object.entries(stateChanges.attributes)
        .map(([attr, value]) => {
          const sign = value > 0 ? '+' : '';
          return `${attr.charAt(0).toUpperCase() + attr.slice(1)} ${sign}${value}`;
        })
        .join(', ');
      
      if (changes) {
        message += `Attribute changes: ${changes}.`;
      }
    }
    
    // Display status message if there were any changes
    if (message) {
      setStatusMessage(message);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }
  };

  // Show status modal
  const showStatus = async () => {
    try {
      const status = await apiGetStatus();
      setModalContent({
        title: 'Character Status',
        content: status
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error getting status:', err);
    }
  };

  // Show inventory modal
  const showInventory = async () => {
    try {
      const inventory = await apiGetInventory();
      setModalContent({
        title: 'Inventory',
        content: inventory.length > 0
          ? inventory.map(item => `• ${item}`).join('\n')
          : 'Your inventory is empty.'
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error getting inventory:', err);
      setLocalError(err.message || 'Failed to get inventory.');
      return [];
    }
  };

  // Show help modal
  const showHelp = () => {
    setModalContent({
      title: 'Help',
      content: `
      **Available Commands**
      
      • Check your status: See your character's current stats and attributes
      • View inventory: See the items you're carrying
      • History: View your adventure's history
      • New Game: Start a fresh adventure
      
      You can select one of the provided options or type your own custom action.
      
      Be descriptive in your actions for the best experience. Try commands like:
      - "Examine the mysterious object"
      - "Talk to the merchant about the rumors"
      - "Search the area for hidden passages"
      `
    });
    setIsModalOpen(true);
  };

  // Show history modal
  const showHistory = () => {
    setHistoryModal(true);
  };

  // Confirm new game
  const confirmNewGame = () => {
    setIsConfirmOpen(true);
  };

  // Handle new game confirmation
  const handleNewGame = () => {
    setIsConfirmOpen(false);
    startNewGame();
  };

  // Format text for display (handle markdown-like syntax)
  const formatText = (text) => {
    if (!text) return '';
    
    // Replace ** for bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace _ for italic
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Replace ` for code/highlight
    formatted = formatted.replace(/`(.*?)`/g, '<span class="highlight">$1</span>');
    
    // Replace line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  // Generate an image based on current game state
  const generateImage = useCallback(async () => {
    if (!gameState.description || !character || !selectedWorld) return;
    
    try {
      setIsGeneratingImage(true);
      setImageError(null);
      
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          description: gameState.description,
          characterDescription: character.description,
          worldType: selectedWorld.key
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }
      
      // Set the image URL
      setGameImage(data.imagePath);
      console.log("Updated game image URL:", data.imagePath);
    } catch (err) {
      console.error('Error generating image:', err);
      setImageError('Failed to generate scene image. The game will continue without visuals.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [gameState.description, character, selectedWorld, sessionId]);

  // Generate image when game state changes
  useEffect(() => {
    if (gameState.description && !isLoading) {
      generateImage();
    }
  }, [gameState.description, isLoading, generateImage]);

  useEffect(() => {
    // Process any state changes when gameState updates
    if (gameState.stateChanges) {
      handleStateChanges(gameState.stateChanges);
    }
  }, [gameState]);

  return (
    <PageWrapper worldType={selectedWorld?.key}>
      <Container>
        {/* Music Player - discreetly positioned in the top right */}
        <MusicPlayer 
          description={gameState.description} 
          sessionId={sessionId} 
        />
        
        {error && <Notification type="error">{error}</Notification>}
        {localError && <Notification type="error">{localError}</Notification>}
        
        {statusMessage && (
          <Notification type="success" style={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px',
            zIndex: 1000,
            maxWidth: '350px',
            animation: 'fadeIn 0.3s ease, fadeOut 0.3s ease 4.7s'
          }}>
            {statusMessage}
          </Notification>
        )}
        
        <GameHeader worldType={selectedWorld?.key}>
          <div>
            <h3>{character?.name || 'Adventurer'}</h3>
            <small>World: {selectedWorld?.name}</small>
            {gold > 0 && <small style={{ display: 'block', color: '#fdcb6e' }}>Gold: {gold}</small>}
          </div>
          
          <Flex>
            <Button
              variant="info"
              outline
              size="small"
              onClick={showStatus}
              style={{ marginRight: '0.5rem' }}
            >
              Status
            </Button>
            <Button
              variant="info"
              outline
              size="small"
              onClick={showInventory}
              style={{ marginRight: '0.5rem' }}
            >
              Inventory
            </Button>
            <Button
              variant="info"
              outline
              size="small"
              onClick={showHelp}
              style={{ marginRight: '0.5rem' }}
            >
              Help
            </Button>
            <Button
              variant="info"
              outline
              size="small"
              onClick={showHistory}
              style={{ marginRight: '0.5rem' }}
            >
              History
            </Button>
            <Button
              variant="danger"
              outline
              size="small"
              onClick={confirmNewGame}
            >
              New Game
            </Button>
          </Flex>
        </GameHeader>
        
        <Card>
          <ImageContainer>
            {isGeneratingImage ? (
              <Flex direction="column" align="center" justify="center" style={{ height: '100%' }}>
                <LoadingSpinner size="40px" />
                <Paragraph center style={{ marginTop: '1rem' }}>Generating scene image...</Paragraph>
              </Flex>
            ) : imageError ? (
              <Flex direction="column" align="center" justify="center" style={{ height: '100%', padding: '1rem' }}>
                <Paragraph center>{imageError}</Paragraph>
              </Flex>
            ) : gameImage ? (
              <img 
                src={gameImage} 
                alt="Game scene" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
              />
            ) : (
              <Flex direction="column" align="center" justify="center" style={{ height: '100%' }}>
                <Paragraph center>No image available</Paragraph>
              </Flex>
            )}
          </ImageContainer>
          
          <StoryText ref={storyTextRef}>
            {isLoading ? (
              <Flex direction="column" align="center" justify="center" style={{ padding: '2rem' }}>
                <LoadingSpinner size="40px" />
                <Paragraph center style={{ marginTop: '1rem' }}>The story unfolds...</Paragraph>
              </Flex>
            ) : (
              <>
                <div dangerouslySetInnerHTML={{ __html: formatText(displayedText) }} />
                {isStreaming && (
                  <Button 
                    onClick={handleSkipTyping} 
                    style={{ 
                      position: 'absolute', 
                      bottom: '10px', 
                      right: '10px',
                      opacity: 0.7
                    }}
                    size="small"
                  >
                    Skip
                  </Button>
                )}
              </>
            )}
          </StoryText>
          
          <Subtitle>Actions</Subtitle>
          <div>
            {gameState.options.map((option, index) => (
              <OptionButton
                key={index}
                onClick={() => handleOptionSelect(option)}
                disabled={isLoading}
                variant={selectedWorld?.key || 'primary'}
                block
              >
                {option}
              </OptionButton>
            ))}
            
            <form onSubmit={handleCustomAction} style={{ marginTop: '1rem' }}>
              <Input
                type="text"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder="Type your own action and press Enter..."
                disabled={isLoading}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  borderWidth: '2px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && customAction.trim()) {
                    handleCustomAction(e);
                  }
                }}
              />
            </form>
          </div>
        </Card>
        
        {/* Status/Inventory/Help Modal */}
        <Modal isOpen={isModalOpen}>
          <ModalContent isOpen={isModalOpen}>
            <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
            <Title>{modalContent.title}</Title>
            <div dangerouslySetInnerHTML={{ __html: formatText(modalContent.content) }} />
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(false)}
              style={{ marginTop: '1rem' }}
            >
              Close
            </Button>
          </ModalContent>
        </Modal>
        
        {/* New Game Confirmation Modal */}
        <Modal isOpen={isConfirmOpen}>
          <ModalContent isOpen={isConfirmOpen}>
            <Title>Start New Game?</Title>
            <Paragraph>Are you sure you want to start a new game? All current progress will be lost.</Paragraph>
            <Flex justify="space-between" style={{ marginTop: '1.5rem' }}>
              <Button
                variant="secondary"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleNewGame}
              >
                Start New Game
              </Button>
            </Flex>
          </ModalContent>
        </Modal>
        
        {/* History Modal */}
        <Modal isOpen={historyModal}>
          <ModalContent isOpen={historyModal} style={{ maxWidth: '800px' }}>
            <CloseButton onClick={() => setHistoryModal(false)}>×</CloseButton>
            <Title>Adventure History</Title>
            <StoryText style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {gameState.history.map((item, index) => {
                // Check if it's a player action
                const isPlayerAction = item.startsWith('> ');
                
                return (
                  <div
                    key={index}
                    className={isPlayerAction ? 'player-action' : ''}
                    style={{ marginBottom: '1rem' }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: formatText(item) }} />
                  </div>
                );
              })}
            </StoryText>
            <Button
              variant="primary"
              onClick={() => setHistoryModal(false)}
              style={{ marginTop: '1rem' }}
            >
              Back to Adventure
            </Button>
          </ModalContent>
        </Modal>
      </Container>
    </PageWrapper>
  );
};

export default GameScreen;
