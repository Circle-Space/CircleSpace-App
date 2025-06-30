import React, {useRef, useState} from 'react';
import {Image, Platform, Text, TouchableOpacity, View} from 'react-native';
import dayjs from 'dayjs';
import {MessageTypes} from './MessageCard';
import CustomIcons from '../../../../constants/CustomIcons';
import MessageTime from './MessageTime';
import {Pressable} from 'react-native';
import {useDispatch} from 'react-redux';
import {setMessageOptionEnable} from '../../../../redux/reducers/chatSlice';
import {PrivateMessage} from './PrivateChat';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import Video, {VideoRef} from 'react-native-video';
import {isEmpty} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import CustomVideoPlayer from './CustomVideoPlayer';
import routes from '../../../../constants/routes';
interface VideoMessageProps {
  message: PrivateMessage;
}
const VideoMessage: React.FC<VideoMessageProps> = ({message}) => {
  const userId = useCurrentUserId();
  const dispatch = useDispatch();
  const parsedObject = message
    ? isEmpty(message?.body)
      ? null
      : JSON.parse(message.body)
    : null;
  const video: any = parsedObject ? Object.values(parsedObject) : [];

  const navigation = useNavigation();
  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(true);
  return (
    <React.Fragment>
      <Pressable
        onPress={() => {
          //@ts-ignore
          navigation.navigate(routes.VideoPlayer, {
            source: {uri: video?.[0]},
          });
        }}
        onLongPress={() => {
          dispatch(setMessageOptionEnable(message));
        }}
        style={{
          width: '55%',
          height: 250,
          borderRadius: 14,
          alignSelf: userId === message?.message_by ? 'flex-end' : 'flex-start',
          backgroundColor: userId === message?.message_by ? 'black' : 'white',
          borderBottomRightRadius: userId === message?.message_by ? 0 : 14,
          borderBottomLeftRadius: userId === message?.message_by ? 14 : 0,
          padding: 10,
          position: 'relative',
        }}>
        <CustomVideoPlayer source={{uri: video?.[0]}} />
      </Pressable>
      <MessageTime
        userId={userId}
        time={message?.created_at as any}
        messageuserid={message?.message_by}
      />
    </React.Fragment>
  );
};
export default VideoMessage;
