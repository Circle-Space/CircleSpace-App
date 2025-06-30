import React, {useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';
import ChatOptionModal from '../ChatOptionModal';
import ReportModal from './ReportModal';
import BlockModal from './BlockModal';
import ClearChatModal from './ClearChatModal';
import {roomData} from './PrivateChat';
import {Room} from '../Chats';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import {useDispatch} from 'react-redux';
import {setUpdate} from '../../../../redux/reducers/chatSlice';
import chatRequest from '../../../../services/chatRequest';
import apiEndPoints from '../../../../constants/apiEndPoints';
import {Color, FontFamilies} from '../../../../styles/constants';
import {isEmpty, isString} from 'lodash';
import Svg, {Path} from 'react-native-svg';
import {getInitials} from '../../Home/utils/utils';
interface PrivateChatHeaderProps {
  roomData: Room;
  isSeller: boolean;
}
const PrivateChatHeader: React.FC<PrivateChatHeaderProps> = ({
  roomData,
  isSeller,
}) => {
  const navigation = useNavigation();
  const userId = useCurrentUserId();
  const [showChatOptions, SetShowOptions] = useState(false);
  const [showReportModal, SetShowReportModal] = useState(false);
  const [showBlockModal, SetShowBlockModal] = useState(false);
  const [showClearChatModal, SetShowClearChatModal] = useState(false);
  const blocked =
    userId === roomData?.blocked_by && roomData?.status_id === 'blocked';
  const dispatch = useDispatch();
  const isOnline = roomData?.is_user_online === 'true';
  const [profilePic, setProfilePic] = useState(roomData?.user_avatar);
  console.log('profilePic', profilePic);
  const initials = getInitials(roomData?.name);
  return (
    <React.Fragment>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          width: Dimensions.get('window').width,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F5F5F5',
        }}>
        <TouchableOpacity
          onPress={() => {
            dispatch(setUpdate(Date.now()));
            navigation.goBack();
          }}
          style={{
            padding: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="chevron-left" size={24} color={'#1E1E1E'} />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            alignItems: 'center',
            marginLeft: 12,
          }}>
          <View
            style={{
              position: 'relative',
              marginRight: 12,
            }}>
            {!isString(profilePic) ? (
              <Image
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                }}
                onError={() => {
                  console.log('img eror');
                }}
                source={{
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
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                }}
              />
            ) : null}
          </View>
          <View style={{flex: 1, gap: 2}}>
            <Text
              numberOfLines={1}
              style={{
                color: '#1E1E1E',
                fontFamily: FontFamilies.semibold,
                fontSize: 16,
                lineHeight: 20,
              }}>
             {roomData?.name}
            </Text>
            {blocked ? (
              <Text
                numberOfLines={1}
                style={{
                  color: '#ED4956',
                  fontFamily: FontFamilies.medium,
                  fontSize: 12,
                  lineHeight: 16,
                }}>
                {userId === roomData?.blocked_by
                  ? 'Blocked'
                  : 'You are blocked'}
              </Text>
            ) : isOnline ? (
              <Text
                numberOfLines={1}
                style={{
                  color: '#0FE16D',
                  fontFamily: FontFamilies.medium,
                  fontSize: 12,
                  lineHeight: 16,
                }}>
                Online
              </Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            SetShowOptions(true);
          }}
          style={{
            padding: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Entypo name="dots-three-vertical" size={20} color={'#1E1E1E'} />
        </TouchableOpacity>
      </View>
      {showChatOptions ? (
        <ChatOptionModal
          fromPrivateChat={true}
          visible={showChatOptions}
          setVisible={SetShowOptions}
          callBack={(
            type: 'report' | 'block' | 'clear chat' | 'mute' | 'unblock',
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
            }
          }}
          blocked={blocked}
        />
      ) : null}

      {showReportModal ? (
        <ReportModal
          visible={showReportModal}
          setVisible={SetShowReportModal}
          roomData={roomData}
        />
      ) : null}
      {showBlockModal ? (
        <BlockModal
          visible={showBlockModal}
          setVisible={SetShowBlockModal}
          roomData={roomData}
        />
      ) : null}
      {showClearChatModal ? (
        <ClearChatModal
          visible={showClearChatModal}
          setVisible={SetShowClearChatModal}
          room={roomData}
        />
      ) : null}
    </React.Fragment>
  );
};
export default PrivateChatHeader;
