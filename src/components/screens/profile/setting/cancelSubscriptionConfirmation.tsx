import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert, // Add ScrollView
} from 'react-native';
import {get} from '../../../../services/dataRequest';
import {SafeAreaView} from 'react-native-safe-area-context';

const CancelSubscriptionConfirmationScreen = () => {
  const navigate = useNavigation();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    // Fetch user data from AsyncStorage
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const token: any = await AsyncStorage.getItem('userToken');
        setToken(token);
        console.log('userdata ::', userData);
        if (userData) {
          setUser(JSON.parse(userData)); // Parse the JSON data
        }
        if (token) {
          setToken(token);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    fetchUserData();
  }, []);
  const navigation = useNavigation();

  const confirmationAlert = () => {
    Alert.alert(
      'Confirm Subscription Change',
      'Are you sure you wish to cancel your premium subscription?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {text: 'Yes', onPress: () => unSubscribePremium()},
      ],
      {cancelable: false},
    );
  };
  const unSubscribePremium = async () => {
    const apiResponse = await get('user/upgrade-account', {}, token);
    if (apiResponse.status === 200) {
      AsyncStorage.setItem('user', JSON.stringify(apiResponse?.user));
      AsyncStorage.setItem('isPaid', JSON.stringify(apiResponse?.user?.isPaid));
      navigation.navigate('Home' as never);
    } else {
      // Alert.alert(data.message);
    }
  };

  return (
    <SafeAreaView style={styles.scrollViewContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigate.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.benefitsTitle}>Cancel Subscription</Text>
      <Text style={styles.benefitsSubTitle}>
        Are you sure you want to cancel CircleSpace premium subscription?{' '}
      </Text>
      <TouchableOpacity
        style={[styles?.actionButton, styles.yesButton]}
        onPress={confirmationAlert}>
        <Text style={[styles.btnText, styles.yesText]}>Yes, cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles?.actionButton}
        onPress={() => navigate.goBack()}>
        <Text style={styles.btnText}>Go back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    padding: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 75,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Optional: semi-transparent background for better visibility
    borderRadius: 20,
    padding: 10,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  benefitsTitle: {
    fontSize: 28,
    textAlign: 'center',
    color: '#1E1E1E',
    fontFamily: 'Gilroy-Bold',
    fontWeight: '400',
    marginBottom: 10,
  },
  benefitsSubTitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1E1E1E',
    fontFamily: 'Gilroy-Medium',
    fontWeight: '400',
    margin: 15,
  },
  actionButton: {
    height: 52,
    borderRadius: 14,
    width: 150,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  yesButton: {
    backgroundColor: '#181818',
  },
  btnText: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: 15,
    fontWeight: '400',
  },
  yesText: {
    color: '#FFFFFF',
  },
});

export default CancelSubscriptionConfirmationScreen;
