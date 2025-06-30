import React, {useState} from 'react';
import {Pressable, Text, TouchableOpacity, View} from 'react-native';
import dayjs from 'dayjs';
import {MessageTypes} from './MessageCard';
import CustomIcons from '../../../../constants/CustomIcons';
import MessageTime from './MessageTime';
import {useDispatch, useSelector} from 'react-redux';
import {setMessageOptionEnable} from '../../../../redux/reducers/chatSlice';
import {PrivateMessage} from './PrivateChat';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import {ApplicationState} from '../../../../redux/store';
import ImageBlurLoading from 'react-native-image-blur-loading';
import {post} from '../../../../services/dataRequest';
import {isEmpty} from 'lodash';
import { FontFamilies } from '../../../../styles/constants';
interface TextMessageProps {
  message: PrivateMessage|any;
}

const TextMessage: React.FC<TextMessageProps> = ({message}) => {
  const userId = useCurrentUserId();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const payload = !isEmpty(message?.payload)
    ? JSON.parse(message?.payload)
    : null;
  const parsedObject = message
    ? isEmpty(message?.payload)
      ? null
      : JSON.parse(message?.payload)
    : null;

  const isUserMessage = userId === message?.message_by;
  console.log('userId',userId)
  return (
    <React.Fragment>
      <Pressable
        onLongPress={() => {
          dispatch(setMessageOptionEnable(message));
        }}
        style={{
          padding: 10,
          borderRadius: 10,
          alignSelf: isUserMessage ? 'flex-end' : 'flex-start',
          backgroundColor: isUserMessage ? 'black' : '#F3F3F3',
          borderBottomRightRadius: isUserMessage ? 0 : 14,
          borderBottomLeftRadius: isUserMessage ? 14 : 0,
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '60%',
          position: 'relative',
        }}>
        <Text
          style={{
            fontFamily: FontFamilies.medium,
            fontWeight: '400',
            fontSize: 12,
            color: isUserMessage ? 'white' : 'black',
            lineHeight: 18,
          }}>
          {message?.body}
        </Text>
      </Pressable>
      {payload?.reaction ? (
        <View
          style={{
            alignItems: 'center',
            alignSelf: isUserMessage ? 'flex-end' : 'flex-start',
            backgroundColor: '#F3F3F3',
            padding: 5,
            borderRadius: 8,
            justifyContent: "center",
            top: -5,
            right: isUserMessage ? 2 : -2
          }}>
          <Text
            style={{
              color: 'black',
              fontSize: 10,
              fontWeight: '400',
              fontFamily: FontFamilies.medium,
            }}>
            {payload?.reaction}
          </Text>
        </View>
      ) : null}
      <MessageTime
        userId={userId}
        time={message?.created_at as any}
        messageuserid={message?.message_by}
        isRead={message?.is_read}
      />
    </React.Fragment>
  );
};

export default TextMessage;
