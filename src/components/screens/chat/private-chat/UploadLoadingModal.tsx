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
  ActivityIndicator,
} from 'react-native';

interface UploadLoadingModalProps {
  visible: boolean;
  setVisible: any;
  type?:string
}
const UploadLoadingModal: React.FC<UploadLoadingModalProps> = ({
  visible,
  setVisible,
  type
}) => {
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
              height: 150,
            }}>
            <ActivityIndicator size={'large'} />
            <Text
              style={{
                fontWeight: '600',
                fontSize: 12,
                color:'black'
              }}>
             {type==='download'?"Downloading...":
              type==='upload_photo'?"Uploading photo...":
              type==='upload_video'?"Uploading video...":
              type==='upload_audio'?"Uploading audio...":
              type==='upload_document'?"Uploading document...":
              "Uploading...."} 
            </Text>
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

export default UploadLoadingModal;
