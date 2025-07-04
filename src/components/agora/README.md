# Video Call Component

This directory contains a complete video call implementation using Agora SDK for React Native.

## Files

- `VideoCall.tsx` - Main video call component
- `UserCard.tsx` - Original component (has linter errors, use VideoCall.tsx instead)
- `README.md` - This file

## Setup Instructions

### 1. Get Agora App ID

1. Sign up at [Agora Console](https://console.agora.io/)
2. Create a new project
3. Copy the App ID from your project dashboard

### 2. Configure App ID

Edit `src/config/agora.config.ts` and replace `YOUR_AGORA_APP_ID` with your actual App ID:

```typescript
export default {
  appId: 'your-actual-app-id-here',
  channelId: 'test-channel',
  token: '',
  uid: 0,
  logFilePath: '',
};
```

### 3. Update VideoCall Component

In `src/components/agora/VideoCall.tsx`, update the appId in the constructor:

```typescript
this.state = {
  appId: 'your-actual-app-id-here', // Replace with your Agora App ID
  // ... other state properties
};
```

## Usage

### Basic Usage

```typescript
import VideoCall from '../components/agora/VideoCall';

// In your component
<VideoCall
  channelId="my-channel-123"
  token="" // Optional for testing
  uid={0} // Optional, 0 for auto-assign
  onEndCall={() => {
    // Handle call end
    navigation.goBack();
  }}
/>
```

### Using VideoCallScreen

```typescript
import VideoCallScreen from '../components/screens/VideoCallScreen';

// Navigate to the video call screen
navigation.navigate('VideoCallScreen', {
  channelId: 'my-channel-123',
  token: '', // Optional
  uid: 0, // Optional
});
```

### Using the Hook

```typescript
import { useVideoCall } from '../hooks/useVideoCall';

const MyComponent = () => {
  const { videoCallState, startCall, endCall } = useVideoCall();

  const handleStartCall = () => {
    startCall('my-channel-123');
  };

  if (videoCallState.isInCall) {
    return (
      <VideoCall
        channelId={videoCallState.channelId}
        token={videoCallState.token}
        uid={videoCallState.uid}
        onEndCall={endCall}
      />
    );
  }

  return (
    <TouchableOpacity onPress={handleStartCall}>
      <Text>Start Video Call</Text>
    </TouchableOpacity>
  );
};
```

## Features

- ✅ Real-time video and audio communication
- ✅ Camera switching (front/back)
- ✅ Mute/unmute audio
- ✅ Enable/disable video
- ✅ End call functionality
- ✅ Permission handling
- ✅ Error handling
- ✅ Connection status display
- ✅ Multiple remote users support
- ✅ Statistics monitoring

## Controls

The video call interface includes the following controls:

- **Microphone Button**: Toggle audio mute/unmute
- **End Call Button**: End the current call
- **Camera Button**: Toggle video on/off
- **Switch Camera Button**: Switch between front and back cameras

## Permissions

The component automatically requests the following permissions:

- **Android**: `RECORD_AUDIO` and `CAMERA`
- **iOS**: Camera and microphone permissions are handled by the system

## Testing

### Local Testing

1. Run the app on two devices/simulators
2. Use the same channel ID on both devices
3. Both devices should see each other's video

### Production Considerations

1. **Token Generation**: For production, implement token generation on your server
2. **Channel Management**: Implement proper channel creation and management
3. **User Authentication**: Add user authentication before allowing calls
4. **Call Logging**: Implement call logging and analytics
5. **Error Handling**: Add comprehensive error handling for network issues

## Troubleshooting

### Common Issues

1. **"Please configure your Agora App ID"**
   - Make sure you've updated the App ID in both `agora.config.ts` and `VideoCall.tsx`

2. **Permission denied**
   - Ensure camera and microphone permissions are granted
   - On Android, check if permissions are properly requested

3. **No video/audio**
   - Check if the device has camera and microphone
   - Verify permissions are granted
   - Check network connectivity

4. **Can't see remote user**
   - Ensure both users are using the same channel ID
   - Check if both users have joined the channel successfully
   - Verify network connectivity

### Debug Information

The component logs various events to the console:
- Channel join/leave events
- User join/leave events
- Error messages
- Statistics updates

## Dependencies

Make sure you have the following dependencies installed:

```json
{
  "react-native-agora": "^4.5.3",
  "react-native-vector-icons": "^10.2.0"
}
```

## License

This component is part of your project and follows your project's license terms. 