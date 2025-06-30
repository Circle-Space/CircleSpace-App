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
import CustomVideoPlayer from '../chat/private-chat/CustomVideoPlayer';

interface VideoPlayerProps {
  route: any;
}
const VideoPlayer: React.FC<VideoPlayerProps> = ({route}) => {
  const source = route?.params?.source;
  const [paused, setPaused] = useState(false);
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
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: 'black',
      }}>
     <CustomVideoPlayer source={source} fullScreen={true} />
    </View>
  );
};
export default VideoPlayer;
