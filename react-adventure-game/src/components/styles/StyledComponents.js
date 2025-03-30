import styled, { css, keyframes } from 'styled-components';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const pulseWarning = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`;

const zoomIn = keyframes`
  from { transform: scale(1); }
  to { transform: scale(1.05); }
`;

// Layout components
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md};
  animation: ${fadeIn} ${({ theme }) => theme.animation.medium} ease;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

export const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme, worldType }) => 
    worldType ? theme.colors[worldType]?.background || theme.colors.background : theme.colors.background};
  background-image: ${({ backgroundImage, worldType }) => {
    if (backgroundImage) return `url(${backgroundImage})`;
    
    // Dynamic gradient based on world type
    switch(worldType) {
      case 'fantasy':
        return `linear-gradient(135deg, 
          rgba(120, 70, 170, 0.8) 0%, 
          rgba(90, 50, 140, 0.9) 50%, 
          rgba(60, 30, 100, 1) 100%)`;
      case 'space':
        return `linear-gradient(135deg, 
          rgba(30, 60, 100, 0.8) 0%, 
          rgba(20, 40, 80, 0.9) 50%, 
          rgba(10, 20, 40, 1) 100%)`;
      case 'pirate':
        return `linear-gradient(135deg, 
          rgba(180, 95, 35, 0.8) 0%, 
          rgba(130, 70, 30, 0.9) 50%, 
          rgba(80, 40, 20, 1) 100%)`;
      case 'hackathon':
        return `linear-gradient(135deg, 
          rgba(180, 50, 50, 0.8) 0%, 
          rgba(120, 30, 30, 0.9) 50%, 
          rgba(80, 20, 20, 1) 100%)`;
      default:
        return `linear-gradient(135deg, 
          rgba(40, 160, 80, 0.8) 0%, 
          rgba(30, 120, 60, 0.9) 50%, 
          rgba(20, 80, 40, 1) 100%)`;
    }
  }};
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  transition: background-color ${({ theme }) => theme.animation.medium} ease;
`;

export const Card = styled.div`
  background-color: ${({ theme, worldType }) => {
    switch(worldType) {
      case 'fantasy':
        return 'rgba(80, 45, 120, 0.6)';
      case 'space':
        return 'rgba(20, 40, 80, 0.6)';
      case 'pirate':
        return 'rgba(100, 55, 25, 0.6)';
      case 'hackathon':
        return 'rgba(100, 30, 30, 0.6)';
      default:
        return 'rgba(30, 100, 50, 0.6)';
    }
  }};
  background-image: ${({ worldType }) => {
    switch(worldType) {
      case 'fantasy':
        return `linear-gradient(160deg, 
          rgba(100, 60, 150, 0.5) 0%, 
          rgba(70, 40, 110, 0.7) 100%)`;
      case 'space':
        return `linear-gradient(160deg, 
          rgba(30, 60, 120, 0.5) 0%, 
          rgba(15, 30, 70, 0.7) 100%)`;
      case 'pirate':
        return `linear-gradient(160deg, 
          rgba(150, 80, 30, 0.5) 0%, 
          rgba(100, 50, 20, 0.7) 100%)`;
      case 'hackathon':
        return `linear-gradient(160deg, 
          rgba(150, 40, 40, 0.5) 0%, 
          rgba(100, 25, 25, 0.7) 100%)`;
      default:
        return `linear-gradient(160deg, 
          rgba(40, 130, 70, 0.5) 0%, 
          rgba(25, 90, 50, 0.7) 100%)`;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  animation: ${slideUp} ${({ theme }) => theme.animation.medium} ease;
  
  ${({ worldType, theme }) => worldType && css`
    border-top: 4px solid ${theme.colors[worldType]?.primary || theme.colors.primary};
  `}
  
  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
    border-color: ${({ worldType }) => {
      switch(worldType) {
        case 'fantasy':
          return 'rgba(155, 89, 182, 0.3)';
        case 'space':
          return 'rgba(52, 152, 219, 0.3)';
        case 'pirate':
          return 'rgba(230, 126, 34, 0.3)';
        case 'hackathon':
          return 'rgba(231, 76, 60, 0.3)';
        default:
          return 'rgba(46, 204, 113, 0.3)';
      }
    }};
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns || 3}, 1fr);
  grid-gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Flex = styled.div`
  display: flex;
  flex-direction: ${({ direction }) => direction || 'row'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  align-items: ${({ align }) => align || 'stretch'};
  flex-wrap: ${({ wrap }) => wrap || 'nowrap'};
  gap: ${({ gap, theme }) => gap ? theme.spacing[gap] || gap : 0};
`;

// Typography components
export const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme, color }) => color ? theme.colors[color] || color : theme.colors.heading};
  text-align: ${({ align }) => align || 'left'};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 2rem;
  }
`;

export const Subtitle = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme, color }) => color ? theme.colors[color] || color : theme.colors.heading};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.5rem;
  }
