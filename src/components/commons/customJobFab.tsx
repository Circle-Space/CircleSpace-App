import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FontFamilies } from '../../styles/constants';

const CustomJobFAB = (isPaid: any) => {
  const navigation = useNavigation();

  // const toggleMenu = () => {
  //   isPaid?.isPaid
  //     ? navigation.navigate('AddJobDetailFormOne', {fromEdit: false})
  //     : navigation.navigate('SubscriptionScreen' as never);
  // };
  const toggleMenu = () => {
     navigation.navigate('AddJobDetailFormOne', {fromEdit: false});
  };

  const addIconBG = require('../../assets/profile/postIcons/plus.png');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuButton1}
        onPress={toggleMenu}
        activeOpacity={1}>
        <ImageBackground source={addIconBG} style={styles.backgroundImage}>
          <Icon name="add" style={styles.icon1} size={20} color="white" />
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '20%',
    right: 0,
    zIndex: 1,
    alignItems: 'center',
  },
  menuOverlay: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    top: -65,
    right: -105,
    zIndex: 0,
  },
  buttonContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    marginTop: 5,
    color: '#FFF',
    fontSize: 10,
    fontFamily: FontFamilies.medium,
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: '#232323',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    width: 20,
    height: 20,
  },
  menuButton1: {
    height: 101,
    width: 40,
    justifyContent: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  icon1: {
    marginRight: 10,
    marginLeft: 15,
  },
});

export default CustomJobFAB;
