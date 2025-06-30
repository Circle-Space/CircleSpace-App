import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/Ionicons';

const FullScreenImageView = ({ visible, imageUri, onClose }) => {
  const images = [{ url: imageUri }];

  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.container}>
        <ImageViewer 
          imageUrls={images}
          renderIndicator={(currentIndex, allSize) => {
            // Hide the indicator if there's only one image
            if (allSize === 1) return null;
            return (
              <View>
                <Text style={styles.indicatorText}>{`${currentIndex} / ${allSize}`} two</Text>
              </View>
            );
          }}
        />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
  },
});

export default FullScreenImageView;
