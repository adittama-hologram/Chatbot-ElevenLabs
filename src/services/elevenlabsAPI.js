import { Conversation } from '@elevenlabs/client';

let conversationInst = null;

export const initElevenLabsAgent = async (agentId, apiKey, callbacks) => {
  if (!agentId) {
    console.warn("Missing ElevenLabs Agent ID.");
    return false;
  }
  
  try {
    const { onConnect, onDisconnect, onError, onMessage } = callbacks || {};
    
    // Start session using the official ElevenLabs Conversational AI SDK
    conversationInst = await Conversation.startSession({
      agentId: agentId,
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
        // SDK typically returns object with source ('ai' or 'user') and message
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
