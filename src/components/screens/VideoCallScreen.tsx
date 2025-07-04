import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import VideoCall from '../agora/VideoCall';
import Icon from 'react-native-vector-icons/Ionicons';

interface VideoCallScreenProps {
  route?: {
    params?: {
      channelId?: string;
      token?: string;
      uid?: number;
    };
  };
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const [isInCall, setIsInCall] = useState(false);
  const [channelId, setChannelId] = useState(route?.params?.channelId || 'test-channel');
  const [token, setToken] = useState(route?.params?.token || '');
  const [uid, setUid] = useState(route?.params?.uid || 0);

  const startCall = () => {
    if (!channelId.trim()) {
      Alert.alert('Error', 'Please enter a channel ID');
      return;
    }
    setIsInCall(true);
  };

  const endCall = () => {
    setIsInCall(false);
    navigation.goBack();
  };

  if (isInCall) {
    return (
      <VideoCall
        channelId={channelId}
        token={token}
        uid={uid}
        onEndCall={endCall}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video Call</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Channel ID</Text>
          <TextInput
            style={styles.input}
            value={channelId}
            onChangeText={setChannelId}
            placeholder="Enter channel ID"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Token (Optional)</Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder="Enter token (leave empty for testing)"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>UID (Optional)</Text>
          <TextInput
            style={styles.input}
            value={uid.toString()}
            onChangeText={(text) => setUid(parseInt(text) || 0)}
            placeholder="Enter UID (0 for auto-assign)"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startCall}>
          <Icon name="call" size={24} color="#fff" />
          <Text style={styles.startButtonText}>Start Video Call</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How to use:</Text>
          <Text style={styles.infoText}>
            • Enter a unique channel ID for your call{'\n'}
            • Share the same channel ID with others to join{'\n'}
            • For testing, you can leave token empty{'\n'}
            • For production, implement token generation on your server
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default VideoCallScreen; 