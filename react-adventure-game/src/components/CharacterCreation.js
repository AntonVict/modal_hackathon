import React, { useState, useContext, useEffect } from 'react';
import GameContext from './context/GameContext';
import {
  PageWrapper,
  Container,
  Card,
  Title,
  Subtitle,
  Paragraph,
  FormGroup,
  Label,
  Input,
  TextArea,
  Button,
  Slider,
  AttributeRow,
  AttributeLabel,
  AttributeControls,
  AttributeValue,
  ProgressBar,
  ProgressFill,
  RemainingPoints,
  Flex,
  LoadingSpinner,
  Notification,
  IconButton
} from './styles/StyledComponents';

const CharacterCreation = () => {
  const { selectedWorld, createCharacter, isLoading, error } = useContext(GameContext);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState({
    strength: 1,
    intelligence: 1,
    dexterity: 1,
    charisma: 1,
    luck: 1
  });
  const [remainingPoints, setRemainingPoints] = useState(15);
  
  // Calculate remaining points whenever attributes change
  useEffect(() => {
    const usedPoints = Object.values(attributes).reduce((total, value) => total + value, 0);
    setRemainingPoints(20 - usedPoints);
  }, [attributes]);
  
  // Handle attribute change
  const handleAttributeChange = (attribute, value) => {
    const newValue = parseInt(value);
    
    // Don't allow attributes below 1 or above 10
    if (newValue < 1 || newValue > 10) {
      return;
    }
    
    // Calculate how this change would affect remaining points
    const currentValue = attributes[attribute];
    const pointDifference = newValue - currentValue;
    
    // Don't allow changes that would make remaining points negative
    if (remainingPoints - pointDifference < 0) {
      return;
    }
    
    // Update attribute
    setAttributes({
      ...attributes,
      [attribute]: newValue
    });
  };
  
  // Handle attribute button click (increment/decrement)
  const handleAttributeButton = (attribute, increment) => {
    const newValue = attributes[attribute] + (increment ? 1 : -1);
    handleAttributeChange(attribute, newValue);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a character name');
      return;
    }
    
    createCharacter({
      name,
      attributes,
      description: description || `A brave adventurer named ${name}`
    });
  };
  
  // Attribute descriptions
  const attributeDescriptions = {
    strength: 'Physical power, carrying capacity, and melee damage',
    intelligence: 'Knowledge, magic ability, and problem-solving',
    dexterity: 'Agility, reflexes, stealth, and ranged attacks',
    charisma: 'Social influence, leadership, and persuasion',
    luck: 'Random chance, finding items, and critical hits'
  };

  // Attribute icons (using emoji as placeholders - could be replaced with proper icons)
  const attributeIcons = {
    strength: '💪',
    intelligence: '🧠',
    dexterity: '🏃',
    charisma: '🗣️',
    luck: '🍀'
  };
  
  return (
    <PageWrapper worldType={selectedWorld?.key}>
      <Container>
        <Card>
          <Title>Create Your Character</Title>
          <Subtitle>World: {selectedWorld?.name}</Subtitle>
          <Paragraph>{selectedWorld?.description}</Paragraph>
          
          {error && (
            <Notification type="error">{error}</Notification>
          )}
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Character Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your character's name"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Flex justify="space-between" align="center">
                <Label>Attributes</Label>
                <RemainingPoints warning={remainingPoints < 5} pulse={remainingPoints < 3}>
                  Remaining Points: <span>{remainingPoints}</span>
                </RemainingPoints>
              </Flex>
              
              {Object.entries(attributes).map(([attr, value]) => (
                <AttributeRow key={attr}>
                  <Flex align="center" gap="md">
                    <AttributeLabel>
                      <span className="icon">{attributeIcons[attr]}</span>
                      <span>{attr.charAt(0).toUpperCase() + attr.slice(1)}</span>
                    </AttributeLabel>
                    <Paragraph className="attr-description" style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
                      {attributeDescriptions[attr]}
                    </Paragraph>
                  </Flex>
                  
                  <AttributeControls>
                    <IconButton
                      type="button"
                      onClick={() => handleAttributeButton(attr, false)}
                      disabled={value <= 1}
                    >
                      -
                    </IconButton>
                    <AttributeValue>{value}</AttributeValue>
                    <IconButton
                      type="button"
                      onClick={() => handleAttributeButton(attr, true)}
                      disabled={remainingPoints <= 0 || value >= 10}
                    >
                      +
                    </IconButton>
                    <Flex direction="column" style={{ flexGrow: 1, margin: '0 1rem' }}>
                      <Slider
                        value={value}
                        min={1}
                        max={10}
                        onChange={(e) => handleAttributeChange(attr, e.target.value)}
                      />
                      <ProgressBar style={{ marginTop: '0.25rem' }}>
                        <ProgressFill value={value * 10} color={attr} />
                      </ProgressBar>
                    </Flex>
                  </AttributeControls>
                </AttributeRow>
              ))}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Character Description (Optional)</Label>
              <TextArea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your character's appearance, background, or personality..."
              />
            </FormGroup>
            
            <Flex justify="space-between">
              <Button
                type="button"
                variant="secondary"
                outline
                onClick={() => window.history.back()} // This is a simplistic approach, ideally use context
              >
                Back
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="small" /> : 'Create Character'}
              </Button>
            </Flex>
          </form>
        </Card>
      </Container>
    </PageWrapper>
  );
};

export default CharacterCreation;
