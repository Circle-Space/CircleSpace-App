import React, {useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertModal from './customAlert';

const BackButton = ({showCustomAlert, isJobs = false}: any) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const handleModalConfirm = async () => {
    setModalVisible(false);
    await handleNavigation();
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleGoBack = async () => {
    if (showCustomAlert) {
      setModalVisible(true);
    } else {
      await handleNavigation();
    }
  };

  const handleNavigation = async () => {
    try {
      if (!isJobs) {
        // Remove hideBottomBar flag from AsyncStorage
        await AsyncStorage.removeItem('hideBottomBar');
        // Check if there's a screen to go back to
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          // Check if the user is logged in
          const userToken = await AsyncStorage.getItem('userToken');
          const accountType = await AsyncStorage.getItem('accountType');

          if (userToken && accountType !== 'temp') {
            // Navigate to the home screen if logged in
            navigation.navigate('BottomBar' as never);
          } else {
            // Navigate to the landing screen if not logged in
            navigation.navigate('Landing' as never);
          }
        }
      } else {
        navigation.navigate('Home' as never);
      }
    } catch (error) {
      console.error('Error removing hideBottomBar from AsyncStorage:', error);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handleGoBack}>
        <View style={styles.iconWrapper}>
          <Image
            source={require('../../assets/header/backIcon.png')}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>
      {isModalVisible && (
        <CustomAlertModal
          visible={isModalVisible}
          title="Discard Changes"
          description="The changes will not be saved. Are you sure you want to discard these changes?"
          buttonOneText="Discard"
          buttonTwoText="Cancel"
          onPressButton1={handleModalConfirm}
          onPressButton2={handleModalCancel}
        />
      )}
    </>
  );
};

export default BackButton;
const styles = StyleSheet.create({
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginLeft: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
});
