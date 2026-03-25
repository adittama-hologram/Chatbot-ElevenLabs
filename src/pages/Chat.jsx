import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initElevenLabsAgent, endConversation } from '../services/elevenlabsAPI';

const Chat = () => {
  const navigate = useNavigate();
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState([]);

  const handleRequestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      setIsRecording(true);
      setHistory(prev => [...prev, { role: 'system', text: 'Microphone connected. Initializing Agent...' }]);
      
      const success = await initElevenLabsAgent(
        import.meta.env.VITE_ELEVENLABS_AGENT_ID, 
        import.meta.env.VITE_ELEVENLABS_API_KEY,
        {
          onConnect: () => {
             setHistory(prev => [...prev, { role: 'system', text: 'Connected! Waiting for agent to speak...' }]);
          },
          onDisconnect: () => setHistory(prev => [...prev, { role: 'system', text: 'Agent Disconnected.' }]),
          onMessage: (msg) => {
            if (msg.source === 'ai' || msg.source === 'user') {
              setHistory(prev => [...prev, { role: msg.source === 'ai' ? 'agent' : 'user', text: msg.message }]);
            }
          },
          onError: () => setHistory(prev => [...prev, { role: 'system', text: 'Agent Error.' }])
        }
      );

      if(!success) {
         setHistory(prev => [...prev, { role: 'system', text: 'Failed to connect. Please check your Agent ID.' }]);
         setIsRecording(false);
      }
    } catch (err) {
      alert("Microphone permission denied.");
    }
  };

  const handleEndConv = async () => {
    setIsRecording(false);
    await endConversation();
    setHistory(prev => [...prev, { role: 'system', text: 'Conversation Ended.' }]);
  };

  const handleBack = async () => {
    if (isRecording) {
      await handleEndConv();
    }
    navigate('/');
  };

  return (
    <div style={{ padding: '1rem', height: '100dvh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: 'var(--primary-orange)', margin: 0 }}>Active Conversation</h2>
        <button onClick={handleBack} style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'var(--secondary-white)', border: '1px solid #ccc' }}>Back to Home</button>
      </header>

      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '8px', padding: '0.75rem', overflowY: 'auto', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {history.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', fontSize: '14px' }}>Conversation history will appear here...</p>
        ) : (
          history.map((msg, idx) => (
            <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? 'var(--primary-orange)' : '#eee', color: msg.role === 'user' ? 'white' : 'black', padding: '6px 10px', borderRadius: '10px', maxWidth: '85%', fontSize: '14px', lineHeight: '1.3' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', display: 'block', marginBottom: '2px', opacity: 0.7 }}>{msg.role.toUpperCase()}</span>
              {msg.text}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
        {!hasMicPermission ? (
          <button 
            onClick={handleRequestMic}
            style={{ padding: '12px 24px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
          >
            Allow Microphone & Start
          </button>
        ) : (
          <button 
            onClick={handleEndConv}
            disabled={!isRecording}
            style={{ padding: '12px 24px', backgroundColor: isRecording ? '#F44336' : '#ccc', color: 'white', border: 'none', borderRadius: '8px', cursor: isRecording ? 'pointer' : 'not-allowed', fontSize: '16px' }}
          >
            End Conversation
          </button>
        )}
      </div>
    </div>
  );
};

export default Chat;
