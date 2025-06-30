import React from 'react';
import {Image, Pressable, Text, TouchableOpacity, View} from 'react-native';
import dayjs from 'dayjs';
import {MessageTypes} from './MessageCard';
import CustomIcons from '../../../../constants/CustomIcons';
import MessageTime from './MessageTime';
import {useDispatch} from 'react-redux';
import {setMessageOptionEnable} from '../../../../redux/reducers/chatSlice';
import {PrivateMessage} from './PrivateChat';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import {isEmpty, isString} from 'lodash';
import ImageBlurLoading from 'react-native-image-blur-loading';
import {useNavigation} from '@react-navigation/native';
import routes from '../../../../constants/routes';
import { FontFamilies } from '../../../../styles/constants';
interface MediaMessageProps {
  message: PrivateMessage;
}
const MediaMessage: React.FC<MediaMessageProps> = ({message}) => {
  const userId = useCurrentUserId();
  const parsedObject = message
    ? isEmpty(message?.body)
      ? null
      : JSON.parse(message.body)
    : null;
  const imageArray = parsedObject ? Object.values(parsedObject) : [];
  const list =
    imageArray?.length > 4
      ? imageArray?.slice(0, 4)
      : imageArray?.length === 3
      ? imageArray?.slice(0, 2)
      : imageArray;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  // console.log('list', list);
  // try {
  //   // Parsing the string into an object
  //   const parsedObject = JSON.parse(message.body);
  //   const imageArray = Object.values(parsedObject);
  //   console.log("Parsed Object:", imageArray);
  // } catch (error) {
  //   console.log("Error parsing JSON:", error);
  // }
  return (
    <React.Fragment>
      <Pressable
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
          width: 200,
          //   height: 200,
          borderRadius: 14,
          padding: 10,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 5,
          rowGap: 10,
          alignSelf: userId === message?.message_by ? 'flex-end' : 'flex-start',
          backgroundColor: userId === message?.message_by ? 'black' : 'white',
          borderBottomRightRadius: userId === message?.message_by ? 0 : 10,
          borderBottomLeftRadius: userId === message?.message_by ? 14 : 0,
        }}>
        {list?.map((media: any, key) => {
          // console.log('media',media)
          let loading = true;
          return (
            <View
              key={key}
              style={{
                width: 87,
                height: 88,
                position: 'relative',
              }}>
              <ImageBlurLoading
                onLoad={() => {
                  loading = false;
                }}
                thumbnailSource={{uri: media}}
                withIndicator={true}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 10,
                }}
                source={{
                  uri: media,
                }}
                fastImage={true}
              />
              {imageArray?.length >list?.length &&
              key === (imageArray.length === 3 ? 1 : 3) ? (
                <TouchableOpacity
                  onPress={() => {
                    //@ts-ignore
                    navigation.navigate(routes.ImageViewer, {
                      data: imageArray,
                    });
                  }}
                  style={{
                    backgroundColor: '#00000080',
                    position: 'absolute',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 100,
                    height: 88,
                    borderRadius: 15,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 24,
                      fontWeight: '400',
                      fontFamily: FontFamilies.semibold,
                    }}>
                    +{imageArray?.length - list?.length+1}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}
      </Pressable>
      <MessageTime
        userId={userId}
        time={message?.created_at as any}
        messageuserid={message?.message_by}
      />
    </React.Fragment>
  );
};
export default MediaMessage;
