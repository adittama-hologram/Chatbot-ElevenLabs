import { Conversation } from '@elevenlabs/client';

let conversationInst = null;

export const initElevenLabsAgent = async (agentId, apiKey, options) => {
  if (!agentId) {
    console.warn("Missing ElevenLabs Agent ID.");
    return false;
  }
  
  try {
    const { onConnect, onDisconnect, onError, onMessage, stream } = options || {};
    
    // Start session using the official ElevenLabs Conversational AI SDK
    conversationInst = await Conversation.startSession({
      agentId: agentId,
      audioDescription: {
        stream: stream // Pass existing stream if available
      },
      onConnect: () => {
        if (onConnect) onConnect();
      },
      onDisconnect: () => {
        if (onDisconnect) onDisconnect();
      },
      onError: (err) => {
        console.error("ElevenLabs Session Error:", err);
        if (onError) onError(err);
      },
      onMessage: (message) => {
        console.log("ElevenLabs msg:", message);
        
        // If the message is from the AI, it's likely starting to speak.
        // We can temporarily lower the mic volume to prevent echo feedback
        // if the device hardware doesn't handle it well.
        if (message.source === 'ai') {
           setMicVolume(0.1); // Lower mic sensitivity during AI speech
           // Restore after a delay (this is a simple heuristic since SDK doesn't expose speech end)
           setTimeout(() => setMicVolume(1.0), 5000); 
        }
        
        if (onMessage) onMessage(message);
      }
    });
    
    return true; 
  } catch (error) {
    console.error("Failed to initialize ElevenLabs agent", error);
    return false;
  }
};

export const endConversation = async () => {
  if (conversationInst) {
    await conversationInst.endSession();
    conversationInst = null;
  }
};

export const setMicVolume = async (volumeLevel) => {
  if (conversationInst) {
    try {
      await conversationInst.setVolume({ microphone: volumeLevel });
    } catch (e) {
      console.warn("Failed to set mic volume", e);
    }
  }
};
