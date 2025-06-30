/* eslint-disable prettier/prettier */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Modal} from 'react-native-paper';

const ActionModal = ({
  actionModalVisible,
  setActionModalVisible,
  modalPosition,
  handleDeleteImage,
  selectedImage,
}) => {
  return (
    <Modal
      visible={actionModalVisible}
      onDismiss={() => setActionModalVisible(false)}
      contentContainerStyle={[
        styles.actionModal,
        {top: modalPosition.top, left: modalPosition.left},
      ]}>
      <TouchableOpacity onPress={() => handleDeleteImage(selectedImage?._id)}>
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActionModalVisible(false)}>
        <Text style={styles.actionText}>Cancel</Text>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actionModal: {
    position: 'absolute',
    width: 120,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    paddingVertical: 10,
    textAlign: 'center',
  },
});

export default ActionModal;
