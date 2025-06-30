import React, {useState} from 'react';
import {Dimensions, Image, Text, TouchableOpacity, View} from 'react-native';
import CustomIcons from '../../../constants/CustomIcons';
import ChatOptionModal from './ChatOptionModal';
import {useNavigation} from '@react-navigation/native';
import routes from '../../../constants/routes';
import dayjs from 'dayjs';
import {useSelector} from 'react-redux';
import {ApplicationState} from '../../../redux/store';
import {Room} from './Chats';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import chatRequest from '../../../services/chatRequest';
import apiEndPoints from '../../../constants/apiEndPoints';
import BlockModal from './private-chat/BlockModal';
import ClearChatModal from './private-chat/ClearChatModal';
import ReportModal from './private-chat/ReportModal';
import {isEmpty} from 'lodash';
import { Color, FontFamilies } from '../../../styles/constants';
import Svg, { Path } from 'react-native-svg';
import { getInitials } from '../../../utils/commonFunctions';
import DeleteRoomModal from './private-chat/DeleteRoomModal';

interface ChatCardProps {
  room: Room;
  isLast: boolean;
  navigation: any;
}

const ChatCard: React.FC<ChatCardProps> = ({room, isLast}) => {
  const navigation = useNavigation();
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showReportModal, SetShowReportModal] = useState(false);
  const [showBlockModal, SetShowBlockModal] = useState(false);
  const [showDeleteModal, SetShowDeleteModal] = useState(false);
  const userId = useCurrentUserId();
  const [showClearChatModal, SetShowClearChatModal] = useState(false);
  const blocked = userId === room?.blocked_by && room?.status_id === 'blocked';
  const [profilePic, setProfilePic] = useState(room.user_avatar);
  const isOnline = room?.is_user_online === 'true';
  const messageCount = room?.user_unread_message_count;
  const handleReadAll = () => {
    const payload = new FormData();
    // payload.append('requested_by', isSeller ? 'seller' : 'user');
    payload.append('room_id', room?.room_id);
    chatRequest(apiEndPoints.readAll, 'POST', payload, 'multipart/form-data')
      .then((res: any) => {
        console.log('read all', res);
      })
      .catch(e => {})
      .finally(() => {});
  };

  // Input date (example timestamp)
  const givenDate = dayjs(room?.updated_at);

  // Current time
  const now = dayjs();

  // Calculate the difference in various units
  const diffInMinutes = now.diff(givenDate, 'minute');
  const diffInHours = now.diff(givenDate, 'hour');
  const diffInDays = now.diff(givenDate, 'day');
  const diffInMonths = now.diff(givenDate, 'month');

  // Determine the most appropriate unit
  let diffString = '';

  if (diffInMinutes < 60) {
    diffString = ` ${
      diffInMinutes === 0
        ? dayjs(room?.updated_at).format('hh:mm A')
        : `${diffInMinutes} min ago`
    } `;
  } else if (diffInHours < 24) {
    diffString = `${diffInHours} hour ago`;
  } else if (diffInDays < 30) {
    diffString = `${diffInDays} day ago`;
  } else {
    diffString = `${diffInMonths} month ago`;
  }
  
  // const isPost = parsedObject?.postBy?.type==="post"
  console.log("blocked",room)
  const initials =getInitials(room?.name)
  return (
    <React.Fragment>
      <TouchableOpacity
        onPress={() => {
          handleReadAll();
          // @ts-ignore
          navigation.navigate(routes.privateChat, {
            roomData: room,
          });
        }}
        onLongPress={() => {
          setShowChatOptions(true);
        }}
        style={{
          alignItems: 'center',
          padding: 10,
          paddingLeft: 20,
          paddingRight: 25,
          paddingTop: 0,
          flexDirection: 'row',
          marginTop: 10,
          width: Dimensions.get('window').width / 1.01,
        }}>
        <View
          style={{
            position: 'relative',
            width: '20%',
          }}>
          {isEmpty(profilePic) ? (
            <Image
              style={{
                width: 52,
                height: 52,
                borderRadius: 30,
                borderColor: 'gray',
                borderWidth: 0.2,
              }}
              onError={()=>{
                setProfilePic(null)
              }}
              source={{
                width: 52,
                height: 52,
                uri: profilePic,
              }}
            />
          ) : (
            <View
            style={{
              backgroundColor: Color.black,
              width: 36,
              height: 36,
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
          {isOnline ? (
            <View
              style={{
                backgroundColor: '#0FE16D',
                width: 8,
                height: 8,
                borderRadius: 16,
                bottom: 10,
                left: 38,
              }}></View>
          ) : null}
        </View>
        <View
          style={{
            gap: 10,
            width: '52%',
          }}>
          <Text
            style={{
              color: '#1E1E1E',
              fontFamily: FontFamilies.medium,
              fontWeight: '400',
              fontSize: 16,
            }}>
            {room?.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: '#81919E',
              fontFamily: FontFamilies.medium,
              fontWeight: '400',
              fontSize: 12,
              maxHeight: 100,
            }}>
            {room?.last_message_sent?.includes(
              'https://cs-production-storage.s3.amazonaws.com',
            )
              ? 'Sent a media'
              : room?.last_message_sent}
          </Text>
        </View>
        <View
          style={{
            gap: 10,
            width: '30%',
          }}>
          <Text
            style={{
              color: '#828282',
              fontFamily: FontFamilies.medium,
              fontWeight: '400',
              fontSize: 12,
              textAlign: 'right',
            }}>
            {diffString}
          </Text>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 8,
              justifyContent: 'flex-end',
            }}>
            {/* <CustomIcons type="CHATPIN" width={15} height={15} /> */}
            {messageCount === 0 ? (
              <>
                {!isEmpty(room?.last_message_sent) ? (
                  <CustomIcons type="DOUBLETICK" width={15} height={15} />
                ) : null}
              </>
            ) : (
              <View
                style={{
                  padding: 6,
                  borderRadius: 20,
                  paddingLeft: 8.5,
                  paddingRight: 8.5,
                  paddingTop: 7,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#1E1E1E',
                }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontFamily: FontFamilies.medium,
                    fontWeight: '400',
                    fontSize: 10,
                  }}>
                  {room?.user_unread_message_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <View
        style={{
          backgroundColor: '#F4F4F4',
          width: '90%',
          height: isLast ? 0 : 1,
          alignSelf: 'center',
          marginTop: 5,
          marginBottom: 5,
        }}></View>

      {showChatOptions ? (
        <ChatOptionModal
          setVisible={setShowChatOptions}
          visible={showChatOptions}
          blocked={blocked}
          callBack={(
            type: 'report' | 'block' | 'clear chat' | 'mute' | 'unblock'|'delete',
          ) => {
            console.log('type', type);
            if (type === 'report') {
              setTimeout(() => {
                SetShowReportModal(true);
              }, 500);
            } else if (type === 'block' || type === 'unblock') {
              setTimeout(() => {
                SetShowBlockModal(true);
              }, 500);
            } else if (type === 'clear chat') {
              setTimeout(() => {
                SetShowClearChatModal(true);
              }, 500);
            }else if(type ==='delete'){
              setTimeout(() => {
                SetShowDeleteModal(true)
              }, 500);
            
            }
          }}
        />
      ) : null}
      {showReportModal ? (
        <ReportModal
          visible={showReportModal}
          setVisible={SetShowReportModal}
          roomData={room}
        />
      ) : null}
        {showDeleteModal ? (
        <DeleteRoomModal
          visible={showDeleteModal}
          setVisible={SetShowDeleteModal}
          roomData={room}
        />
      ) : null}
      {showBlockModal ? (
        <BlockModal
          visible={showBlockModal}
          setVisible={SetShowBlockModal}
          roomData={room}
        />
      ) : null}
      {showClearChatModal ? (
        <ClearChatModal
          visible={showClearChatModal}
          setVisible={SetShowClearChatModal}
          room={room}
        />
      ) : null}
    </React.Fragment>
  );
};
export default ChatCard;
