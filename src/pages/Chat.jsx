import React, { useState, useEffect, useRef } from 'react';
import { initElevenLabsAgent, endConversation, setMicVolume } from '../services/elevenlabsAPI';
import askMeImage from '../resources/Ask Me!.png';
import listeningImage from '../resources/Listerning.png';
import waveformImage from '../resources/Waveform.png';

const Chat = () => {
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const streamRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const silenceTimeoutRef = useRef(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleRequestMic = async () => {
    // Check for Secure Context (HTTPS is mandatory for mic access on mobile)
    if (!window.isSecureContext) {
      alert("Microphone access requires a secure connection (HTTPS). If you are testing locally, please use localhost or a secure tunnel (like ngrok).");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      setHasMicPermission(true);
      setIsRecording(true);
      setIsMuted(false);
      
      const success = await initElevenLabsAgent(
        import.meta.env.VITE_ELEVENLABS_AGENT_ID, 
        import.meta.env.VITE_ELEVENLABS_API_KEY,
        {
          stream,
          onConnect: () => {},
          onDisconnect: () => setIsRecording(false),
          onModeChange: (info) => {
            setIsAiSpeaking(info.mode === 'speaking');
          },
          onMessage: (msg) => {},
          onError: (err) => {
            console.error(err);
            setIsRecording(false);
          }
        }
      );

      if(!success) {
         setIsRecording(false);
         alert("Failed to connect. Please check your Agent ID.");
      }
    } catch (err) {
      console.error(err);
      alert(`Microphone error: ${err.message || "Permission denied"}. Please ensure you have given microphone access in your browser settings and are using HTTPS.`);
    }
  };

  const handleEndConv = async () => {
    setIsRecording(false);
    await endConversation();
  };

  const handleToggleMute = async () => {
    const newMuteState = !isMuted;
    
    // 1. Force explicitly mute ALL media tracks in our local browser stream
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMuteState;
      });
    }

    // 2. Synchronize UI State
    setIsMuted(newMuteState);
    
    // 3. Actively mandate the ElevenLabs internal engine to cut its mic inputs
    await setMicVolume(newMuteState ? 0 : 1);
  };

  useEffect(() => {
    if (isRecording && isMuted && !isAiSpeaking) {
      silenceTimeoutRef.current = setTimeout(async () => {
        setIsRecording(false);
        setIsMuted(false);
        setIsAiSpeaking(false);
        await endConversation();
      }, 15000);
    } else {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [isRecording, isMuted, isAiSpeaking]);

  const toggleAction = isRecording ? handleToggleMute : handleRequestMic;

  return (
    <div className="main-container">
      <div className="top-app-bar">
        <div className="container">
          <div className="heading"><div className="ignite-fy-logos"></div></div>
        </div>
      </div>

      <div className="ask-me-container" style={{ position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)', zIndex: 15 }}>
        <img src={askMeImage} alt="Ask Me!" style={{ maxWidth: '45vw', maxHeight: '6vh' }} />
      </div>

      <div className="container-1">
        <div className="concentric-rings"></div>
        {isRecording && isAiSpeaking && (
          <>
            <div className="border pulse-animate"></div>
            <div className="border-2 pulse-animate-delayed"></div>
          </>
        )}
        {isRecording && isAiSpeaking && <div className="pulse-effects"></div>}
        <div className="microphone-button" onClick={toggleAction} style={{ cursor: 'pointer' }}>
          <div className="microphone-button-shadow"></div>
          <div className="gradient-blur"></div>
          <div className="overlay-border-overlayblur">
            <div className={`icon ${isRecording && !isMuted ? 'icon-listening' : ''}`} style={isMuted ? { opacity: 0.4 } : {}}></div>
          </div>
        </div>
      </div>
      
      {!isRecording && (
        <div className="ai-status-label">
          <div className="overlay-overlayblur" onClick={toggleAction} style={{ cursor: 'pointer' }}>
            <span className="tap-to-start">TAP TO START</span>
          </div>
        </div>
      )}

      {isRecording && !isMuted && (
        <div className="active-listening-container" style={{ position: 'absolute', top: '63%', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 19, gap: '20px' }}>
          <img src={listeningImage} alt="Listening..." style={{ maxWidth: '80vw', maxHeight: '14vh' }} />
          <div className="css-waveform">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      )}
      
      <div className="orange-blades"></div>

      {!isFullscreen && (
        <button className="fullscreen-button" onClick={toggleFullscreen} title="Enter Fullscreen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Chat;
