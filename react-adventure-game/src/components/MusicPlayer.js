import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaMusic } from 'react-icons/fa';

const MusicPlayerContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
`;

const MusicIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0.8;
  font-size: 16px;
  margin-right: 2px;
`;

const MusicControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* Add a label underneath the button */
  position: relative;
  
  &::after {
    content: attr(data-label);
    position: absolute;
    bottom: -18px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    white-space: nowrap;
    opacity: 0.8;
  }
`;

const VolumeControl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const VolumeSlider = styled.input`
  -webkit-appearance: none;
  width: 80px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin: 0 4px;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
`;

const VolumeLabel = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
`;

const TrackInfo = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 120px;
  display: flex;
  flex-direction: column;
`;

const TrackName = styled.div`
  font-weight: 500;
`;

const TrackLabel = styled.div`
  font-size: 10px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MusicPlayer = ({ description, sessionId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const lastTrackRef = useRef(null);
  
  // Initialize with auto-play when component mounts
  useEffect(() => {
    // We'll attempt to auto-play when a track is loaded
    const autoPlayOnLoad = (e) => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.log('Auto-play prevented by browser policy, waiting for user interaction');
            // We'll keep the state as not playing
            setIsPlaying(false);
          });
      }
    };
    
    if (audioRef.current) {
      audioRef.current.addEventListener('canplaythrough', autoPlayOnLoad);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', autoPlayOnLoad);
      }
    };
  }, []);
  
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
          
          // Only change the track if it's different from the current one
          // or if the API indicates this is a new selection
          const isNewTrack = !lastTrackRef.current || 
                             lastTrackRef.current.id !== data.track.id;
          
          // Update the current track for display purposes even if it's the same track
          setCurrentTrack(data.track);
          
          // Only change the audio source and restart playing if it's a new track
          if (isNewTrack) {
            console.log('Changing to new track');
            lastTrackRef.current = data.track;
            
            // If audio is already playing, change the source and start playing
            if (audioRef.current) {
              audioRef.current.src = data.track.path;
              
              if (isPlaying) {
                audioRef.current.play().catch(e => console.error('Error playing audio:', e));
              }
            }
          } else {
            console.log('Continuing with current track (no restart)');
            // The track is the same as before, no need to change anything
            // Just ensure the current track reference is up to date
            lastTrackRef.current = data.track;
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
      
      <MusicIcon>
        <FaMusic />
      </MusicIcon>
      
      <MusicControls>
        <ControlButton 
          onClick={togglePlayPause}
          disabled={!currentTrack || isLoading}
          title={isPlaying ? "Pause" : "Play"}
          data-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </ControlButton>
        
        <ControlButton 
          onClick={toggleMute}
          disabled={!currentTrack || isLoading}
          title={isMuted ? "Unmute" : "Mute"}
          data-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </ControlButton>
        
        <VolumeControl>
          <VolumeSlider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            disabled={!currentTrack || isLoading}
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
          <VolumeLabel>Volume {Math.round(volume * 100)}%</VolumeLabel>
        </VolumeControl>
        
        {currentTrack && (
          <TrackInfo title={currentTrack.name}>
            <TrackLabel>Now Playing</TrackLabel>
            <TrackName>{currentTrack.name}</TrackName>
          </TrackInfo>
        )}
      </MusicControls>
    </MusicPlayerContainer>
  );
};

export default MusicPlayer;
