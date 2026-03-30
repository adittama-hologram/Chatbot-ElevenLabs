import React, { useState, useEffect } from 'react';
import { initElevenLabsAgent, endConversation } from '../services/elevenlabsAPI';

const Chat = () => {
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    try {
      await navigator.mediaDevices.getUserMedia({ 
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true
        } 
      });
      setHasMicPermission(true);
      setIsRecording(true);
      
      const success = await initElevenLabsAgent(
        import.meta.env.VITE_ELEVENLABS_AGENT_ID, 
        import.meta.env.VITE_ELEVENLABS_API_KEY,
        {
          onConnect: () => {},
          onDisconnect: () => setIsRecording(false),
          onMessage: (msg) => {},
          onError: () => setIsRecording(false)
        }
      );

      if(!success) {
         setIsRecording(false);
         alert("Failed to connect. Please check your Agent ID.");
      }
    } catch (err) {
      alert("Microphone permission denied.");
    }
  };

  const handleEndConv = async () => {
    setIsRecording(false);
    await endConversation();
  };

  const toggleAction = isRecording ? handleEndConv : handleRequestMic;

  return (
    <div className="main-container">
      <div className="top-app-bar">
        <div className="container">
          <div className="heading"><div className="ignite-fy-logos"></div></div>
        </div>
      </div>
      
      {isRecording && (
        <div className="overlay">
          <div className="background"></div>
          <span className="live-session">LIVE SESSION</span>
        </div>
      )}
      
      <div className="container-1">
        <div className="concentric-rings"></div>
        {isRecording && (
          <>
            <div className="border pulse-animate"></div>
            <div className="border-2 pulse-animate-delayed"></div>
          </>
        )}
        {isRecording && <div className="pulse-effects"></div>}
        <div className="microphone-button" onClick={toggleAction} style={{ cursor: 'pointer' }}>
          <div className="microphone-button-shadow"></div>
          <div className="gradient-blur"></div>
          <div className={`overlay-border-overlayblur ${isRecording ? 'pulse-animate' : ''}`}>
            <div className={`icon ${isRecording ? 'icon-listening' : ''}`}></div>
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
