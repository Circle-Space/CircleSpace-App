import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Color, FontFamilies } from '../../../styles/constants';
import BackButton from '../../commons/customBackHandler';

const badge = require('../../../assets/profile/editProfile/success-badge.png'); // Replace with your actual badge image path

const BusinessListedSuccess = () => {
  const navigation = useNavigation();

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'BottomBar' }],
    });
    console.log('Business listed Successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{top:10}}>
            <BackButton/>
        </View>
      <View style={styles.centerContent}>
        <Image source={badge} style={styles.badgeImg} />
        <Text style={styles.successText}>Business listed Successfully!</Text>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  badgeImg: {
    width: 180,
    height: 180,
    marginBottom: 32,
    resizeMode: 'contain',
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: FontFamilies.bold,
  },
  continueBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  continueBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FontFamilies.bold,
  },
});

export default BusinessListedSuccess; 