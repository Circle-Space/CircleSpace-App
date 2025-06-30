import React, {useState} from 'react';
import {Image, Pressable, Text, TouchableOpacity, View} from 'react-native';
import dayjs from 'dayjs';
import {MessageTypes} from './MessageCard';
import CustomIcons from '../../../../constants/CustomIcons';
import MessageTime from './MessageTime';
import {useDispatch} from 'react-redux';
import {setMessageOptionEnable} from '../../../../redux/reducers/chatSlice';
import {PrivateMessage} from './PrivateChat';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import {isEmpty} from 'lodash';
import ImageBlurLoading from 'react-native-image-blur-loading';
import {useNavigation} from '@react-navigation/native';
import routes from '../../../../constants/routes';
interface PhotoMessageProps {
  message: PrivateMessage;
}
const PhotoMessage: React.FC<PhotoMessageProps> = ({message}) => {
  const userId = useCurrentUserId();
  const dispatch = useDispatch();
  const parsedObject = message
    ? isEmpty(message?.body)
      ? null
      : JSON.parse(message.body)
    : null;
  const imageArray: any = parsedObject ? Object.values(parsedObject) : [];
  console.log('imageArray', imageArray);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  return (
    <React.Fragment>
      <TouchableOpacity
        onLongPress={() => {
          dispatch(setMessageOptionEnable(message));
        }}
        onPress={() => {
          //@ts-ignore
          navigation.navigate(routes.ImageViewer, {
            data: imageArray,
          });
        }}
        style={{
          width: '55%',
          height: 250,
          borderRadius: 14,
          padding: 10,
          alignSelf: userId === message?.message_by ? 'flex-end' : 'flex-start',
          backgroundColor: loading
            ? 'transparent'
            : userId === message?.message_by
            ? 'black'
            : 'white',
          borderBottomRightRadius: userId === message?.message_by ? 0 : 14,
          borderBottomLeftRadius: userId === message?.message_by ? 14 : 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ImageBlurLoading
          onLoad={() => {
            setLoading(false);
          }}
          thumbnailSource={{uri: imageArray?.[0]}}
          withIndicator={true}
          source={{uri: imageArray?.[0]}}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 14,
            alignSelf: 'center',
          }}
          fastImage={true}

          // fastImage
        />
        {/* <Image
          style={{
            width: '100%',
            height: 230,
            borderRadius: 14,
          }}
          source={{
            uri: imageArray?.[0],
          }}
        /> */}
      </TouchableOpacity>
      <MessageTime
        userId={userId}
        time={message?.created_at as any}
        messageuserid={message?.user_id}
      />
    </React.Fragment>
  );
};
export default PhotoMessage;
