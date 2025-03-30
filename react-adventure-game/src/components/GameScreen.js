import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import GameContext from './context/GameContext';
import { 
  FaExclamationTriangle, 
  FaMapMarkerAlt, 
  FaHeartbeat, 
  FaCoins, 
  FaBoxOpen, 
  FaClipboardList, 
  FaUsers, 
  FaInfoCircle,
  FaScroll
} from 'react-icons/fa';
import MusicPlayer from './MusicPlayer';

import {
  Container,
  PageWrapper,
  Title,
  Subtitle,
  Paragraph,
  Button,
  Card,
  Flex,
  Modal,
  ModalContent,
  StoryText,
  LoadingSpinner,
  ImageContainer,
  CloseButton,
  Notification,
  NavButton,
  OptionButton,
  Input,
  GameHeader,
  ImageModal,
  FullSizeImage,
  // New status modal components
  StatusRow,
  StatusIcon,
  StatusLabel,
  StatusValue,
  StatusSection,
  StatusTitle
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
    getHistory: apiGetHistory,
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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  
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
      setIsModalOpen(true);
      const status = await apiGetStatus();
      
      // Parse status response to display with our styled components
      const statusInfo = parseStatusInfo(status);
      
      setModalContent({
        title: 'Character Status',
        content: statusInfo
      });
    } catch (err) {
      console.error('Error getting status:', err);
    }
  };

  // Parse the status text to display with our styled components
  const parseStatusInfo = (statusText) => {
    // Parse status text into sections like Location, Health, Gold, etc.
    // Example status text formatting: "Location: Kingdom of Eldoria\nHealth: 100/100\nGold: 50\nInventory: Empty"
    const lines = statusText.split('\n');
    const sections = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':').map(part => part.trim());
        sections[key.toLowerCase()] = value;
      }
    });
    
    return (
      <div>
        {sections.location && (
          <StatusSection>
            <StatusIcon type="location">
              <FaMapMarkerAlt />
            </StatusIcon>
            <StatusRow>
              <StatusLabel>Location</StatusLabel>
              <StatusValue>{sections.location}</StatusValue>
            </StatusRow>
          </StatusSection>
        )}
        
        {sections.health && (
          <StatusSection>
            <StatusIcon type="health">
              <FaHeartbeat />
            </StatusIcon>
            <StatusRow>
              <StatusLabel>Health</StatusLabel>
              <StatusValue type="health">{sections.health}</StatusValue>
            </StatusRow>
          </StatusSection>
        )}
        
        {sections.gold && (
          <StatusSection>
            <StatusIcon type="gold">
              <FaCoins />
            </StatusIcon>
            <StatusRow>
              <StatusLabel>Gold</StatusLabel>
              <StatusValue type="gold">{sections.gold}</StatusValue>
            </StatusRow>
          </StatusSection>
        )}
        
        {sections.inventory && (
          <StatusSection>
            <StatusIcon type="inventory">
              <FaBoxOpen />
            </StatusIcon>
            <StatusRow>
              <StatusLabel>Inventory</StatusLabel>
              <StatusValue>{sections.inventory}</StatusValue>
            </StatusRow>
          </StatusSection>
        )}
        
        {sections['active quests'] && (
          <StatusSection>
            <StatusIcon type="quests">
              <FaClipboardList />
            </StatusIcon>
            <StatusRow>
              <StatusLabel>Active Quests</StatusLabel>
              <StatusValue>{sections['active quests']}</StatusValue>
            </StatusRow>
          </StatusSection>
        )}
        
        {sections['npcs present'] && (
          <StatusSection>
            <StatusIcon type="npcs">
              <FaUsers />
            </StatusIcon>
            <StatusRow>
              <StatusLabel>NPCs Present</StatusLabel>
              <StatusValue>{sections['npcs present']}</StatusValue>
            </StatusRow>
          </StatusSection>
        )}
      </div>
    );
  };

  // Show inventory modal
  const showInventory = async () => {
    try {
      const inventory = await apiGetInventory();
      
      // Format inventory for display with icons and nice styling
      const formattedInventory = formatInventory(inventory);
      
      setModalContent({
        title: 'Inventory',
        content: formattedInventory
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error getting inventory:', err);
      setModalContent({
        title: 'Inventory',
        content: formatInventory("Your inventory is empty.")
      });
      setIsModalOpen(true);
    }
  };
  
  // Format inventory with nice styling
  const formatInventory = (inventoryText) => {
    // Parse items from inventory text
    const hasItems = !inventoryText.includes('empty') && !inventoryText.includes('Empty');
    
    if (!hasItems) {
      return (
        <div style={{ padding: 0, textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
            <FaBoxOpen style={{ marginRight: '0.4rem', color: 'rgba(155, 89, 182, 0.9)' }} />
            Your inventory is empty
          </p>
          <p style={{ fontSize: '0.8rem', margin: '0.4rem 0', color: 'rgba(255, 255, 255, 0.6)' }}>
            Find items on your adventure to fill your bag
          </p>
        </div>
      );
    }
    
    // Parse items from inventory string 
    const itemsList = inventoryText.split('\n').filter(line => line.trim().length > 0);
    
    return (
      <div style={{ padding: 0 }}>
        {itemsList.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'rgba(0, 0, 0, 0.2)', 
            borderRadius: '6px', 
            padding: '0.4rem', 
            marginBottom: '0.3rem', 
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <FaScroll style={{ 
              color: 'rgba(155, 89, 182, 0.9)', 
              marginRight: '0.5rem', 
              fontSize: '0.8rem'
            }} />
            <div style={{ flex: 1, fontSize: '0.85rem' }}>
              {item}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Show help modal
  const showHelp = () => {
    setModalContent({
      title: 'Game Help',
      content: (
        <div style={{ padding: 0, textAlign: 'left' }}>
          <div style={{ marginBottom: '0.8rem' }}>
            <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.3rem 0', fontWeight: 'bold' }}>How to Play</h4>
            <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.85rem', lineHeight: 1.3 }}>
              <li>Choose from the available actions or type your own</li>
              <li>Explore the world and interact with characters</li>
              <li>Collect items and solve quests</li>
            </ul>
          </div>
          
          <div style={{ marginBottom: '0.8rem' }}>
            <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.3rem 0', fontWeight: 'bold' }}>Game Controls</h4>
            <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.85rem', lineHeight: 1.3 }}>
              <li>Check your status: See your character's current stats</li>
              <li>View inventory: See items you've collected</li>
              <li>View history: See a record of your adventure</li>
              <li>New Game: Start a fresh adventure</li>
            </ul>
          </div>
          
          <div style={{ marginBottom: '0.3rem' }}>
            <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.3rem 0', fontWeight: 'bold' }}>Tips</h4>
            <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.85rem', lineHeight: 1.3 }}>
              <li>Be creative with your actions to discover hidden paths</li>
              <li>Talk to characters to learn about quests and items</li>
              <li>Some actions might have consequences, choose wisely!</li>
            </ul>
          </div>
        </div>
      )
    });
    setIsModalOpen(true);
  };

  // Show history modal
  const showHistory = async () => {
    try {
      // Get history from game state
      const historyData = gameState.history || [];
      
      // If empty history
      if (historyData.length === 0) {
        setModalContent({
          title: 'Adventure History',
          content: (
            <div style={{ padding: 0, textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
                Your adventure has just begun
              </p>
              <p style={{ fontSize: '0.8rem', margin: '0.4rem 0', color: 'rgba(255, 255, 255, 0.6)' }}>
                Actions you take will appear in your history
              </p>
            </div>
          )
        });
      } else {
        setModalContent({
          title: 'Adventure History',
          content: (
            <div style={{ padding: 0 }}>
              <div>
                {historyData.map((entry, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    borderRadius: '6px', 
                    padding: '0.4rem', 
                    marginBottom: '0.3rem', 
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <div style={{ 
                      minWidth: '20px', 
                      color: 'rgba(52, 152, 219, 0.9)', 
                      marginRight: '0.5rem',
                      fontSize: '0.8rem',
                      textAlign: 'center'
                    }}>
                      {historyData.length - index}
                    </div>
                    <div style={{ 
                      flex: 1, 
                      fontSize: '0.85rem', 
                      color: 'rgba(255, 255, 255, 0.95)', 
                      lineHeight: 1.3
                    }}>
                      {entry}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        });
      }
      
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error getting history:', err);
    }
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
    if (!text || typeof text !== 'string') return text;
    
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
      setImageUrl(data.imagePath);
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

  // Handle image click to show full screen
  const handleImageClick = () => {
    if (imageUrl && !isGeneratingImage && !imageError) {
      setIsImageModalOpen(true);
    }
  };

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
            <NavButton
              onClick={showStatus}
              worldType={selectedWorld?.key}
            >
              Status
            </NavButton>
            <NavButton
              onClick={showInventory}
              worldType={selectedWorld?.key}
            >
              Inventory
            </NavButton>
            <NavButton
              onClick={showHelp}
              worldType={selectedWorld?.key}
            >
              Help
            </NavButton>
            <NavButton
              onClick={showHistory}
              worldType={selectedWorld?.key}
            >
              History
            </NavButton>
            <NavButton
              variant="danger"
              onClick={confirmNewGame}
              worldType={selectedWorld?.key}
            >
              New Game
            </NavButton>
          </Flex>
        </GameHeader>
        
        <Card worldType={selectedWorld?.key}>
          <ImageContainer onClick={handleImageClick}>
            {imageUrl && !isGeneratingImage && !imageError ? (
              <img src={imageUrl} alt="Game scene" style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }} />
            ) : isGeneratingImage ? (
              <Flex direction="column" align="center" justify="center" style={{ padding: '2rem' }}>
                <LoadingSpinner size="40px" />
                <Paragraph center style={{ marginTop: '1rem' }}>Creating scene image...</Paragraph>
              </Flex>
            ) : imageError ? (
              <Flex direction="column" align="center" justify="center" style={{ padding: '2rem' }}>
                <FaExclamationTriangle style={{ fontSize: '2rem', marginBottom: '1rem', color: '#e74c3c' }} />
                <Paragraph center>Could not generate image</Paragraph>
              </Flex>
            ) : null}
          </ImageContainer>
          
          <StoryText ref={storyTextRef} worldType={selectedWorld?.key}>
            {isLoading ? (
              <Flex direction="column" align="center" justify="center" style={{ padding: '2rem' }}>
                <LoadingSpinner size="40px" />
                <Paragraph center style={{ marginTop: '1rem' }}>The story unfolds...</Paragraph>
              </Flex>
            ) : (
              <div style={{ position: 'relative', minHeight: '50px' }}>
                {isStreaming && (
                  <Button 
                    onClick={handleSkipTyping} 
                    size="small"
                    worldType={selectedWorld?.key}
                    style={{ 
                      position: 'absolute', 
                      top: '0',
                      right: '0',
                      opacity: 0.8,
                      fontSize: '0.9rem',
                      padding: '0.25rem 0.75rem',
                      zIndex: 5
                    }}
                  >
                    Skip
                  </Button>
                )}
                <div dangerouslySetInnerHTML={{ __html: formatText(displayedText) }} />
              </div>
            )}
          </StoryText>
        </Card>
        
        <Card worldType={selectedWorld?.key}>
          <Subtitle>Actions</Subtitle>
          <div>
            {gameState.options.map((option, index) => {
              // Skip options that tell the user to type their own action
              if (option.toLowerCase().includes('type your own action')) {
                return null;
              }
              
              return (
                <OptionButton
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isLoading}
                  worldType={selectedWorld?.key}
                  block
                >
                  {option}
                </OptionButton>
              );
            })}
            
            <form onSubmit={handleCustomAction} style={{ marginTop: '1rem' }}>
              <Input
                type="text"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder="Type your own action and press Enter..."
                disabled={isLoading}
                worldType={selectedWorld?.key}
                style={{ 
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease'
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
          <ModalContent currentWorld={selectedWorld?.name}>
            <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
            <Title>{modalContent.title}</Title>
            {typeof modalContent.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: formatText(modalContent.content) }} />
            ) : (
              modalContent.content
            )}
          </ModalContent>
        </Modal>
        
        {/* Image Modal */}
        <ImageModal isOpen={isImageModalOpen} onClick={() => setIsImageModalOpen(false)}>
          <FullSizeImage>
            <img src={imageUrl} alt="Full size game scene" />
          </FullSizeImage>
          <CloseButton 
            onClick={(e) => {
              e.stopPropagation();
              setIsImageModalOpen(false);
            }}
            style={{ 
              position: 'absolute', 
              top: '20px', 
              right: '20px',
              background: 'rgba(0, 0, 0, 0.7)',
              width: '40px',
              height: '40px' 
            }}
          >
            ×
          </CloseButton>
        </ImageModal>
        
        {/* New Game Confirmation Modal */}
        <Modal isOpen={isConfirmOpen}>
          <ModalContent currentWorld={selectedWorld?.name}>
            <Title>Start New Game?</Title>
            <Paragraph>Are you sure you want to start a new game? All current progress will be lost.</Paragraph>
            <Flex justify="space-between" style={{ marginTop: '1.5rem' }}>
              <Button 
                onClick={() => setIsConfirmOpen(false)} 
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleNewGame}
                style={{ background: 'rgba(231, 76, 60, 0.7)' }}
              >
                New Game
              </Button>
            </Flex>
          </ModalContent>
        </Modal>
        
        {/* History Modal */}
        <Modal isOpen={historyModal}>
          <ModalContent currentWorld={selectedWorld?.name}>
            <CloseButton onClick={() => setHistoryModal(false)}>×</CloseButton>
            <Title>Adventure History</Title>
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem', marginBottom: '1rem' }}>
              {gameState.history && gameState.history.length > 0 ? (
                gameState.history.map((item, index) => {
                  // Check if it's a player action (usually prefixed with '>')
                  const isPlayerAction = typeof item === 'string' && item.startsWith('> ');
                  
                  return (
                    <div
                      key={index}
                      style={{ 
                        marginBottom: '1rem', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
                        paddingBottom: '1rem',
                        backgroundColor: isPlayerAction ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        borderRadius: '4px',
                        padding: '0.75rem'
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: formatText(item) }} />
                    </div>
                  );
                })
              ) : (
                <Paragraph>No history available yet. Your adventure has just begun!</Paragraph>
              )}
            </div>
            <Button
              variant="primary"
              onClick={() => setHistoryModal(false)}
              style={{ marginTop: '1rem' }}
            >
              Close
            </Button>
          </ModalContent>
        </Modal>
      </Container>
    </PageWrapper>
  );
};

export default GameScreen;
