import React, {useState} from 'react';
import {
  Alert,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import {MessageTypes} from './MessageCard';
import CustomIcons from '../../../../constants/CustomIcons';
import MessageTime from './MessageTime';
import {useDispatch} from 'react-redux';
import {
  setDeleteMessageId,
  setMessageOptionEnable,
  setUpdate,
} from '../../../../redux/reducers/chatSlice';
import {PrivateMessage, roomData} from './PrivateChat';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import chatRequest from '../../../../services/chatRequest';
import apiEndPoints from '../../../../constants/apiEndPoints';
import {useNavigation} from '@react-navigation/native';
import routes from '../../../../constants/routes';
import {Color, FontFamilies} from '../../../../styles/constants';
import {getInitials} from '../../../../utils/commonFunctions';
import {isEmpty, isString} from 'lodash';
interface ProfileMessageProps {
  message: PrivateMessage;
  roomData: roomData;
}
const ProfileMessage: React.FC<ProfileMessageProps> = ({message, roomData}) => {
  const userId = useCurrentUserId();
  const dispatch = useDispatch();
  const isSeller = message?.user_id === userId;
  const navigation = useNavigation();
  const [profilePic, setProfilePic] = useState(
    isSeller ? message?.seller_avatar : message?.user_avatar,
  );
  const handleUpdateRoom = () => {
    const payload = new FormData();
    payload.append('room_id', message?.room_id);
    payload.append('status_id', 'active');
    payload.append('receiver_id', roomData?.receiver_id);
    console.log('staus id',payload)
    chatRequest(
      apiEndPoints.updateRoom,
      'POST',
      payload,
      'multipart/form-data',
    ).then((res: any) => {
      if (res?.status_code === 200) {
        handleDeleteMessage(true);
      } else {
        Alert.alert(res?.message);
      }
    });
  };
  const handleBlock = (fromAllow = false) => {
    const payload = new FormData();
    payload.append('room_id', message?.room_id);
    payload.append('user_id', message?.user_id);
    payload.append('message_by', message?.message_by);
    console.log('block payload', payload);
    chatRequest(
      fromAllow ? apiEndPoints.unblockUser : apiEndPoints.blockUser,
      'POST',
      payload,
      'multipart/form-data',
    )
      .then((res: any) => {
        if (!res?.error) {
          if (fromAllow) {
            console.log('room data frommallow', res);

            handleUpdateRoom();
          } else {
            handleDeleteMessage()
            Alert.alert(res?.message);
            dispatch(setUpdate(Date.now()));
            navigation.goBack();
          }
        }
      })
      .catch(e => {});
  };
  const initials = getInitials(message?.user_username);
  const handleDeleteMessage = (fromAllow = false) => {
    const payload = new FormData();
    payload.append('message_id', message?.id);
    payload.append('created_at', dayjs().format());
    payload.append('room_id', roomData?.room_id);
    payload.append('receiver_id', roomData?.receiver_id);
    chatRequest(
      apiEndPoints.deleteMessage,
      'POST',
      payload,
      'multipart/form-data',
    )
      .then((res: any) => {
        if (!res?.error) {
          dispatch(setDeleteMessageId(message?.id));
          dispatch(setMessageOptionEnable(undefined));
        }
      })
      .catch(e => {});
  };

  console.log('parsedObject', message);
  if (userId === message?.message_by) return null;
  return (
    <React.Fragment>
      <View
        style={{
          borderRadius: 24,
          padding: 12,
          paddingTop: 20,
          paddingBottom: 20,
          width: '100%',
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 30,
          backgroundColor: 'white',
          marginTop: 8,
          marginBottom: 10,
        }}>
        <View
          style={{
            gap: 13,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
          }}>
          {!isEmpty(profilePic) ? (
            <Image
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
              }}
              source={{
                uri: profilePic,
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: Color.black,
                width: 40,
                height: 40,
                borderRadius: 72,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontFamily: FontFamilies.regular,
                }}>
                {initials}
              </Text>
            </View>
          )}
          <Text
            style={{
              color: '#1E1E1E',
              fontSize: 16,
              fontWeight: '400',
              fontFamily: FontFamilies.semibold,
            }}>
            {message?.name ?? message?.user_username}
          </Text>
          <Text
            style={{
              color: '#81919E',
              fontSize: 12,
              fontWeight: '400',
              fontFamily: FontFamilies.medium,
            }}>
            @{message?.user_username}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}>
          <TouchableOpacity
            onPress={() => {
              handleBlock(false);
            }}
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 10,
              backgroundColor: '#FFF4F4',
              borderWidth: 1.5,
              borderColor: '#FFE9E9',
              padding: 10,
              borderRadius: 14,
              paddingLeft: 22,
              paddingRight: 22,
              width: '40%',
              justifyContent: 'center',
            }}>
            <CustomIcons type="INFO" />
            <Text
              style={{
                color: '#EA5858',
                fontWeight: '400',
                fontSize: 14,
                fontFamily: FontFamilies.semibold,
              }}>
              Block
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleBlock(true);
            }}
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 10,
              backgroundColor: '#EFF8FF',
              borderWidth: 1.5,
              borderColor: '#E3F3FF',
              padding: 10,
              borderRadius: 14,
              paddingLeft: 22,
              paddingRight: 22,
              width: '40%',
              justifyContent: 'center',
            }}>
            <CustomIcons type="TICK" />
            <Text
              style={{
                color: '#588BEA',
                fontWeight: '400',
                fontSize: 14,
                fontFamily: FontFamilies.semibold,
              }}>
              Allow
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </React.Fragment>
  );
};
export default ProfileMessage;
