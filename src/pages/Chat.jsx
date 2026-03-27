import React, { useState } from 'react';
import { initElevenLabsAgent, endConversation } from '../services/elevenlabsAPI';

const Chat = () => {
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
        <div className="border"></div>
        <div className="border-2"></div>
        {isRecording && <div className="pulse-effects"></div>}
        <div className="microphone-button" onClick={toggleAction} style={{ cursor: 'pointer' }}>
          <div className="microphone-button-shadow"></div>
          <div className="gradient-blur"></div>
          <div className="overlay-border-overlayblur"><div className="icon"></div></div>
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
    </div>
  );
};

export default Chat;