`;

export const Paragraph = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.6;
  
  ${({ bold }) => bold && css`
    font-weight: bold;
  `}
  
  ${({ italic }) => italic && css`
    font-style: italic;
  `}
  
  ${({ center }) => center && css`
    text-align: center;
  `}
`;

// Button components
export const Button = styled.button`
  background-color: ${({ theme, variant }) => 
    variant ? theme.colors[variant] || theme.colors.primary : theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme, size }) => 
    size === 'large' ? `${theme.spacing.md} ${theme.spacing.lg}` : 
    size === 'small' ? `${theme.spacing.xs} ${theme.spacing.sm}` : 
    `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ size }) => 
    size === 'large' ? '1.2rem' : 
    size === 'small' ? '0.9rem' : 
    '1rem'};
  font-weight: ${({ bold }) => bold ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.fast} ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  
  &:hover {
    background-color: ${({ theme, variant }) =>
      variant ? 
        (variant.includes('Light') ? theme.colors[variant.replace('Light', '')] : theme.colors[variant + 'Light']) || 
        theme.colors.primaryLight : 
        theme.colors.primaryLight};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  ${({ outline, theme, variant }) => outline && css`
    background-color: transparent;
    border: 2px solid ${variant ? theme.colors[variant] || theme.colors.primary : theme.colors.primary};
    color: ${variant ? theme.colors[variant] || theme.colors.primary : theme.colors.primary};
    
    &:hover {
      background-color: ${variant ? theme.colors[variant] || theme.colors.primary : theme.colors.primary};
      color: ${theme.colors.text};
    }
  `}
  
  ${({ block }) => block && css`
    display: block;
    width: 100%;
  `}
`;

export const IconButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: ${({ theme, color }) => color ? theme.colors[color] || color : theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  width: ${({ size }) => size || '32px'};
  height: ${({ size }) => size || '32px'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.fast} ease;
  font-weight: bold;
  font-size: 1.2rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: none;
    }
  }
`;

// Input components
export const Input = styled.input`
  background-color: rgba(35, 35, 40, 0.8);
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  font-size: 1.05rem;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  
  &:focus {
    outline: none;
    border-color: ${({ theme, worldType }) => {
      switch(worldType) {
        case 'fantasy':
          return 'rgba(155, 89, 182, 0.7)';
        case 'space':
          return 'rgba(52, 152, 219, 0.7)';
        case 'pirate':
          return 'rgba(230, 126, 34, 0.7)';
        case 'hackathon':
          return 'rgba(231, 76, 60, 0.7)';
        default:
          return 'rgba(46, 204, 113, 0.7)';
      }
    }};
    box-shadow: 0 0 0 2px ${({ theme, worldType }) => {
      switch(worldType) {
        case 'fantasy':
          return 'rgba(155, 89, 182, 0.3)';
        case 'space':
          return 'rgba(52, 152, 219, 0.3)';
        case 'pirate':
          return 'rgba(230, 126, 34, 0.3)';
        case 'hackathon':
          return 'rgba(231, 76, 60, 0.3)';
        default:
          return 'rgba(46, 204, 113, 0.3)';
      }
    }};
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    opacity: 0.7;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 1rem;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  transition: all ${({ theme }) => theme.animation.fast} ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}40`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textDark};
    opacity: 0.7;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: bold;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.heading};
