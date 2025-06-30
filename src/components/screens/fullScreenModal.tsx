/* eslint-disable prettier/prettier */
import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImageViewer from 'react-native-image-zoom-viewer';

const FullScreenImageModal = ({ visible, imageUrl, onClose }) => {
  const images = [{ url: imageUrl }];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <ImageViewer
          imageUrls={images}
          enableSwipeDown={true}
          onSwipeDown={onClose}
          renderIndicator={() => null}
          renderHeader={() => (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={30} color="#fff" />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
});

export default FullScreenImageModal;
