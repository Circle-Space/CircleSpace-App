import {BlurView} from '@react-native-community/blur';
import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import {CheckBox} from 'react-native-btr';
import {Room} from '../Chats';
import chatRequest from '../../../../services/chatRequest';
import apiEndPoints from '../../../../constants/apiEndPoints';
import {useDispatch} from 'react-redux';
import {setUpdate} from '../../../../redux/reducers/chatSlice';
import {useNavigation} from '@react-navigation/native';
import routes from '../../../../constants/routes';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import { FontFamilies } from '../../../../styles/constants';

interface BlockModalProps {
  visible: boolean;
  setVisible: any;
  roomData: Room;
}
const BlockModal: React.FC<BlockModalProps> = ({
  visible,
  setVisible,
  roomData,
}) => {
  const [cheked, setChecked] = useState(false);
  const userId = useCurrentUserId();
  const blocked =
    userId === roomData?.blocked_by && roomData?.status_id === 'blocked';
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const handleBlock = () => {
    const payload = new FormData();
    payload.append('room_id', roomData?.room_id);
    payload.append('user_id', roomData?.user_id);
    payload.append('message_by', roomData?.receiver_id);
    console.log('block payload', payload);

    chatRequest(
     blocked
        ? apiEndPoints.unblockUser
        : apiEndPoints.blockUser,
      'POST',
      payload,
      'multipart/form-data',
    )
      .then((res: any) => {
        if (!res?.error) {
          dispatch(setUpdate(Date.now()));
          setVisible(false);
          // Don't navigate to chats, stay in current chat but update the UI
          // Show success message instead of error
          console.log(blocked ? 'User unblocked successfully' : 'User blocked successfully');
          dispatch(setUpdate(Date.now()));
         navigation.navigate(routes.chats)
        } else {
          // Handle error silently or show a toast
          console.log('Error in blocking/unblocking:', res?.error_messages);
          setVisible(false);
        }
      })
      .catch(e => {
        console.log('Block error:', e);
        setVisible(false);
      });
  };
  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}>
        <Pressable
          onPress={() => {
            // setVisible(false);
          }}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00000099', // Semi-transparent background
          }}>
          <View
            style={{
              width: 250,

              backgroundColor: 'white',
              borderRadius: 22,
              shadowColor: '#000',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 15,
            }}>
            <Text
              style={{
                fontWeight: '400',
                fontSize: 16,
                fontFamily: FontFamilies.semibold,
                color: '#1E1E1E',
                padding: 20,
                paddingBottom: 0,
              }}>
              {blocked ? 'Unblock' : `Block`} Account
            </Text>
            <View
              style={{
                alignItems: 'center',
                gap: 0,
                flexDirection: 'row',
                width: '100%',
                padding: 10,
                paddingLeft: 20,
                paddingRight: 20,
              }}>
              <CheckBox
                checked={true}
                onPress={() => {
                  setChecked(!cheked);
                }}
                color={!cheked ? '#D1D1D1' : '#1E1E1E'}
                //@ts-ignore
                containerStyle={{
                  backgroundColor: '#D1D1D1',
                  margin: 0,
                  borderRadius: 100, // Rounded corners
                  borderColor: '#007AFF',
                  borderWidth: 2,
                  padding: 10, // Adjust padding to ensure checkbox fits well
                }}
                style={{
                  borderRadius: 100, // R
                }}
              />
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 12,
                  fontFamily: FontFamilies.medium,
                  color: '#4A4A4A',
                  //   textAlign: 'center',
                  lineHeight: 15,
                  padding: 20,
                  paddingBottom: 0,
                  paddingTop: 0,
                }}>
                Also {blocked ? 'unblock' : `block`} any other account that they
                may have or create in the future
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                handleBlock();
              }}
              style={{
                borderBottomColor: '#B9B9BB',
                borderTopColor: '#B9B9BB',
                borderBottomWidth: 0.5,
                borderTopWidth: 0.5,
                paddingBottom: 15,
                width: '100%',
                padding: 15,
              }}>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 13,
                  color: '#ED4956',
                  fontFamily: FontFamilies.semibold,
                  textAlign: 'center',
                }}>
                {blocked ? 'Unblock' : `Block`}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                setVisible(false);
              }}
              style={{
                paddingBottom: 15,
                paddingTop: 0,
                width: '100%',
                padding: 15,
              }}>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 13,
                  color: '#4A4A4A',
                  fontFamily: FontFamilies.semibold,
                  textAlign: 'center',
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    width: 200,
    padding: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    gap: 10,
    top: 100,
    left: 60,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default BlockModal;
