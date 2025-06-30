import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { handleShareProfile } from '../screens/jobs/utils/utils';

const SettingRoute = ({profile}: any) => {
  const navigation = useNavigation();
  // console.log("profile",profile);
  return (
    
    <View style={styles.main}>
      {/* <TouchableOpacity onPress={() => {}} style={styles.button}>
        <Image
          source={require('../../assets/header/notificationBellIcon.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}} style={styles.button}>
        <Image
          source={require('../../assets/header/messageIcon.png')}
          style={styles.icon}
        />
      </TouchableOpacity> */}
      <TouchableOpacity
        onPress={() => {
          // navigation.navigate('SettingPage' as never);
          handleShareProfile(profile);
        }}
        style={styles.button}>
          <View style={styles.iconWrapper}>
        <Image
          source={require('../../assets/header/shareIcon.png')}
          style={styles.shareIcon}
        />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('SettingPage' as never);
        }}
        style={styles.button}>
          <View style={styles.iconWrapper}>
        <Image
          source={require('../../assets/header/settings.png')}
          style={styles.settingIcon}
        />
        </View>
      </TouchableOpacity>
    </View>
    
  );
};

export default SettingRoute;

const styles = StyleSheet.create({
   iconWrapper: {
    width: 40, // Increase size for better shadow visibility
    height: 40,
    borderRadius: 12,
    // marginLeft:10,
    // backgroundColor: '#FFFFFF', // Ensure background is visible
    justifyContent: 'center',
    alignItems: 'center',

    // // iOS Shadow
    // shadowColor: '#A6A6A6',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.2,
    // shadowRadius: 6,

    // // Android Shadow
    // elevation: 10,
  },
  main: {
    flexDirection: 'row', 
    paddingHorizontal:20,
    gap:4,
    // paddingTop:15,
  },
  button: {
    // alignItems: 'center',
    // justifyContent: 'center',
    // // marginRight: 15,
    // padding: 5,
    // borderRadius: 10,
    // backgroundColor: 'rgba(255, 255, 255, 0.5)', // Transparent white background
    // borderColor: 'rgba(255, 255, 255, 0.2)', // Transparent white border
    // borderWidth: 1,
  },
  icon: {
    height: 18,
    width: 18,
  },
  shareIcon: {
    height: 16,
    width: 16,
  },
  settingIcon: {
    height: 22,
    width: 22,
  },
});