`;

export const AttributeRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md};
  transition: all ${({ theme }) => theme.animation.fast} ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.small};
  }
`;

export const AttributeLabel = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  .icon {
    font-size: 1.2rem;
    display: inline-block;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const AttributeControls = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export const AttributeValue = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
  width: 30px;
  text-align: center;
`;

export const Slider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    transition: all ${({ theme }) => theme.animation.fast} ease;
    
    &:hover {
      transform: scale(1.2);
      background: ${({ theme }) => theme.colors.primaryLight};
    }
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border: none;
    transition: all ${({ theme }) => theme.animation.fast} ease;
    
    &:hover {
      transform: scale(1.2);
      background: ${({ theme }) => theme.colors.primaryLight};
    }
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  width: ${({ value }) => `${value}%`};
  height: 100%;
  background-color: ${({ theme, color }) => {
    switch(color) {
      case 'strength': return '#e74c3c';
      case 'intelligence': return '#3498db';
      case 'dexterity': return '#2ecc71';
      case 'charisma': return '#9b59b6';
      case 'luck': return '#f1c40f';
      default: return theme.colors.primary;
    }
  }};
  transition: width ${({ theme }) => theme.animation.medium} ease;
`;

export const RemainingPoints = styled.div`
  display: inline-block;
  background-color: ${({ theme, warning }) => warning ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)'};
  color: ${({ theme, warning }) => warning ? theme.colors.error : theme.colors.success};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme, warning }) => warning ? 'rgba(231, 76, 60, 0.3)' : 'rgba(46, 204, 113, 0.3)'};
  
  span {
    font-size: 1.2rem;
  }
  
  ${({ pulse }) => pulse && css`
    animation: ${pulseWarning} 1s infinite;
  `}
`;

// Game specific components
export const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme, worldType }) => {
    switch(worldType) {
      case 'fantasy':
        return 'linear-gradient(135deg, rgba(142, 68, 173, 0.9) 0%, rgba(108, 52, 131, 0.9) 100%)';
      case 'space':
        return 'linear-gradient(135deg, rgba(31, 97, 141, 0.95) 0%, rgba(22, 60, 82, 0.95) 100%)';
      case 'pirate':
        return 'linear-gradient(135deg, rgba(211, 84, 0, 0.9) 0%, rgba(169, 50, 38, 0.9) 100%)';
      case 'hackathon':
        return 'linear-gradient(135deg, rgba(192, 57, 43, 0.9) 0%, rgba(142, 68, 173, 0.9) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(39, 174, 96, 0.9) 0%, rgba(22, 160, 133, 0.9) 100%)';
    }
  }};
  backdrop-filter: blur(5px);
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    margin: 0;
    color: white;
    font-size: 1.4rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    font-weight: bold;
    letter-spacing: 0.5px;
  }
  
  small {
    color: rgba(255, 255, 255, 0.9);
    display: block;
    margin-top: 0.25rem;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  }
