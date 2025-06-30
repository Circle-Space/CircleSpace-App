import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import { FontFamilies } from '../../styles/constants';

const CustomBottomSheet = ({
  visible,
  title,
  keyPoints,
  onCancel,
  onContinue,
}: any) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}>
      <View style={styles.container}>
        <View style={styles.bottomSheet}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.keyPointsContainer}>
            {keyPoints.map((point: any, index: any) => (
              <Text key={index} style={styles.keyPoint}>
                {point}
              </Text>
            ))}
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    color: '#1D1919',
    marginBottom: 10,
  },
  keyPointsContainer: {
    marginBottom: 20,
  },
  keyPoint: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 5,
    fontFamily: FontFamilies.regular,
    color: '#4A4A4A',
  },
  buttonRow: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 8,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
  },
});

export default CustomBottomSheet;
