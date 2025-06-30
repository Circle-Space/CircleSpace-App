import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Color, FontFamilies, FontSizes, FontWeights } from '../../styles/constants';

const GetStartedModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    onClose();
    navigation.navigate('Landing' as never);
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType='none'
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.text}>Login to continue to the app</Text>
              <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                <Text style={styles.buttonText}>Let's get started</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
  },
  text: {
    fontSize: FontSizes.large2,
    fontFamily:FontFamilies.bold,
    color:Color.black,
    marginBottom: 20,
    marginVertical:10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Color.black,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: Color.white,
    fontSize: FontSizes.medium2,
    fontFamily:FontFamilies.semibold,
  },
});

export default GetStartedModal;