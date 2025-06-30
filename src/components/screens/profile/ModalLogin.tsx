/* eslint-disable prettier/prettier */
import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {Modal} from 'react-native-paper';

const ModalLogin = ({modalVisible, setModalVisible, navigation, openLogin}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
        navigation.navigate('Login');
      }}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Image
            style={styles.modalImage}
            source={{uri: 'https://bootdey.com/img/Content/avatar/avatar1.png'}}
          />
          <Text style={styles.modalText}>
            Please log in to view your profile.
          </Text>
          <TouchableOpacity style={styles.modalButton} onPress={openLogin}>
            <Text style={styles.modalButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ModalLogin;
