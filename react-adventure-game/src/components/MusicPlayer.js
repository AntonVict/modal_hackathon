import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const MusicPlayerContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(20, 20, 20, 0.8);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(30, 30, 30, 0.9);
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VolumeControl = styled.input`
  -webkit-appearance: none;
  width: 70px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const MusicPlayer = ({ description, sessionId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  
  // Select appropriate music based on scene description
  useEffect(() => {
    const selectMusic = async () => {
      if (!description) return;
      
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/music/select', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description,
            sessionId
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to select music');
        }
        
        const data = await response.json();
        
        if (data.success && data.track) {
          console.log('Selected music track:', data.track.name);
          setCurrentTrack(data.track);
          
          // If audio is already playing, change the source and start playing
          if (audioRef.current) {
            audioRef.current.src = data.track.path;
            
            if (isPlaying) {
              audioRef.current.play().catch(e => console.error('Error playing audio:', e));
            }
          }
        }
      } catch (err) {
        console.error('Error selecting music:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    selectMusic();
  }, [description, sessionId]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error('Error playing audio:', e));
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = 0;
    }
    
    setIsMuted(!isMuted);
  };
  
  return (
    <MusicPlayerContainer>
      <audio 
        ref={audioRef}
        src={currentTrack?.path}
        loop
        onEnded={() => setIsPlaying(false)}
      />
      
      <IconButton 
        onClick={togglePlayPause}
        disabled={!currentTrack || isLoading}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </IconButton>
      
      <IconButton 
        onClick={toggleMute}
        disabled={!currentTrack || isLoading}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </IconButton>
      
      <VolumeControl
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        disabled={!currentTrack || isLoading}
      />
    </MusicPlayerContainer>
  );
};

export default MusicPlayer;