`;

export const NavButton = styled.button`
  background: ${({ theme, variant, worldType }) => {
    if (variant === 'danger') {
      return 'rgba(231, 76, 60, 0.85)';
    }
    
    switch(worldType) {
      case 'fantasy':
        return 'rgba(155, 89, 182, 0.75)';
      case 'space':
        return 'rgba(52, 152, 219, 0.75)';
      case 'pirate':
        return 'rgba(230, 126, 34, 0.75)';
      case 'hackathon':
        return 'rgba(231, 76, 60, 0.75)';
      default:
        return 'rgba(46, 204, 113, 0.75)';
    }
  }};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.fast} ease;
  margin: 0 0.2rem;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  
  &:hover {
    background: ${({ theme, variant, worldType }) => {
      if (variant === 'danger') {
        return 'rgba(231, 76, 60, 1)';
      }
      
      switch(worldType) {
        case 'fantasy':
          return 'rgba(155, 89, 182, 0.9)';
        case 'space':
          return 'rgba(52, 152, 219, 0.9)';
        case 'pirate':
          return 'rgba(230, 126, 34, 0.9)';
        case 'hackathon':
          return 'rgba(231, 76, 60, 0.9)';
        default:
          return 'rgba(46, 204, 113, 0.9)';
      }
    }};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  ${({ variant }) => variant === 'danger' && css`
    background-color: rgba(231, 76, 60, 0.85);
    
    &:hover {
      background-color: rgba(231, 76, 60, 1);
    }
  `}
`;

export const WorldCard = styled(Card)`
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.medium} ease;
  border-left: 5px solid ${({ theme, worldType }) => 
    worldType ? theme.colors[worldType]?.primary || theme.colors.primary : theme.colors.primary};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

export const StoryText = styled.div`
  background-color: ${({ theme }) => `rgba(35, 35, 40, 0.85)`};
  background-image: ${({ worldType }) => {
    switch(worldType) {
      case 'fantasy':
        return `linear-gradient(
          to bottom right,
          rgba(100, 60, 150, 0.85) 0%, 
          rgba(70, 40, 110, 0.85) 50%,
          rgba(50, 30, 90, 0.85) 100%
        )`;
      case 'space':
        return `linear-gradient(
          to bottom right,
          rgba(30, 60, 120, 0.85) 0%, 
          rgba(20, 40, 80, 0.85) 50%,
          rgba(10, 20, 60, 0.85) 100%
        )`;
      case 'pirate':
        return `linear-gradient(
          to bottom right,
          rgba(140, 80, 30, 0.85) 0%, 
          rgba(100, 60, 20, 0.85) 50%,
          rgba(80, 40, 15, 0.85) 100%
        )`;
      case 'hackathon':
        return `linear-gradient(
          to bottom right,
          rgba(140, 50, 50, 0.85) 0%, 
          rgba(100, 30, 30, 0.85) 50%,
          rgba(80, 20, 20, 0.85) 100%
        )`;
      default:
        return `linear-gradient(
          to bottom right,
          rgba(40, 120, 80, 0.85) 0%, 
          rgba(30, 90, 60, 0.85) 50%,
          rgba(20, 70, 40, 0.85) 100%
        )`;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  border: 1px solid ${({ worldType }) => {
    switch(worldType) {
      case 'fantasy':
        return 'rgba(155, 89, 182, 0.3)';
      case 'space':
        return 'rgba(52, 152, 219, 0.3)';
      case 'pirate':
        return 'rgba(230, 126, 34, 0.3)';
      case 'hackathon':
        return 'rgba(231, 76, 60, 0.3)';
      default:
        return 'rgba(46, 204, 113, 0.3)';
    }
  }};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 
              0 1px 2px rgba(255, 255, 255, 0.05),
              inset 0 1px 1px rgba(255, 255, 255, 0.05);
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  max-height: 450px;
  overflow-y: auto;
  line-height: 1.7;
  position: relative;
  font-size: 1.15rem;
  letter-spacing: 0.2px;
  backdrop-filter: blur(5px);
  color: rgba(255, 255, 255, 0.95);
  
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 5px;
    margin: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme, worldType }) => {
      switch(worldType) {
        case 'fantasy':
          return 'rgba(155, 89, 182, 0.8)';
        case 'space':
          return 'rgba(52, 152, 219, 0.8)';
        case 'pirate':
          return 'rgba(230, 126, 34, 0.8)';
        case 'hackathon':
          return 'rgba(231, 76, 60, 0.8)';
        default:
          return 'rgba(46, 204, 113, 0.8)';
      }
    }};
    border-radius: 5px;
    border: 2px solid rgba(0, 0, 0, 0.1);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme, worldType }) => {
      switch(worldType) {
        case 'fantasy':
          return 'rgba(155, 89, 182, 1)';
        case 'space':
          return 'rgba(52, 152, 219, 1)';
        case 'pirate':
          return 'rgba(230, 126, 34, 1)';
        case 'hackathon':
          return 'rgba(231, 76, 60, 1)';
        default:
          return 'rgba(46, 204, 113, 1)';
      }
    }};
  }
  
  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  
  .player-action {
    color: ${({ theme, worldType }) => {
      switch(worldType) {
        case 'fantasy':
          return '#b39ddb';
        case 'space':
          return '#90caf9';
        case 'pirate':
          return '#ffcc80';
        case 'hackathon':
          return '#ef9a9a';
        default:
          return '#a5d6a7';
      }
    }};
    font-style: italic;
    margin: ${({ theme }) => theme.spacing.lg} 0;
    padding-left: ${({ theme }) => theme.spacing.md};
    border-left: 3px solid rgba(255, 255, 255, 0.2);
    font-size: 1.1rem;
  }
  
  .bold {
    font-weight: bold;
  }
  
  .italic {
    font-style: italic;
  }
  
  .highlight {
    color: ${({ theme, worldType }) => {
      switch(worldType) {
        case 'fantasy':
          return '#ce93d8';
        case 'space':
          return '#64b5f6';
        case 'pirate':
          return '#ffb74d';
        case 'hackathon':
          return '#e57373';
        default:
          return '#81c784';
      }
    }};
    text-shadow: 0 0 8px ${({ theme, worldType }) => {
      switch(worldType) {
        case 'fantasy':
          return 'rgba(155, 89, 182, 0.6)';
        case 'space':
          return 'rgba(52, 152, 219, 0.6)';
        case 'pirate':
          return 'rgba(230, 126, 34, 0.6)';
        case 'hackathon':
          return 'rgba(231, 76, 60, 0.6)';
        default:
          return 'rgba(46, 204, 113, 0.6)';
      }
    }};
  }
`;

