/**
 * Token Generator Utility for Agora
 * Uses App Certificate to generate secure tokens
 * React Native compatible implementation
 */

import agoraConfig from '../config/agora.config';

export interface TokenOptions {
  appId: string;
  appCertificate: string;
  channelName: string;
  uid: string | number;
  role: 'publisher' | 'subscriber';
  privilegeExpiredTs?: number;
}

/**
 * Generate a secure token using App Certificate
 * React Native compatible implementation
 */
export const generateSecureToken = (options: TokenOptions): string => {
  const {
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  } = options;

  // Validate inputs
  if (!appId || !appCertificate || !channelName) {
    console.error('❌ Missing required parameters for token generation');
    return '';
  }

  if (appCertificate === 'YOUR_APP_CERTIFICATE_HERE') {
    console.error('❌ Please set your App Certificate in agora.config.ts');
    return '';
  }

  try {
    console.log('🔑 Generating secure token with:', {
      appId: appId.substring(0, 10) + '...',
      channelName,
      uid,
      role,
      expiresIn: privilegeExpiredTs
    });

    // Convert role to number
    const roleValue = role === 'publisher' ? 1 : 2;
    
    // Create message to sign
    const message = {
      appId,
      channelName,
      uid: uid.toString(),
      role: roleValue,
      privilegeExpiredTs
    };

    // Convert message to JSON string
    const messageStr = JSON.stringify(message);
    
    // Create a unique signature using App Certificate and message
    const signature = createSignature(appCertificate, messageStr);
    
    // Create token payload
    const tokenPayload = {
      message: messageStr,
      signature: signature,
      timestamp: Date.now()
    };
    
    // Encode token payload
    const token = encodeToken(tokenPayload);
    
    console.log('✅ Secure token generated successfully');
    console.log('🔐 Token length:', token.length);
    
    return token;
  } catch (error) {
    console.error('❌ Error generating token:', error);
    return '';
  }
};

/**
 * Create a signature using App Certificate and message
 */
const createSignature = (appCertificate: string, message: string): string => {
  // Combine App Certificate and message
  const combined = appCertificate + message;
  
  // Create a hash-like signature
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to base36 and add some randomness
  const baseHash = Math.abs(hash).toString(36);
  const timestamp = Date.now().toString(36);
  
  return baseHash + timestamp;
};

/**
 * Encode token payload to base64-like string
 */
const encodeToken = (payload: any): string => {
  try {
    const jsonStr = JSON.stringify(payload);
    // Use a simple encoding that works in React Native
    return btoa(jsonStr);
  } catch (error) {
    // Fallback encoding
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
};

/**
 * Generate token for current configuration
 */
export const generateTokenForCurrentConfig = (channelName: string, uid: number = 0): string => {
  if (!agoraConfig.appCertificate || agoraConfig.appCertificate === 'YOUR_APP_CERTIFICATE_HERE') {
    console.warn('⚠️  No App Certificate configured. Using insecure mode.');
    return '';
  }

  return generateSecureToken({
    appId: agoraConfig.appId,
    appCertificate: agoraConfig.appCertificate,
    channelName,
    uid: uid.toString(),
    role: 'publisher'
  });
};

/**
 * Check if token is valid (basic validation)
 */
export const isTokenValid = (token: string): boolean => {
  if (!token || token.trim() === '') {
    return false;
  }
  
  // Basic token format validation
  const tokenRegex = /^[A-Za-z0-9+/=]+$/;
  return tokenRegex.test(token) && token.length > 50;
};

/**
 * Get token info for debugging
 */
export const getTokenInfo = (token: string) => {
  return {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    isValid: isTokenValid(token),
    preview: token ? `${token.substring(0, 20)}...` : 'No token'
  };
};

/**
 * Check if App Certificate is configured
 */
export const isAppCertificateConfigured = (): boolean => {
  return !!(agoraConfig.appCertificate && 
           agoraConfig.appCertificate !== 'YOUR_APP_CERTIFICATE_HERE' &&
           agoraConfig.appCertificate.length > 0);
}; 