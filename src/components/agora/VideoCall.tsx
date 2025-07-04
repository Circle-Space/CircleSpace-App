import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  PermissionsAndroid,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  ErrorCodeType,
  IRtcEngineEventHandler,
  LocalAudioStats,
  LocalVideoStats,
  LocalVideoStreamReason,
  LocalVideoStreamState,
  QualityType,
  RemoteAudioStats,
  RemoteVideoStats,
  RtcConnection,
  RtcStats,
  RtcSurfaceView,
  RtcTextureView,
  UserOfflineReasonType,
  VideoCanvas,
  VideoSourceType,
  VideoViewSetupMode,
  createAgoraRtcEngine,
} from 'react-native-agora';
import Icon from 'react-native-vector-icons/Ionicons';
import Config from '../../config/agora.config';
import { getTokenInfo, generateTokenForCurrentConfig, isAppCertificateConfigured } from '../../utils/tokenGenerator';

const { width, height } = Dimensions.get('window');

interface VideoCallProps {
  channelId: string;
  token?: string;
  uid?: number;
  onEndCall?: () => void;
}

interface State {
  appId: string;
  enableVideo: boolean;
  channelId: string;
  token: string;
  uid: number;
  joinChannelSuccess: boolean;
  remoteUsers: number[];
  remoteUserStatsList: Map<
    number,
    { remoteVideoStats: RemoteVideoStats; remoteAudioStats: RemoteAudioStats }
  >;
  encodedFrameWidth: number;
  encodedFrameHeight: number;
  encoderOutputFrameRate: number;
  lastmileDelay: number;
  videoSentBitrate: number;
  audioSentBitrate: number;
  cpuAppUsage: number;
  cpuTotalUsage: number;
  txPacketLossRate: number;
  startPreview: boolean;
  switchCamera: boolean;
  renderByTextureView: boolean;
  setupMode: VideoViewSetupMode;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export default class VideoCall extends React.Component<VideoCallProps, State>
  implements IRtcEngineEventHandler
{
  private engine: any;
  private remoteUsers: number[] = [];

  constructor(props: VideoCallProps) {
    super(props);
    this.state = {
      appId: Config.appId,
      enableVideo: true,
      channelId: String(props.channelId || 'default-channel'),
      token: Config.token || '',
      uid: props.uid || 0,
      joinChannelSuccess: false,
      remoteUsers: [],
      remoteUserStatsList: new Map(),
      encodedFrameWidth: 0,
      encodedFrameHeight: 0,
      encoderOutputFrameRate: 0,
      lastmileDelay: 0,
      videoSentBitrate: 0,
      audioSentBitrate: 0,
      cpuAppUsage: 0,
      cpuTotalUsage: 0,
      txPacketLossRate: 0,
      startPreview: false,
      switchCamera: false,
      renderByTextureView: false,
      setupMode: VideoViewSetupMode.VideoViewSetupReplace,
      isMuted: false,
      isVideoEnabled: true,
    };

    // Log configuration details
    console.log('🔧 VideoCall Configuration:');
    console.log('📱 App ID:', Config.appId);
    console.log('📱 App ID Length:', Config.appId?.length);
    console.log('📱 Channel ID:', String(props.channelId || 'default-channel'));
    console.log('📱 Token:',Config.token || '');
    console.log('📱 UID:', props.uid || 0);
    console.log('📱 Config Object:', Config);
  }

  componentDidMount() {
    this.initRtcEngine();
  }

  componentWillUnmount() {
    this.releaseRtcEngine();
  }

  private async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
        
        if (
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else {
          Alert.alert('Permissions required', 'Camera and microphone permissions are required for video calls.');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  private async initRtcEngine() {
    const { appId } = this.state;
    console.log('🚀 Starting RTC Engine Initialization...');
    console.log('📱 Using App ID:', appId);
    console.log('📱 App ID Type:', typeof appId);
    console.log('📱 App ID Valid:', appId && appId !== 'YOUR_NEW_AGORA_APP_ID' && appId.length > 0);
    
    if (!appId || appId === 'YOUR_AGORA_APP_ID' || appId === 'YOUR_NEW_AGORA_APP_ID') {
      console.error('❌ Invalid App ID detected:', appId);
      Alert.alert('Error', 'Please configure your Agora App ID in src/config/agora.config.ts');
      return;
    }

    const permissionsGranted = await this.requestPermissions();
    if (!permissionsGranted) {
      console.log('❌ Permissions not granted');
      return;
    }

    try {
      console.log('✅ Creating Agora RTC Engine...');
      this.engine = createAgoraRtcEngine();
      
      console.log('✅ Initializing engine with App ID:', appId);
      this.engine.initialize({
        appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      
      console.log('✅ Registering event handler...');
      this.engine.registerEventHandler(this);

      console.log('✅ Enabling video...');
      this.engine.enableVideo();
      
      console.log('✅ Starting preview...');
      this.engine.startPreview();
      this.setState({ startPreview: true });

      console.log('✅ Joining channel...');
      this.joinChannel();
    } catch (error) {
      console.error('❌ Error initializing RTC engine:', error);
      Alert.alert('Error', `Failed to initialize video call: ${error}`);
    }
  }

  private joinChannel() {
    const { channelId, token, uid } = this.state;
    
    // Check if we should generate a secure token
    const hasAppCertificate = isAppCertificateConfigured();
    let finalToken = token;
    
    if (hasAppCertificate && (!token || token.trim() === '')) {
      console.log('🔐 App Certificate detected, generating secure token...');
      finalToken = generateTokenForCurrentConfig(channelId, uid);
      
      if (finalToken) {
        console.log('✅ Secure token generated successfully');
        this.setState({ token: finalToken });
      } else {
        console.warn('⚠️  Failed to generate secure token, using empty token');
        finalToken = '';
      }
    }
    
    // Token validation
    const tokenInfo = getTokenInfo(finalToken);
    console.log('🔑 Token validation:', tokenInfo);
    
    console.log('🔗 Attempting to join channel:', channelId);
    console.log('🔑 Token:', tokenInfo.preview);
    console.log('🆔 UID:', uid);
    console.log('🔐 Using App Certificate:', hasAppCertificate ? 'Yes' : 'No');
    
    if (!channelId) {
      const errorMsg = '❌ Channel ID is required!';
      console.error(errorMsg);
      Alert.alert('Configuration Error', errorMsg);
      return;
    }

    // Check token validity
    if (finalToken && !tokenInfo.isValid) {
      console.warn('⚠️  Token provided but appears invalid. Consider using empty token for insecure project.');
      console.warn('💡 To fix Error 110: Either use empty token for insecure project or get fresh token');
    }

    try {
      console.log('📞 Calling engine.joinChannel...');
      console.log('📞 Parameters:', { token: tokenInfo.preview, channelId, uid });
      
      this.engine?.joinChannel(finalToken, channelId, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      console.log('✅ joinChannel called successfully');
    } catch (error) {
      console.error('❌ Error joining channel:', error);
      Alert.alert('Connection Error', `Failed to join video call: ${error}`);
    }
  }

  private leaveChannel = () => {
    try {
      this.engine?.leaveChannel();
      this.props.onEndCall?.();
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  private releaseRtcEngine() {
    try {
      this.engine?.unregisterEventHandler(this);
      this.engine?.release();
    } catch (error) {
      console.error('Error releasing RTC engine:', error);
    }
  }

  private switchCamera = () => {
    try {
      this.engine?.switchCamera();
      this.setState(prevState => ({ switchCamera: !prevState.switchCamera }));
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  private toggleMute = () => {
    try {
      this.engine?.muteLocalAudioStream(!this.state.isMuted);
      this.setState(prevState => ({ isMuted: !prevState.isMuted }));
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  private toggleVideo = () => {
    try {
      this.engine?.enableLocalVideo(!this.state.isVideoEnabled);
      this.setState(prevState => ({ isVideoEnabled: !prevState.isVideoEnabled }));
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  // IRtcEngineEventHandler implementations
  onError(err: ErrorCodeType, msg: string) {
    console.error('❌ Agora error:', err, msg);
    
    // Provide specific guidance for common errors
    let errorGuidance = '';
    
    if (err === ErrorCodeType.ErrInvalidArgument) {
      errorGuidance = '\n\n🔧 How to fix Error 110 (Invalid Argument):\n' +
        '1. Use empty token for insecure project\n' +
        '2. Or get fresh token from Agora Console\n' +
        '3. Check if App ID is valid and not expired';
    } else if (err === ErrorCodeType.ErrNotReady) {
      errorGuidance = '\n\n🔧 How to fix Error 1001 (Not Ready):\n' +
        '1. Check your internet connection\n' +
        '2. Verify App ID is correct\n' +
        '3. Ensure channel name is valid';
    } else if (err === ErrorCodeType.ErrVdmCameraNotAuthorized) {
      errorGuidance = '\n\n🔧 How to fix Camera Not Authorized:\n' +
        '1. Check camera permissions\n' +
        '2. Verify camera device is working\n' +
        '3. Restart the app';
    }
    
    const fullMessage = `Error ${err}: ${msg}${errorGuidance}`;
    console.error('Full error details:', fullMessage);
    Alert.alert('Agora Error', fullMessage);
  }

  onJoinChannelSuccess(connection: RtcConnection, elapsed: number) {
    console.log('✅ Successfully joined channel:', String(this.state.channelId));
    console.log('Connection elapsed time:', elapsed, 'ms');
    this.setState({ joinChannelSuccess: true });
  }

  onJoinChannelFailure(connection: RtcConnection, elapsed: number, reason: number) {
    console.error('❌ Failed to join channel:', String(this.state.channelId));
    console.error('Failure reason:', reason);
    console.error('Elapsed time:', elapsed, 'ms');
    Alert.alert('Connection Failed', `Failed to join channel. Reason: ${reason}`);
  }

  onLeaveChannel(connection: RtcConnection, stats: RtcStats) {
    console.log('Left channel:', String(this.state.channelId));
    this.setState({ joinChannelSuccess: false, remoteUsers: [] });
  }

  onUserJoined(connection: RtcConnection, remoteUid: number, elapsed: number) {
    console.log('Remote user joined channel:', String(this.state.channelId), 'User ID:', remoteUid);
    console.log('Total users in channel:', this.remoteUsers.length + 1);
    this.remoteUsers.push(remoteUid);
    this.setState({ remoteUsers: [...this.remoteUsers] });
  }

  onUserOffline(
    connection: RtcConnection,
    remoteUid: number,
    reason: UserOfflineReasonType
  ) {
    console.log('Remote user left channel:', String(this.state.channelId), 'User ID:', remoteUid);
    console.log('Remaining users in channel:', this.remoteUsers.length - 1);
    this.remoteUsers = this.remoteUsers.filter(uid => uid !== remoteUid);
    this.setState({ remoteUsers: [...this.remoteUsers] });
  }

  onRtcStats(connection: RtcConnection, stats: RtcStats): void {
    this.setState({
      lastmileDelay: stats.lastmileDelay || 0,
      cpuAppUsage: stats.cpuAppUsage || 0,
      cpuTotalUsage: stats.cpuTotalUsage || 0,
      txPacketLossRate: stats.txPacketLossRate || 0,
    });
  }

  onLocalVideoStats(connection: RtcConnection, stats: LocalVideoStats): void {
    this.setState({
      videoSentBitrate: stats.sentBitrate || 0,
      encodedFrameWidth: stats.encodedFrameWidth || 0,
      encodedFrameHeight: stats.encodedFrameHeight || 0,
      encoderOutputFrameRate: stats.encoderOutputFrameRate || 0,
    });
  }

  onLocalAudioStats(connection: RtcConnection, stats: LocalAudioStats): void {
    this.setState({
      audioSentBitrate: stats.sentBitrate || 0,
    });
  }

  onRemoteVideoStats(connection: RtcConnection, stats: RemoteVideoStats): void {
    const { remoteUserStatsList } = this.state;
    if (stats.uid) {
      remoteUserStatsList.set(stats.uid, {
        remoteVideoStats: stats,
        remoteAudioStats:
          remoteUserStatsList.get(stats.uid)?.remoteAudioStats || {} as RemoteAudioStats,
      });
    }
  }

  onRemoteAudioStats(connection: RtcConnection, stats: RemoteAudioStats): void {
    const { remoteUserStatsList } = this.state;
    if (stats.uid) {
      remoteUserStatsList.set(stats.uid, {
        remoteVideoStats:
          remoteUserStatsList.get(stats.uid)?.remoteVideoStats || {} as RemoteVideoStats,
        remoteAudioStats: stats,
      });
    }
  }

  renderLocalVideo() {
    const { renderByTextureView, setupMode, joinChannelSuccess, isVideoEnabled } = this.state;
    
    if (!isVideoEnabled) {
      return (
        <View style={styles.disabledVideoContainer}>
          <Icon name="videocam-off" size={50} color="#666" />
          <Text style={styles.disabledVideoText}>Camera Off</Text>
        </View>
      );
    }

    return (
      <>
        {renderByTextureView ? (
          <RtcTextureView
            style={styles.localVideo}
            canvas={{ uid: 0, setupMode }}
          />
        ) : (
          <RtcSurfaceView
            style={styles.localVideo}
            canvas={{ uid: 0, setupMode }}
          />
        )}
      </>
    );
  }

  renderRemoteVideos() {
    const { remoteUsers, renderByTextureView, setupMode } = this.state;
    
    return remoteUsers.map(uid => (
      <View key={uid} style={styles.remoteVideoContainer}>
        {renderByTextureView ? (
          <RtcTextureView
            style={styles.remoteVideo}
            canvas={{ uid, setupMode }}
          />
        ) : (
          <RtcSurfaceView
            style={styles.remoteVideo}
            canvas={{ uid, setupMode }}
          />
        )}
      </View>
    ));
  }

  renderControls() {
    const { isMuted, isVideoEnabled, joinChannelSuccess } = this.state;
    
    return (
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={this.toggleMute}
        >
          <Icon 
            name={isMuted ? "mic-off" : "mic"} 
            size={24} 
            color={isMuted ? "#fff" : "#000"} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={this.leaveChannel}
        >
          <Icon name="call" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]}
          onPress={this.toggleVideo}
        >
          <Icon 
            name={isVideoEnabled ? "videocam" : "videocam-off"} 
            size={24} 
            color={isVideoEnabled ? "#000" : "#fff"} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={this.switchCamera}
        >
          <Icon name="camera-reverse" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const { joinChannelSuccess, remoteUsers, channelId } = this.state;
    console.log('🔑 Token:', this.state.token);
    const totalUsers = remoteUsers.length + 1; // +1 for local user

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.videoContainer}>
          {/* Channel info */}
          <View style={styles.channelInfo}>
            <Text style={styles.channelName}>Channel: {channelId}</Text>
            <Text style={styles.userCount}>{totalUsers} user{totalUsers !== 1 ? 's' : ''} in call</Text>
          </View>

          {/* Remote videos */}
          {remoteUsers.length > 0 && this.renderRemoteVideos()}
          
          {/* Local video */}
          <View style={styles.localVideoContainer}>
            {this.renderLocalVideo()}
          </View>

          {/* Connection status */}
          {!joinChannelSuccess && (
            <View style={styles.connectingContainer}>
              <Text style={styles.connectingText}>Connecting...</Text>
            </View>
          )}

          {/* Controls */}
          {this.renderControls()}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 2,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  remoteVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  disabledVideoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledVideoText: {
    color: '#666',
    marginTop: 8,
    fontSize: 12,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButtonActive: {
    backgroundColor: '#ff4444',
  },
  endCallButton: {
    backgroundColor: '#ff4444',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  connectingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  connectingText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  channelInfo: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
  channelName: {
    color: '#fff',
    fontSize: 16,
  },
  userCount: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
  },
}); 