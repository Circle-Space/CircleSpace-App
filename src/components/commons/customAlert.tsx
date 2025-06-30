import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import { FontFamilies } from '../../styles/constants';

const CustomAlertModal = ({
  visible,
  title,
  description,
  buttonOneText,
  onPressButton1,
  buttonTwoText = null,
  onPressButton2 = null,
  buttonThreeText = null,
  onPressButton3 = null,
  onClose,
}:any) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalDescription}>{description}</Text>
              <View style={styles.buttonContainer}>
                <View style={styles.customDivider} />
                <TouchableOpacity style={styles.button} onPress={onPressButton1}>
                  <Text style={styles.buttonText}>{buttonOneText}</Text>
                </TouchableOpacity>
                {buttonTwoText && onPressButton2 && (
                  <>
                    <View style={styles.customDivider} />
                    <TouchableOpacity
                      style={styles.button}
                      onPress={onPressButton2}>
                      <Text style={styles.secondButtonText}>{buttonTwoText}</Text>
                    </TouchableOpacity>
                  </>
                )}
                {buttonThreeText && onPressButton3 && (
                  <>
                    <View style={styles.customDivider} />
                    <TouchableOpacity style={styles.button} onPress={onPressButton3}>
                      <Text style={styles.thirdButtonText}>{buttonThreeText}</Text>
                    </TouchableOpacity>
                  </>
                )}

              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 22,
    paddingTop: 20,
    alignItems: 'center',
    elevation: 5,
    maxWidth: 280,
    maxHeight:400,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 16,
    color: '#1E1E1E',
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    marginBottom: 10,
  },
  modalDescription: {
    textAlign: 'center',
    color: '#4A4A4A',
    fontWeight: '400',
    fontSize: 12,
    fontFamily: FontFamilies.medium,
    lineHeight:15,
    marginBottom: 20,
    maxWidth: 210,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
    maxWidth: 280,
    minWidth: 280,
  },
  button: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
  },
  buttonText: {
    color: '#ED4956',
    fontWeight: '400',
    fontSize:13,
    lineHeight:16,
    fontFamily: FontFamilies.semibold,
  },
  secondButtonText: {
    color: '#4A4A4A',
    fontWeight: '400',
    fontSize:13,
    lineHeight:16,
    fontFamily: FontFamilies.semibold,
  },
  thirdButtonText: {
    color: '#4A4A4A',
    fontWeight: '400',
    fontSize:13,
    lineHeight:16,
    fontFamily: FontFamilies.semibold,
  },
  fourthButtonText: {
    color: '#4A4A4A',
    fontWeight: '400',
    fontSize:13,
    lineHeight:16,
    fontFamily: FontFamilies.semibold,
  },
  customDivider: {
    height: 0.5, 
    width: '100%',
    backgroundColor: '#B9B9BB',
  },
});

export default CustomAlertModal;
