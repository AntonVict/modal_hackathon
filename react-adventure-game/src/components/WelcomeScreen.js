import React, { useContext } from 'react';
import GameContext from './context/GameContext';
import {
  PageWrapper,
  Container,
  Title,
  Subtitle,
  Paragraph,
  Grid,
  WorldCard,
  Button,
  Flex,
  LoadingSpinner,
  Notification
} from './styles/StyledComponents';

const WelcomeScreen = () => {
  const { worlds, selectWorld, isLoading, error } = useContext(GameContext);

  // World backgrounds and icons based on theme
  const getWorldStyles = (worldKey) => {
    const worldTypes = {
      fantasy: {
        icon: '🧙‍♂️',
        color: 'rgb(142, 68, 173)',
      },
      space: {
        icon: '🚀',
        color: 'rgb(52, 152, 219)',
      },
      pirate: {
        icon: '☠️',
        color: 'rgb(230, 126, 34)',
      },
      regular: {
        icon: '🏙️',
        color: 'rgb(39, 174, 96)',
      },
      hackathon: {
        icon: '💻',
        color: 'rgb(231, 76, 60)',
      },
    };
    
    return worldTypes[worldKey] || { icon: '🌍', color: '#6c5ce7' };
  };

  return (
    <PageWrapper>
      <Container>
        <Flex direction="column" align="center" justify="center" style={{ minHeight: '100vh' }}>
          <Title align="center">AI ADVENTURE</Title>
          <Subtitle align="center">Choose Your World</Subtitle>
          <Paragraph center>Select a world to begin your adventure. Each world offers unique challenges and experiences.</Paragraph>
          
          {error && (
            <Notification type="error">{error}</Notification>
          )}
          
          {isLoading ? (
            <Flex direction="column" align="center" justify="center" style={{ margin: '3rem 0' }}>
              <LoadingSpinner size="50px" />
              <Paragraph center>Loading available worlds...</Paragraph>
            </Flex>
          ) : (
            <Grid columns={3}>
              {worlds.map((world) => {
                const worldStyle = getWorldStyles(world.key);
                
                return (
                  <WorldCard 
                    key={world.key} 
                    worldType={world.key}
                    onClick={() => selectWorld(world)}
                  >
                    <Flex direction="column" align="center">
                      <div style={{ 
                        fontSize: '3rem', 
                        marginBottom: '1rem',
                        color: worldStyle.color
                      }}>
                        {worldStyle.icon}
                      </div>
                      <Subtitle align="center">{world.name}</Subtitle>
                      <Paragraph center>{world.description}</Paragraph>
                      <Button variant={world.key} style={{ marginTop: '1rem' }}>
                        Embark on Journey
                      </Button>
                    </Flex>
                  </WorldCard>
                );
              })}
            </Grid>
          )}
        </Flex>
      </Container>
    </PageWrapper>
  );
};

export default WelcomeScreen;