export const OptionButton = styled(Button)`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 1.05rem;
  text-align: left;
  background-color: rgba(40, 40, 45, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
  
  &:hover {
    transform: translateY(-3px);
    border-color: ${({ worldType, theme }) => {
      switch(worldType) {
        case 'fantasy':
          return 'rgba(155, 89, 182, 0.5)';
        case 'space':
          return 'rgba(52, 152, 219, 0.5)';
        case 'pirate':
          return 'rgba(230, 126, 34, 0.5)';
        case 'hackathon':
          return 'rgba(231, 76, 60, 0.5)';
        default:
          return 'rgba(46, 204, 113, 0.5)';
      }
    }};
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    background-color: rgba(50, 50, 55, 0.9);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

export const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.cardLight};
  position: relative;
  cursor: zoom-in;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: all ${({ theme }) => theme.animation.medium} ease;
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: rgba(0, 0, 0, 0.3);
    transition: transform ${({ theme }) => theme.animation.medium} ease;
  }
  
  &:hover img {
    animation: ${zoomIn} 0.3s forwards;
  }
  
  &::after {
    content: '🔍';
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  perspective: 1200px;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.3s ease;
`;

export const ModalContent = styled.div`
  position: relative;
  width: 90%;
  max-width: 450px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 1.5rem;
  border-radius: 1rem;
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  
  /* World-specific gradient backgrounds */
  ${props => {
    const world = props.currentWorld?.toLowerCase() || 'default';
    
    switch(world) {
      case 'fantasy':
      case 'kingdom of eldoria':
        return `
          background: linear-gradient(135deg, rgba(76, 40, 130, 0.9) 0%, rgba(41, 50, 120, 0.85) 100%);
          border: 1px solid rgba(138, 43, 226, 0.3);
        `;
      case 'sci-fi':
      case 'neon city':
        return `
          background: linear-gradient(135deg, rgba(0, 20, 50, 0.9) 0%, rgba(0, 80, 120, 0.85) 100%);
          border: 1px solid rgba(0, 195, 255, 0.3);
        `;
      case 'horror':
      case 'shadow realm':
        return `
          background: linear-gradient(135deg, rgba(40, 0, 0, 0.9) 0%, rgba(80, 10, 20, 0.85) 100%);
          border: 1px solid rgba(139, 0, 0, 0.3);
        `;
      case 'western':
      case 'dusty gulch':
        return `
          background: linear-gradient(135deg, rgba(101, 67, 33, 0.9) 0%, rgba(80, 60, 30, 0.85) 100%);
          border: 1px solid rgba(160, 120, 50, 0.3);
        `;
      case 'space':
      case 'cosmic voyager':
        return `
          background: linear-gradient(135deg, rgba(10, 10, 40, 0.9) 0%, rgba(40, 10, 60, 0.85) 100%);
          border: 1px solid rgba(100, 50, 200, 0.3);
        `;
      case 'pirate':
      case 'black pearl':
        return `
          background: linear-gradient(135deg, rgba(50, 30, 15, 0.9) 0%, rgba(80, 50, 20, 0.85) 100%);
          border: 1px solid rgba(160, 120, 50, 0.3);
        `;
      default:
        return `
          background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(50, 50, 50, 0.85) 100%);
          border: 1px solid rgba(80, 80, 80, 0.3);
        `;
    }
  }}
  
  h2 {
    margin-top: 0;
    color: #fff;
    text-align: center;
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    
    /* Gradient underline effect */
    &::after {
      content: '';
      display: block;
      width: 50%;
      height: 2px;
      margin: 0.4rem auto 0;
      background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0) 0%, 
        rgba(255, 255, 255, 0.5) 50%, 
        rgba(255, 255, 255, 0) 100%);
    }
  }
  
  p {
    font-size: 1rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.9);
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
  
  &:active {
    transform: scale(0.9) rotate(90deg);
  }
`;

