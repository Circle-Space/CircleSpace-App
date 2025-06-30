import React from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import CustomIcons from '../../../../constants/CustomIcons';
import FetherIcon from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import {setMessageOptionEnable} from '../../../../redux/reducers/chatSlice';
import {ApplicationState} from '../../../../redux/store';
import isEmpty from 'lodash/isEmpty';
import {PrivateMessage, roomData} from './PrivateChat';
import {useClipboard} from '@react-native-clipboard/clipboard';
import {Room} from '../Chats';
import {capitalize} from 'lodash';
import chatRequest from '../../../../services/chatRequest';
import apiEndPoints from '../../../../constants/apiEndPoints';
import dayjs from 'dayjs';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import { FontFamilies } from '../../../../styles/constants';
interface MessageActionCardProps {
  room: Room;
  callBack: any;
}
const MessageActionCard: React.FC<MessageActionCardProps> = ({
  room,
  callBack,
}) => {
  const emojis = ['🔥', '📸', ' 🙌', '😭', ' 🙈', ' 👋', '🙏', ' 😩 ', ' 😞'];
  const dispatch = useDispatch();
  const showMessageOptions: any = useSelector(
    (state: ApplicationState) => state?.chat?.messageOptionEnable,
  );
  const userId = useCurrentUserId();
  const [data, setString] = useClipboard();
  const handleDeleteMessage = () => {
    const payload = new FormData();
    payload.append('message_id', showMessageOptions?.id);
    payload.append('room_id',room?.room_id);
    payload.append('receiver_id',room?.receiver_id)
    payload.append('created_at', room.created_at);
    console.log('pyload', payload);
    chatRequest(
      apiEndPoints.deleteMessage,
      'POST',
      payload,
      'multipart/form-data',
    )
      .then((res: any) => {
        if (!res?.error) {
          Alert.alert(res?.message??'Message deleted');
          callBack(showMessageOptions?.id);
          dispatch(setMessageOptionEnable(undefined));
        }
      })
      .catch(e => {});
  };

  const handleMessafeReaction = (reaction: any) => {
    const payload = new FormData();
    payload.append('message_id', showMessageOptions?.id);
    payload.append('reaction', JSON.stringify({reaction:reaction}));
    chatRequest(
      `directline/update-message`,
      'POST',
      payload,
      'multipart/form-data',
    )
      .then((res: any) => {
        console.log('update reactyion', res);
        if (!res?.error) {
          dispatch(setMessageOptionEnable(undefined));
        }
      })
      .catch(e => {});
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={!isEmpty(showMessageOptions)}
        onRequestClose={() => {
          dispatch(setMessageOptionEnable(undefined));
        }}>
        <Pressable
          onPress={() => {
            dispatch(setMessageOptionEnable(undefined));
          }}
          style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <View
              style={{
                //   position: 'absolute',
                width: '90%',
                backgroundColor: 'white',

                borderRadius: 18,

                //   bottom: 80,
                alignSelf: 'center',
                //   left: 15,
                justifyContent: 'center',
                gap: 10,
                paddingBottom: 10,
              }}>
              <View
                style={{
                  height: 4,
                  width: 40,
                  backgroundColor: '#DADADA',
                  borderRadius: 14,
                  alignSelf: 'center',
                  marginTop: 10,
                }}></View>
              <View
                style={{
                  padding: 10,
                  width: '90%',
                  alignSelf: 'center',
                  borderRadius: 10,

                  backgroundColor: '#F7F7F7',

                  borderBottomLeftRadius: 14,
                  justifyContent: 'center',
                  // alignItems: 'center',
                  maxWidth: '100%',
                }}>
                <Text
                  style={{
                    fontFamily: FontFamilies.medium,
                    fontWeight: '400',
                    fontSize: 12,
                    color: '#1E1E1E',
                    lineHeight: 18,
                  }}>
                  {showMessageOptions?.entity_type === 'text'
                    ? showMessageOptions?.body
                    : capitalize(showMessageOptions?.entity_type)}
                </Text>
              </View>
              {/* <Text
                style={{
                  fontFamily: 'Gilroy-SemiBold',
                  fontWeight: '400',
                  fontSize: 16,
                  color: '#1E1E1E',
                  lineHeight: 18,
                  marginLeft: 10,
                }}>
                React
              </Text> */}
              {/* <ScrollView
                contentContainerStyle={{
                  padding: 10,
                  gap: 10,
                }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}>
                {emojis?.map(e => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        handleMessafeReaction(e?.toString());
                        //update message
                      }}
                      style={{}}
                      key={e}>
                      <Text
                        style={{
                          fontFamily: 'Gilroy-SemiBold',
                          fontWeight: '400',
                          color: '#1E1E1E',

                          fontSize: 24,
                        }}>
                        {e?.trim()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView> */}
              {showMessageOptions?.entity_type === 'text' ? (
                <TouchableOpacity
                  onPress={() => {
                    setString(showMessageOptions?.body);
                    dispatch(setMessageOptionEnable(undefined));
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#B9B9BB',
                    padding: 12,
                  }}>
                  <Text
                    style={{
                      fontFamily: FontFamilies.semibold,
                      fontWeight: '400',
                      color: '#1E1E1E',

                      fontSize: 12,
                    }}>
                    Copy
                  </Text>
                  <CustomIcons type="COPY" />
                </TouchableOpacity>
              ) : null}
              {/* <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#B9B9BB',
                  padding: 12,
                }}>
                <Text
                  style={{
                    fontFamily: FontFamilies.semibold,
                    fontWeight: '400',
                    color: '#1E1E1E',
                    fontSize: 12,
                  }}>
                  Reply
                </Text>
                <CustomIcons type="BACKWARD" />
              </TouchableOpacity> */}
              {/* <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#B9B9BB',
                  padding: 12,
                }}>
                <Text
                  style={{
                    fontFamily: 'Gilroy-SemiBold',
                    fontWeight: '400',
                    color: '#1E1E1E',
                    fontSize: 12,
                  }}>
                  Forward
                </Text>
                <CustomIcons type="FORWARD" />
              </TouchableOpacity> */}
              {userId === showMessageOptions?.user_id ? (
                <TouchableOpacity
                  onPress={handleDeleteMessage}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottomWidth: 0,
                    borderBottomColor: '#B9B9BB',
                    padding: 12,
                  }}>
                  <Text
                    style={{
                      fontFamily: FontFamilies.semibold,
                      fontWeight: '800',
                      color: '#EA5858',
                      fontSize: 12,
                    }}>
                    Delete
                  </Text>
                  <FetherIcon name="trash" size={16} color={'#EA5858'} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
export default MessageActionCard;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    width: Dimensions.get('window').width / 1.1,
    padding: 0,
    backgroundColor: 'white',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    gap: 10,
    marginBottom: 20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
