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
import apiEndPoints from '../../../../constants/apiEndPoints';
import {Room} from '../Chats';
import chatRequest from '../../../../services/chatRequest';
import { useNavigation } from '@react-navigation/native';
import routes from '../../../../constants/routes';
import { FontFamilies } from '../../../../styles/constants';
interface ReportModalProps {
  visible: boolean;
  setVisible: any;
  roomData: Room;
}
const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  setVisible,
  roomData,
}) => {
  const navigation = useNavigation()
  const handleReportUser = () => {
    const payload = new FormData();
    payload.append('room_id',roomData?.room_id)
    payload.append('message_by',roomData?.receiver_id)
    chatRequest(
      apiEndPoints.reportChat,
      'POST',
      payload,
      'multipart/form-data',
    )
      .then((res: any) => {
        if (!res?.error) {
          Alert.alert(res?.message);
          setVisible(false);
          //@ts-ignore
          navigation.navigate(routes.chats)
        }
      })
      .catch(e => {});
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
            setVisible(false);
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
              Report Account
            </Text>
            <Text
              style={{
                fontWeight: '400',
                fontSize: 12,
                fontFamily: FontFamilies.medium,
                color: '#4A4A4A',
                textAlign: 'center',
                lineHeight: 15,
                padding: 20,
                paddingBottom: 0,
                paddingTop: 0,
              }}>
              Report If you believe this account violates our guidelines or
              engages in inappropriate behavior
            </Text>
            <TouchableOpacity
              onPress={() => {
                handleReportUser()
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
                Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setVisible(false);
              }}
              style={{
                borderBottomColor: '#B9B9BB',

                borderBottomWidth: 0.5,

                paddingBottom: 20,
                paddingTop: 0,
                width: '100%',
                padding: 20,
                //   paddingLeft: 10,
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

export default ReportModal;
