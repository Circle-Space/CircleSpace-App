import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface VideoCallState {
  isInCall: boolean;
  channelId: string;
  token: string;
  uid: number;
}

interface UseVideoCallReturn {
  videoCallState: VideoCallState;
  startCall: (channelId: string, token?: string, uid?: number) => void;
  endCall: () => void;
  updateChannelId: (channelId: string) => void;
  updateToken: (token: string) => void;
  updateUid: (uid: number) => void;
}

export const useVideoCall = (): UseVideoCallReturn => {
  const [videoCallState, setVideoCallState] = useState<VideoCallState>({
    isInCall: false,
    channelId: '',
    token: '',
    uid: 0,
  });

  const startCall = useCallback((channelId: string, token: string = '', uid: number = 0) => {
    if (!channelId.trim()) {
      Alert.alert('Error', 'Channel ID is required');
      return;
    }

    setVideoCallState({
      isInCall: true,
      channelId: channelId.trim(),
      token: token.trim(),
      uid,
    });
  }, []);

  const endCall = useCallback(() => {
    setVideoCallState(prev => ({
      ...prev,
      isInCall: false,
    }));
  }, []);

  const updateChannelId = useCallback((channelId: string) => {
    setVideoCallState(prev => ({
      ...prev,
      channelId,
    }));
  }, []);

  const updateToken = useCallback((token: string) => {
    setVideoCallState(prev => ({
      ...prev,
      token,
    }));
  }, []);

  const updateUid = useCallback((uid: number) => {
    setVideoCallState(prev => ({
      ...prev,
      uid,
    }));
  }, []);

  return {
    videoCallState,
    startCall,
    endCall,
    updateChannelId,
    updateToken,
    updateUid,
  };
}; 