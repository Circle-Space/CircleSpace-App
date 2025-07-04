// Agora Configuration
// ✅ Updated with your new Agora project credentials

export default {
  appId: '5b73f5e1629145d4ae85111cb71d9957', // Your App ID
  channelId: 'testchannel', // Default channel ID for testing
  
  // 🔐 SECURE CONFIGURATION (with App Certificate)
  // ⚠️  IMPORTANT: Replace this with your actual App Certificate from Agora Console
  appCertificate: 'b4958bf1dc6a474a9b63fa76d30659a1', // Get this from Agora Console
  
  // 🔧 TOKEN OPTIONS:
  // Option 1: Empty token (for insecure projects) - RECOMMENDED FOR TESTING
  token: '', // Empty token for insecure project - this will fix Error 110
  
  // Option 2: Use your token (for secure projects - may expire)
  // token: '007eJxTYHDuj6uKeWozJfZc3gmlqX2iYjXbU2YweLBxvXq808K2zEmBwdTQIDUtKcXMwjTZxMQwLdHC0tTIMCk5Oc3SIMXC0NC4ZWV6RkMgI0Om2UxmRgYIBPE5GUqKU0vKMlNS8xkYAFfoH4Q=',
  
  uid: 0, // 0 means Agora will assign a UID automatically
  logFilePath: '', // Optional: path for log files
};

// 📋 IMPORTANT: Token vs Insecure Projects
// 
// 🔒 TOKEN PROJECTS (Secure):
// - Require valid token for connection
// - Tokens expire (usually 24 hours)
// - Need server to generate tokens
// - More secure for production
// 
// 🔓 INSECURE PROJECTS (Development):
// - No token required
// - Use empty token: token: ''
// - Good for testing and development
// - Less secure, not recommended for production
// 
// 💡 SOLUTION: Using insecure project for testing
// This will fix Error 110 immediately! 