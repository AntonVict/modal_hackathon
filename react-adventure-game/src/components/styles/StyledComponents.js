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
  background-image: ${({ backgroundImage }) => backgroundImage ? `url(${backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
  transition: background-color ${({ theme }) => theme.animation.medium} ease;
`;

export const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => theme.spacing.md} 0;
  animation: ${slideUp} ${({ theme }) => theme.animation.medium} ease;
  
  ${({ worldType, theme }) => worldType && css`
    border-top: 4px solid ${theme.colors[worldType]?.primary || theme.colors.primary};
  `}
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
  background-color: transparent;
  color: ${({ theme, color }) => color ? theme.colors[color] || color : theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  width: ${({ size }) => size || '40px'};
  height: ${({ size }) => size || '40px'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.fast} ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Input components
export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, error }) => error ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all ${({ theme }) => theme.animation.fast} ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme, error }) => error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme, error }) => 
      error ? `${theme.colors.error}40` : `${theme.colors.primary}40`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textDark};
    opacity: 0.7;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, error }) => error ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  min-height: 100px;
  resize: ${({ resize }) => resize || 'vertical'};
  transition: all ${({ theme }) => theme.animation.fast} ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme, error }) => error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme, error }) => 
      error ? `${theme.colors.error}40` : `${theme.colors.primary}40`};
  }
`;

export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.textDark};
`;

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

// Game specific components
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

export const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: ${({ theme }) => theme.colors.inputBackground};
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    transition: all ${({ theme }) => theme.animation.fast} ease;
    
    &:hover {
      transform: scale(1.2);
    }
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border: none;
    
    &:hover {
      transform: scale(1.2);
    }
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 5px;
  margin: ${({ theme }) => theme.spacing.sm} 0;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: ${({ value }) => `${value}%`};
  background-color: ${({ theme, color }) => color ? theme.colors[color] || color : theme.colors.primary};
  border-radius: 5px;
  transition: width ${({ theme }) => theme.animation.medium} ease;
`;

export const StoryText = styled.div`
  background-color: ${({ theme }) => theme.colors.cardLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.colors.cardLight};
    border-radius: 4px;
  }
  
  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  
  .player-action {
    color: ${({ theme }) => theme.colors.accent};
    font-style: italic;
    margin: ${({ theme }) => theme.spacing.md} 0;
  }
  
  .bold {
    font-weight: bold;
  }
  
  .italic {
    font-style: italic;
  }
  
  .highlight {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const OptionButton = styled(Button)`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-align: left;
  justify-content: flex-start;
  transition: all ${({ theme }) => theme.animation.medium} ease;
  
  &:hover {
    transform: translateX(5px);
  }
`;

export const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, worldType }) => 
    worldType ? 
      `${theme.colors[worldType]?.primary}90` || `${theme.colors.primary}90` : 
      `${theme.colors.primary}90`};
  backdrop-filter: blur(5px);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: ${({ theme }) => theme.colors.cardLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${({ theme }) => theme.animation.medium} ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }
`;

export const Modal = styled.div`
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
  opacity: 0;
  visibility: hidden;
  transition: all ${({ theme }) => theme.animation.medium} ease;
  
  ${({ isOpen }) => isOpen && css`
    opacity: 1;
    visibility: visible;
  `}
`;

export const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  transform: translateY(20px);
  transition: all ${({ theme }) => theme.animation.medium} ease;
  
  ${({ isOpen }) => isOpen && css`
    transform: translateY(0);
  `}
`;

export const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.error};
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

// Character creation components
export const AttributeRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const AttributeLabel = styled.div`
  width: 120px;
  flex-shrink: 0;
  font-weight: bold;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`;

export const AttributeControls = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`;

export const AttributeValue = styled.div`
  width: 40px;
  text-align: center;
  font-weight: bold;
  margin: 0 ${({ theme }) => theme.spacing.sm};
`;

export const RemainingPoints = styled.div`
  background-color: ${({ theme }) => theme.colors.cardLight};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  span {
    font-weight: bold;
    color: ${({ theme, warning }) => warning ? theme.colors.warning : theme.colors.success};
    font-size: 1.2rem;
  }
`;
