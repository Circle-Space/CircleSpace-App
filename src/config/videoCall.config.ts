/**
 * Video Call Configuration
 * Centralized settings for video call functionality
 */

export const VideoCallConfig = {
  // Static channel ID - all users join this same channel
  STATIC_CHANNEL_ID: "12345",
  
  // Alternative static channel IDs you can use
  ALTERNATIVE_CHANNELS: {
    APPOINTMENT: "99999",
    CONSULTATION: "88888", 
    SUPPORT: "77777",
    GENERAL: "12345"
  },
  
  // Default token (empty for testing)
  DEFAULT_TOKEN: "",
  
  // Default user ID (0 = auto-assign)
  DEFAULT_UID: 0,
  
  // Channel name for display purposes
  CHANNEL_NAME: "Main Consultation Channel",
  
  // Maximum users in channel (0 = unlimited)
  MAX_USERS: 0,
  
  // Enable/disable features
  FEATURES: {
    MULTI_USER: true,
    VIDEO_CONTROLS: true,
    AUDIO_CONTROLS: true,
    CAMERA_SWITCH: true,
    USER_COUNT_DISPLAY: true
  }
};

/**
 * Get the static channel ID for video calls
 * @returns The static channel ID string
 */
export const getStaticChannelId = (): string => {
  return VideoCallConfig.STATIC_CHANNEL_ID;
};

/**
 * Get alternative channel ID by type
 * @param type - The type of channel (appointment, consultation, support, general)
 * @returns The channel ID for the specified type
 */
export const getChannelIdByType = (type: keyof typeof VideoCallConfig.ALTERNATIVE_CHANNELS): string => {
  return VideoCallConfig.ALTERNATIVE_CHANNELS[type];
}; 