import { Conversation } from '@elevenlabs/client';

let conversationInst = null;

// The ElevenLabs SDK is likely bypassing our stream and secretly requesting its own.
// We intercept all getUserMedia calls and trap their tracks indefinitely to enforce mute natively.
let elevenLabsSDKTracks = [];
const originalGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
navigator.mediaDevices.getUserMedia = async (constraints) => {
  const stream = await originalGUM(constraints);
  stream.getAudioTracks().forEach(t => elevenLabsSDKTracks.push(t));
  return stream;
};

export const initElevenLabsAgent = async (agentId, apiKey, options) => {
  if (!agentId) {
    console.warn("Missing ElevenLabs Agent ID.");
    return false;
  }
  elevenLabsSDKTracks = []; // Reset on new session
  
  try {
    const { onConnect, onDisconnect, onError, onMessage, onModeChange, stream } = options || {};
    
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
      onModeChange: (info) => {
        if (onModeChange) onModeChange(info);
      },
      onMessage: (message) => {
        console.log("ElevenLabs msg:", message);
        
        // We rely on standard WebRTC echoCancellation now.
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
  const shouldBeEnabled = (volumeLevel > 0);

  // Brutally enforce WebRTC track muting on ANY track ElevenLabs secretly requested
  elevenLabsSDKTracks.forEach(t => {
    if (t) t.enabled = shouldBeEnabled;
  });

  if (conversationInst) {
    try {
      if (typeof conversationInst.setVolume === 'function') {
        await conversationInst.setVolume({ microphone: volumeLevel });
      }
      if (typeof conversationInst.setMicMuted === 'function') {
        await conversationInst.setMicMuted(volumeLevel === 0);
      }
      if (typeof conversationInst.setMuted === 'function') {
        await conversationInst.setMuted(volumeLevel === 0);
      }
      if (conversationInst.input && typeof conversationInst.input.setMuted === 'function') {
        await conversationInst.input.setMuted(volumeLevel === 0);
      }
    } catch (e) {
      console.warn("Failed to set mic volume / mute state", e);
    }
  }
};
