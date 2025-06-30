import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Image, Pressable, Text, View} from 'react-native';
import dayjs from 'dayjs';
import {MessageTypes} from './MessageCard';
import CustomIcons from '../../../../constants/CustomIcons';
import MessageTime from './MessageTime';
import {useDispatch} from 'react-redux';
import {setMessageOptionEnable} from '../../../../redux/reducers/chatSlice';
import {PrivateMessage} from './PrivateChat';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import {isEmpty} from 'lodash';
import {truncateText} from '../../jobs/utils/utils';
import {useNavigation} from '@react-navigation/native';
import {get} from '../../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontFamilies } from '../../../../styles/constants';
interface PostMessageProps {
  message: PrivateMessage | any;
}
const PostMessage: React.FC<PostMessageProps> = ({message}) => {
  const userId = useCurrentUserId();
  const dispatch = useDispatch();
 
  const parsedObject = message
    ? isEmpty(message?.payload)
      ? null
      : JSON.parse(message?.payload)
    : null;
  const navigation = useNavigation();
  const [accountType, setAccountType] = useState('');
  const [token, setToken] = useState('');
  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const accountType_ = await AsyncStorage.getItem('accountType');
      if (savedToken) {
        setToken(savedToken);
        setAccountType(accountType_!);
      } else {
        setToken('No token found');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setToken('Error fetching token');
    }
  }, []);
  useEffect(() => {
    fetchToken();
  }, []);
  console.log('parsedObjectpost', parsedObject?.postBy?.feed_id);
  const handleCardPress = (item: any) => {
    if (['ugc', 'video','photo'].includes(item?.contentType)) {
      navigation.push('PostDetail', {
        feed: item,
        accountType: accountType,
        loggedInUserId: userId,
        token: token,
        pageName: 'home',
      });
    } else {
      navigation.navigate('ProjectDetail', {
        feed: item,
        accountType: accountType,
        loggedInUserId: userId,
        token: token,
        pageName: 'home',
      });
    }
  };

  ///ugc/get-specific-ugc/66968a982fca42fa0812e8c3
  const handleGetPost = async () => {
    await get(
      `ugc/get-specific-ugc/${parsedObject?.postBy?.feed_id}`,
      undefined,
      token,
    ).then(res => {
      if (res?.ugcs?.length > 0) {
        console.log(res?.ugcs?.[0]);
        handleCardPress(res?.ugcs?.[0]);
      } else {
        Alert.alert('unable to find post');
      }
      console.log('post details', res);
    });
  };

  return (
    <React.Fragment>
      <Pressable
        onPress={() => {
          handleGetPost();
        }}
        onLongPress={() => {
          dispatch(setMessageOptionEnable(message));
        }}
        style={{
          width: '55%',
          alignSelf: userId === message?.user_id ? 'flex-end' : 'flex-start',
          backgroundColor: userId === message?.user_id ? 'black' : 'white',
          borderBottomRightRadius: userId === message?.user_id ? 0 : 14,
          borderBottomLeftRadius: userId === message?.user_id ? 14 : 0,
          borderRadius: 18,
          padding: 10,
          gap: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}>
          <Image
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
            }}
            source={{
              uri: parsedObject?.postBy?.profile,
            }}
          />
          <Text
            style={{
              fontFamily: FontFamilies.semibold,
              fontWeight: '800',
              fontSize: 13,
              color: '#4A4A4A',
            }}>
            {parsedObject?.postBy?.username}
          </Text>
        </View>
        <Image
          style={{
            width: '100%',
            height: 230,
            borderRadius: 10,
          }}
          source={{
            uri: parsedObject?.postBy?.thumbnail,
          }}
        />
        <Text
          style={{
            fontFamily: FontFamilies.medium,
            fontWeight: '400',
            fontSize: 13,
            color: '#4A4A4A',
            width: '100%',
            lineHeight: 17,
          }}>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: FontFamilies.semibold,
              fontWeight: '800',
              fontSize: 13,
              color: '#4A4A4A',
            }}>
            {parsedObject?.postBy?.name}
          </Text>{' '}
          {truncateText(parsedObject?.postBy?.content, 20)}
        </Text>
      </Pressable>

      <MessageTime
        userId={userId}
        time={message?.created_at as any}
        messageuserid={message?.user_id}
      />
    </React.Fragment>
  );
};
export default PostMessage;
