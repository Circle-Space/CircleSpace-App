import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../../navigation/types';
import agoraConfig from '../../config/agora.config';
import { getTokenInfo, generateTokenForCurrentConfig, isAppCertificateConfigured } from '../../utils/tokenGenerator';

const VideoCallTest: React.FC = () => {
  const navigation = useNavigation<NavigationProps<'VideoCallTest'>>();

  const startVideoCall = () => {
    navigation.navigate('VideoCallScreen', {
      channelId: 'test-channel-123',
      token: agoraConfig.token,
      uid: agoraConfig.uid,
    });
  };

  const startStaticChannel = () => {
    navigation.navigate('VideoCallScreen', {
      channelId: '12345',
      token: agoraConfig.token,
      uid: agoraConfig.uid,
    });
  };

  const testConfiguration = () => {
    const tokenInfo = getTokenInfo(agoraConfig.token);
    const hasAppCertificate = isAppCertificateConfigured();
    
    const configStatus = {
      appId: {
        hasValue: !!agoraConfig.appId,
        isValid: agoraConfig.appId && agoraConfig.appId !== 'YOUR_NEW_APP_ID_HERE',
        length: agoraConfig.appId?.length || 0,
        preview: agoraConfig.appId ? `${agoraConfig.appId.substring(0, 20)}...` : 'No App ID'
      },
      token: tokenInfo,
      appCertificate: {
        hasValue: hasAppCertificate,
        configured: agoraConfig.appCertificate !== 'YOUR_APP_CERTIFICATE_HERE',
        preview: agoraConfig.appCertificate ? `${agoraConfig.appCertificate.substring(0, 20)}...` : 'Not configured'
      },
      channelId: {
        hasValue: !!agoraConfig.channelId,
        value: agoraConfig.channelId
      }
    };

    console.log('🔧 Configuration Test Results:', configStatus);

    let message = '📱 Configuration Test Results:\n\n';
    message += `App ID: ${configStatus.appId.preview}\n`;
    message += `App ID Valid: ${configStatus.appId.isValid ? '✅' : '❌'}\n`;
    message += `App Certificate: ${configStatus.appCertificate.preview}\n`;
    message += `App Certificate Configured: ${configStatus.appCertificate.configured ? '✅' : '❌'}\n`;
    message += `Token: ${configStatus.token.preview}\n`;
    message += `Token Valid: ${configStatus.token.isValid ? '✅' : '❌'}\n`;
    message += `Channel ID: ${configStatus.channelId.value}\n\n`;

    if (!configStatus.appId.isValid) {
      message += '❌ ISSUE: Invalid App ID\n';
      message += '💡 Fix: Update src/config/agora.config.ts with valid App ID\n\n';
    }

    if (!configStatus.appCertificate.configured) {
      message += '⚠️  WARNING: App Certificate not configured\n';
      message += '💡 Fix: Add your App Certificate for secure token generation\n\n';
    }

    if (configStatus.token.hasToken && !configStatus.token.isValid) {
      message += '⚠️  WARNING: Token provided but appears invalid\n';
      message += '💡 Fix: Use empty token for insecure project or get fresh token\n\n';
    }

    if (configStatus.appId.isValid && (!configStatus.token.hasToken || configStatus.token.isValid)) {
      message += '✅ Configuration looks good! Try starting a video call.';
    } else {
      message += '🔧 Please fix the issues above before testing video calls.';
    }

    Alert.alert('Configuration Test', message);
  };

  const testTokenGeneration = () => {
    const hasAppCertificate = isAppCertificateConfigured();
    
    if (!hasAppCertificate) {
      Alert.alert(
        'App Certificate Required', 
        'Please configure your App Certificate in src/config/agora.config.ts to test token generation.'
      );
      return;
    }

    const testToken = generateTokenForCurrentConfig('test-channel', 123);
    const tokenInfo = getTokenInfo(testToken);
    
    let message = '🔐 Token Generation Test:\n\n';
    message += `Generated Token: ${tokenInfo.preview}\n`;
    message += `Token Length: ${tokenInfo.tokenLength}\n`;
    message += `Token Valid: ${tokenInfo.isValid ? '✅' : '❌'}\n\n`;
    
    if (tokenInfo.isValid) {
      message += '✅ Token generation successful!\n';
      message += '🔐 Secure video calls are ready.';
    } else {
      message += '❌ Token generation failed.\n';
      message += '🔧 Check App Certificate configuration.';
    }

    Alert.alert('Token Generation Test', message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎥 Video Call Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={testConfiguration}>
        <Text style={styles.buttonText}>🔧 Test Configuration</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testTokenGeneration}>
        <Text style={styles.buttonText}>🔐 Test Token Generation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={startVideoCall}>
        <Text style={styles.buttonText}>📞 Start Simple Test Call</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={startStaticChannel}>
        <Text style={styles.buttonText}>📺 Start Static Channel (Fixed ID: 12345)</Text>
      </TouchableOpacity>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>📋 Instructions:</Text>
        <Text style={styles.instructionText}>1. First test your configuration</Text>
        <Text style={styles.instructionText}>2. Add App Certificate for secure tokens</Text>
        <Text style={styles.instructionText}>3. Test token generation</Text>
        <Text style={styles.instructionText}>4. Start video call</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
});

export default VideoCallTest; 