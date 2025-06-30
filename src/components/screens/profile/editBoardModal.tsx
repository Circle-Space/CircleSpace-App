import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EditBoardModal = ({ visible, onClose, savedData = {}, onSaveChanges }) => {
  const [boardName, setBoardName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    setBoardName(savedData?.collectionName || '');
    setIsPrivate(savedData?.visibility === 'private');
  }, [savedData]);

  // Function to render the images and placeholders for the modal in the specified layout
  const renderImagesLayout = () => {
    const images = savedData?.posts?.slice(0, 4) || []; // Up to 4 images or placeholders

    return (
      <View style={styles.imageGrid}>
        {images.map((post, index) => (
          <Image
            key={`image-${index}`}
            source={{ uri: post.contentUrl }}
            style={styles.imagePreview}
          />
        ))}
        {Array.from({ length: 4 - images.length }).map((_, index) => (
          <View key={`placeholder-${index}`} style={styles.imagePlaceholder} />
        ))}
      </View>
    );
  };

  // Function to handle save button click
  const handleSave = () => {
    // Passing the updated data back to the parent component
    onSaveChanges({ collectionName: boardName, visibility: isPrivate ? 'private' : 'public' });
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.bottomModal}
    >
      <View style={styles.modalContent}>
        {/* Header Row with Close Button and Title */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={18} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Board</Text>
        </View>

        {/* Image Grid */}
        <View style={styles.imageWrapper}>
          {renderImagesLayout()}
        </View>

        {/* Board Name Input */}
        <Text style={styles.label}>Name Your Board</Text>
        <TextInput
          style={styles.input}
          value={boardName}
          onChangeText={setBoardName}
          placeholder="Enter board name"
        />

        {/* Visibility Toggle */}
        <Text style={styles.label}>Visibility</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Keep this board private</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
          />
        </View>
        <Text style={styles.infoText}>
          If you don't want others to see this board, keep it secret.
        </Text>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Make Changes</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  closeButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EBEBEB',
    borderRadius: 50,
    padding: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1E1E1E',
    textAlign: 'center',
    flex: 1,
    marginRight: 20,
    fontFamily: 'Gilroy-SemiBold',
  },
  imageWrapper: {
    width: 100,
    height: 100,
    alignSelf: 'center', // Center the grid in the modal
    marginBottom: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  imagePreview: {
    width: '48%',  // Make images fill half the width (2x2 grid)
    height: '48%', // Make images fill half the height
    borderRadius: 8,
    margin: '1%',  // Add slight margin to space out the images
  },
  imagePlaceholder: {
    width: '48%',
    height: '48%',
    borderRadius: 8,
    margin: '1%',
    backgroundColor: '#f0f0f0',
  },
  label: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Gilroy-Medium',
    marginBottom: 5,
    color: '#81919E',
  },
  input: {
    borderRadius: 10,
    color: '#1E1E1E',
    fontFamily: 'Gilroy-Medium',
    padding: 10,
    fontSize: 12,
    backgroundColor: '#F3F3F3',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 20,
    padding: 10,
  },
  switchText: {
    fontSize: 14,
    color: '#1E1E1E',
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: '400',
  },
  infoText: {
    fontSize: 12,
    color: '#81919E',
    fontFamily: 'Gilroy-Regular',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'Gilroy-SemiBold',
  },
});

export default EditBoardModal;
