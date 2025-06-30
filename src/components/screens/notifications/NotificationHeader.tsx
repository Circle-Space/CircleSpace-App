import React from 'react';
import {View, Dimensions, TouchableOpacity, Text} from 'react-native';
import CustomIcons from '../../../constants/CustomIcons';
import {useNavigation} from '@react-navigation/native';
import { FontFamilies } from '../../../styles/constants';
const NotificationHeader = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        marginTop: 10,
        width: Dimensions.get('window').width,
        paddingLeft: 20,
      }}>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
        style={{
          padding: 10,
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: 10,
          width: 45,
          height: 45,
          justifyContent: 'center',
          shadowColor: '#A6A6A6',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 4, // For Android
        }}>
        <CustomIcons type="LEFT" color={'#1E1E1E'} />
      </TouchableOpacity>
      <Text
        style={{
          color: '#1E1E1E',
          fontFamily: FontFamilies.semibold,
          fontWeight: '400',
          fontSize: 16,
          width: 100,
        }}>
        Notification
      </Text>
      <View
        style={{
          width: 45,
        }}></View>
    </View>
  );
};
export default NotificationHeader;