// New components for status modal styling
export const StatusSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.6rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`;

export const StatusIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  margin-right: 0.7rem;
  font-size: 0.95rem;
  color: ${props => {
    switch (props.type) {
      case 'location': return 'rgba(52, 152, 219, 1)';
      case 'health': return 'rgba(46, 204, 113, 1)';
      case 'gold': return 'rgba(241, 196, 15, 1)';
      case 'inventory': return 'rgba(155, 89, 182, 1)';
      case 'quests': return 'rgba(230, 126, 34, 1)';
      case 'npcs': return 'rgba(149, 165, 166, 1)';
      default: return 'rgba(52, 152, 219, 1)';
    }
  }};
`;

export const StatusRow = styled.div`
  flex: 1;
`;

export const StatusLabel = styled.div`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.1rem;
`;

export const StatusValue = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.95);
  ${props => props.type === 'health' && `
    color: rgba(46, 204, 113, 1);
    text-shadow: 0 0 5px rgba(46, 204, 113, 0.3);
  `}
  ${props => props.type === 'gold' && `
    color: rgba(241, 196, 15, 1);
    text-shadow: 0 0 5px rgba(241, 196, 15, 0.3);
    font-weight: bold;
  `}
`;

export const StatusTitle = styled.h3`
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -0.3rem;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
  }
`;

// Image modal components
export const ImageModal = styled(Modal)`
  background-color: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
`;

export const FullSizeImage = styled.div`
  width: 90vw;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  
  img {
    max-width: 100%;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  }
  
  button {
    margin-top: 1rem;
  }
`;

// Loading and notification components
export const LoadingSpinner = styled.div`
  border: 4px solid ${({ theme }) => theme.colors.cardLight};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: ${({ size }) => size || '40px'};
  height: ${({ size }) => size || '40px'};
  animation: spin 1s linear infinite;
  margin: ${({ center }) => center ? '0 auto' : '0'};
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  flex-direction: column;
`;

export const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: 1.2rem;
`;

export const Notification = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, type }) => 
    type === 'error' ? theme.colors.error :
    type === 'success' ? theme.colors.success :
    type === 'warning' ? theme.colors.warning :
    theme.colors.info};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  animation: ${slideUp} ${({ theme }) => theme.animation.medium} ease;
`;
