import React, {useState, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Feather';
import Icon2 from 'react-native-vector-icons/AntDesign';
import Slider from '@react-native-community/slider';
import {useNavigation} from '@react-navigation/native';
// import Orientation from 'react-native-orientation-locker';
interface CustomVideoPlayerProps {
  source: any;
  fullScreen: boolean;
}
const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  source,
  fullScreen = false,
}) => {
  const [paused, setPaused] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoPlayer = useRef(null);
  const [buffering, setBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigation = useNavigation();
  const onProgress = data => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
    }
  };
  const handleBuffer = meta => {
    // Only show buffering when video is playing
    if (isPlaying) {
      setBuffering(meta.isBuffering);
    }
  };

  const handlePlay = e => {
    setIsPlaying(e.isPlaying);
    setBuffering(false); // Assume buffering ends once video starts playing
  };

  const onLoad = data => {
    setLoading(false);
    setDuration(data.duration);
  };

  const onSeek = value => {
    setIsSeeking(false);
    videoPlayer.current.seek(value);
    setCurrentTime(value);
  };

  const onSlidingStart = () => {
    setIsSeeking(true);
  };
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  const togglePlayPause = () => {
    setPaused(!paused);
  };

  return (
    <View
      style={{
        width: fullScreen ? '100%' : 'auto',
        height: fullScreen ? '100%' : 'auto',
      }}>
      <Video
        ref={videoPlayer}
        source={source} // Replace with your video URI
        style={{
          width: '100%',
          height: '100%',
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
        paused={paused}
        resizeMode={fullScreen ? 'contain' : 'cover'}
        fullscreen={isFullScreen}
        fullscreenOrientation="landscape"
        fullscreenAutorotate={true}
        controls={false}
        onLoad={onLoad}
        onProgress={e => {
          setCurrentTime(e?.currentTime);
        }}
        onBuffer={handleBuffer}
        onPlaybackStateChanged={handlePlay}
      />
      <View
        style={{
          position: 'absolute',
          zIndex: 111,
          alignSelf: 'center',
        }}>
        {loading ? (
          <ActivityIndicator
            style={{
              // position: 'absolute',
              top: fullScreen ? 450 : 100,
              // left: 170,
            }}
            color={'white'}
            size={'large'}
          />
        ) : (
          <>
          {fullScreen?  <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={{
                position: 'absolute',
                top: fullScreen ? 90 : 90,
                left: Dimensions.get('window').width / 2.5,
                zIndex: 111,
              }}>
              <Icon2 name={'closecircle'} size={30} color={'white'} />
            </TouchableOpacity>:null}
            <TouchableOpacity
              onPress={togglePlayPause}
              style={{
                // position: 'absolute',
                top: fullScreen ? Dimensions.get('window').height / 2.1 : 90,
                // left: 170,
              }}>
              <Icon
                name={paused ? 'play-circle' : 'pause-circle'}
                size={50}
                color={'white'}
              />
            </TouchableOpacity>
          </>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '90%',
          position: 'absolute',
          zIndex: 111,
          top: fullScreen ? Dimensions.get('window').height - 150 : 190,
          alignSelf: 'center',
        }}>
        <Text
          style={{
            color: '#fff',
          }}>
          {formatTime(currentTime)}
        </Text>
        <Slider
          style={{
            flex: 1,
            marginHorizontal: 10,
          }}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          onSlidingStart={onSlidingStart}
          onSlidingComplete={onSeek}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
        <Text
          style={{
            color: '#fff',
          }}>
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
};

export default CustomVideoPlayer;
