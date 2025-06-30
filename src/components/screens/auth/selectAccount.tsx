import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator, SafeAreaView, BackHandler } from 'react-native';
import { getInitials } from '../../../utils/commonFunctions'; // Ensure this utility gets initials from names
import { post } from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import apiEndPoints from '../../../constants/apiEndPoints';
import { Color, FontFamilies, FontSizes } from '../../../styles/constants';
import usePushNotification from '../../../hooks/usePushNotification';
import { useDispatch } from 'react-redux';
import { setCurrentUserId } from '../../../redux/reducers/chatSlice';

const SelectAccount = ({ navigation, route }: any) => {
  const { accounts , phoneNumber} = route.params; // Get the account details from navigation params
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    requestUserPermission,
    getFCMToken,
  } = usePushNotification(navigation);

  const gotoLandingScreen = useCallback(() => {
    navigation.navigate('Landing', {});
  }, [navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      gotoLandingScreen();
      return true; // Prevent default behavior
    });

    return () => backHandler.remove(); // Cleanup on unmount
  }, [gotoLandingScreen]);

  // Function to handle FCM token update
  const handleUpdateFcm = async () => {
    try {
      const fcmToken = await messaging().getToken();
      const responseData = await post(apiEndPoints.fcmUpdate, { fcmToken });

      console.log('FCM Token update successful');
      if (responseData.status === 200) {
        console.log('FCM Token update successful');
      } else {
        console.error('Error updating FCM token:', responseData);
      }
    } catch (error) {
      console.error('FCM Token update error:', error);
    }
  };
const dispatch =useDispatch()
  // Function to handle login
  const handleLogin = async () => {
    if (!selectedAccount) {
      Alert.alert('Validation Failed', 'Please select an account to continue.');
      return;
    }

    try {
      setLoading(true); // Start loading
      const responseData = await post('mobile/generate-authtoken', { userDetails: selectedAccount });
      if (responseData.status === 200) {
        // Save authentication details to AsyncStorage
        await AsyncStorage.setItem('userToken', responseData.authToken);
        await AsyncStorage.setItem('accountType', responseData?.user?.accountType);
        console.log("accounttype", responseData?.user?.accountType);
        await AsyncStorage.setItem('user', JSON.stringify(responseData?.user));
         dispatch(setCurrentUserId(responseData?.user?._id))
        // Update FCM token
        await requestUserPermission();
        await getFCMToken();
        await handleUpdateFcm();

        // Reset navigation to the BottomBar screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'BottomBar' }],
        });
      } else {
        Alert.alert('Error', responseData.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false); // End loading
    }
  };

  // JSX for rendering individual accounts
  const renderAccount = (account) => (
    <View key={account.userId} style={styles.accountItem}>
      {account?.profile ? (
        <Image source={{ uri: account?.profile }} style={styles.avatar} />
      ) : (
        <View style={styles.initialsAvatar}>
          <Text style={styles.initialsText}>
            {getInitials(account?.username)}
          </Text>
        </View>
      )}
      <View style={styles.accountDetails}>
        <Text style={styles.username}>
          {account.accountType === 'professional'
            ? account.businessName || `${account.firstName} ${account.lastName}`|| account.username
            : `${account.firstName} ${account.lastName}`}
        </Text>
            {/* {`${account.firstName} ${account.lastName}` || account.businessName || account.username} */}
        <Text style={styles.handle}>@{account.username}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.loginButton,
          selectedAccount === account.userId
            ? styles.loginButtonSelected
            : styles.loginButtonUnselected,
        ]}
        onPress={() => setSelectedAccount(account.userId)}
      >
        <Text
          style={
            selectedAccount === account.userId
              ? styles.loginTextSelected
              : styles.loginTextUnselected
          }
        >
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={gotoLandingScreen} style={styles.backButton}>
            <Image source={require('../../../assets/header/backIcon.png')} style={styles.backIcon} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Select account to continue</Text>
        {/* <Text style={styles.subtitle}>
          Please select the account with which you want to continue logging in.
        </Text> */}

        {/* Scrollable Account List */}
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.accountList}>
            {accounts.map((account) => renderAccount(account))}
          </View>
        </ScrollView>

        {/* Fixed Bottom Buttons Container */}
        <View style={styles.bottomContainer}>
          {/* Next Button */}
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: selectedAccount ? Color.black : Color.primarygrey }]}
            onPress={handleLogin}
            disabled={!selectedAccount || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Color.white} />
            ) : (
              <Text style={styles.nextButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* OR Text with Border */}
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate('AccountDetails', { phoneNumber: phoneNumber })}
          >
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 125,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: FontFamilies.bold,
    textAlign: 'center',
    marginBottom: 10,
    color: '#1E1E1E',
  },
  subtitle: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    textAlign: 'center',
    color: '#81919E',
    marginBottom: 30,
  },
  accountList: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
  },
  initialsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  initialsText: {
    color: Color.white,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FontFamilies.regular,
  },
  accountDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: FontFamilies.medium,
  },
  handle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#81919E',
    fontFamily: FontFamilies.regular,
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  loginButtonSelected: {
    backgroundColor: '#1E1E1E',
  },
  loginButtonUnselected: {
    backgroundColor: '#F3F3F3',
  },
  loginTextSelected: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FontFamilies.medium,
  },
  loginTextUnselected: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FontFamilies.medium,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  nextButton: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FontFamilies.medium,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  orText: {
    color: '#81919E',
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    marginHorizontal: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
  createAccountButton: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    marginBottom: 10,
  },
  createAccountText: {
    color: '#1E1E1E',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
  },
});

export default SelectAccount;
