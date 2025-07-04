/**
 * Utility functions for video call channel ID generation
 */

export interface ChannelIdOptions {
  businessUserId: string;
  businessName?: string;
  businessUsername?: string;
  appointmentType?: string;
  customPrefix?: string;
}

/**
 * Generate a channel ID for video calls
 * @param options - Configuration options for channel ID generation
 * @returns A unique channel ID string
 */
export const generateChannelId = (options: ChannelIdOptions): string => {
  const {
    businessUserId,
    businessName,
    businessUsername,
    appointmentType = 'appointment',
    customPrefix
  } = options;

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  
  // Choose the format based on available data
  if (customPrefix) {
    return `${customPrefix}-${businessUserId}-${timestamp}`;
  }
  
  if (businessUsername) {
    return `${appointmentType}-${businessUsername}-${timestamp}`;
  }
  
  if (businessName) {
    return `${appointmentType}-${businessName.replace(/\s+/g, '-')}-${timestamp}`;
  }
  
  // Default format
  return `${appointmentType}-${businessUserId}-${timestamp}`;
};

/**
 * Generate a simple channel ID with just user ID and timestamp
 */
export const generateSimpleChannelId = (userId: string): string => {
  return `call-${userId}-${Date.now()}`;
};

/**
 * Generate a channel ID with business name
 */
export const generateBusinessChannelId = (userId: string, businessName: string): string => {
  const cleanName = businessName.replace(/\s+/g, '-').toLowerCase();
  return `business-${cleanName}-${userId}-${Date.now()}`;
};

/**
 * Generate a meeting-style channel ID
 */
export const generateMeetingChannelId = (userId: string, title?: string): string => {
  const meetingTitle = title ? title.replace(/\s+/g, '-').toLowerCase() : 'meeting';
  return `${meetingTitle}-${userId}-${Date.now()}`;
};

/**
 * Generate a consistent channel name for a business
 * This creates the same channel name every time for the same business
 */
export const generateBusinessChannelName = (businessUserId: string, businessName?: string, businessUsername?: string): string => {
  if (businessUsername) {
    return `business-${businessUsername.toLowerCase()}`;
  }
  
  if (businessName) {
    const cleanName = businessName.replace(/\s+/g, '-').toLowerCase();
    return `business-${cleanName}`;
  }
  
  return `business-${businessUserId}`;
};

/**
 * Generate a consistent appointment channel name
 */
export const generateAppointmentChannelName = (businessUserId: string, businessName?: string): string => {
  if (businessName) {
    const cleanName = businessName.replace(/\s+/g, '-').toLowerCase();
    return `appointment-${cleanName}`;
  }
  
  return `appointment-${businessUserId}`;
};

/**
 * Generate a consistent consultation channel name
 */
export const generateConsultationChannelName = (businessUserId: string, businessName?: string): string => {
  if (businessName) {
    const cleanName = businessName.replace(/\s+/g, '-').toLowerCase();
    return `consultation-${cleanName}`;
  }
  
  return `consultation-${businessUserId}`;
};

/**
 * Generate a consistent support channel name
 */
export const generateSupportChannelName = (businessUserId: string, businessName?: string): string => {
  if (businessName) {
    const cleanName = businessName.replace(/\s+/g, '-').toLowerCase();
    return `support-${cleanName}`;
  }
  
  return `support-${businessUserId}`;
}; 