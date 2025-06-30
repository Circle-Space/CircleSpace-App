/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  BackHandler,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Linking,
  Keyboard,
  TextInput,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get, post} from '../../services/dataRequest';
import {
  Color,
  FontSizes,
  FontFamilies,
  LineHeights,
  LetterSpacings,
} from '../../styles/constants';
import messaging from '@react-native-firebase/messaging';
import apiEndPoints from '../../constants/apiEndPoints';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

// Define the navigation param list type
type RootStackParamList = {
  BottomBar: undefined;
  Login: undefined;
  AccountDetails: undefined;
  OTPVerificationForLogin: {
    orderIdPassed: string;
    phoneNumber: string;
  };
};

// Type for the navigation object
type NavigationProp = StackNavigationProp<RootStackParamList>;

const Landing = () => {
  const navigation = useNavigation<NavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const phoneInputRef = useRef<TextInput>(null);

  const skipToHome = async () => {
    try {
      const responseData = await get('user/generate-temp-token', '', '');
      if (responseData.status === 200) {
        await AsyncStorage.setItem('userToken', responseData.authToken);
        await AsyncStorage.setItem('accountType', 'temp');
        navigation.reset({
          index: 0,
          routes: [{name: 'BottomBar'}],
        });
      }
    } catch (error) {
      console.error('Error skipping to home:', error);
      Alert.alert('Error', 'Failed to skip to home. Please try again.');
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      const accountType = await AsyncStorage.getItem('accountType');
      console.log('userToken', userToken);
      console.log('accountType', accountType);
      if (userToken && accountType !== 'temp') {
        navigation.reset({
          index: 0,
          routes: [{name: 'BottomBar'}],
        });
      }
    };
    checkToken();
  }, [navigation]);

  // preventing back to splash screen
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Disable back button functionality
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, []),
  );

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);

  // Validate phone number
  const validatePhoneNumber = () => {
    const phoneRegex = /^[0-9]{10}$/; // Simple 10 digit validation
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneNumberError('Please enter a valid 10-digit phone number');
      return false;
    }
    setPhoneNumberError('');
    return true;
  };

  // Handle phone number input
  const handlePhoneNumberChange = (text: string) => {
    const sanitizedText = text.replace(/\D/g, ''); // Ensure only numbers
    setPhoneNumber(sanitizedText);
  };

  // Handle sending OTP
  const handleSendOtp = async () => {
    const isPhoneNumberValid = validatePhoneNumber();

    if (isPhoneNumberValid) {
      setLoading(true);
      try {
        const mob = '91' + phoneNumber;
        const payload = {phoneNumber: mob};
        console.log('payload', payload);
        const responseData = await post('mobile/initiate-login', payload);
        console.log('responseData', responseData);
        console.log(responseData);
        if (responseData.data?.orderId != '') {
          const orderId = responseData.data.request_id;
          navigation.navigate('OTPVerificationForLogin', {
            orderIdPassed: orderId,
            phoneNumber,
          });
        } else {
          Alert.alert('Error', responseData.message || 'Failed to send OTP.');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTermsPress = () => {
    Linking.openURL('https://circlespace.in/privacy-policy');
  };

  // Add keyboard listener
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      // Scroll to ensure the phone input is visible when keyboard appears
      setTimeout(() => {
        // Using a more specific position to ensure the input is visible
        const inputPosition = Platform.OS === 'ios' ? 200 : 250;
        scrollViewRef.current?.scrollTo({ y: inputPosition, animated: true });
      }, 100);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      // Scroll back to top when keyboard hides
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Trigger keyboard on component mount to auto-focus the input
  useEffect(() => {
    // Short delay to ensure components are fully mounted
    const timer = setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View style={{flex: 1}}>
          <ScrollView
            ref={scrollViewRef}
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              isKeyboardVisible && { paddingBottom: 50 }
            ]}
            keyboardShouldPersistTaps="handled">
            <View>
              <View style={styles.header}>
                <Image
                  source={require('../../assets/onboarding/image.png')}
                  style={styles.logo}
                />
                <TouchableOpacity onPress={skipToHome} style={styles.skipButton}>
                  <Text style={styles.skip} allowFontScaling={false}>
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text allowFontScaling={false} style={styles.titleText}>
                Login or Sign up to continue
              </Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper1}>
                  <Text style={styles.inputField1Text}>+91</Text>
                </View>
                <View style={[styles.inputWrapper2, phoneNumberError ? styles.inputWrapperWithError : null]}>
                  <TextInput
                    style={[styles.inputField2, styles.inputWrapper2]}
                    value={phoneNumber}
                    placeholder="Enter mobile number"
                    placeholderTextColor={Color.primarygrey}
                    keyboardType="numeric"
                    maxLength={10}
                    onChangeText={handlePhoneNumberChange}
                    onFocus={() => setPhoneNumberError('')}
                    // onBlur={validatePhoneNumber}
                    ref={phoneInputRef}
                    allowFontScaling={false}
                  />
                  {phoneNumberError ? (
                    <Text style={styles.errorText}>{phoneNumberError}</Text>
                  ) : null}
                </View>
              </View>
              <Text allowFontScaling={false} style={styles.otpText}>
                We will send an OTP to confirm the number
              </Text>
            </View>

            <View style={[
              styles.footer,
              {paddingBottom: insets.bottom || 10 },
              isKeyboardVisible && { position: 'absolute', bottom: 20 }
            ]}>
              <Text allowFontScaling={false} style={styles.termsText}>
                By continuing, I agree with{' '}
                <Text
                  allowFontScaling={false}
                  style={styles.termsLink}
                  onPress={handleTermsPress}>
                  Terms & Conditions
                </Text>
              </Text>

              <TouchableOpacity
                onPress={handleSendOtp}
                style={styles.btn}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={Color.white} />
                ) : (
                  <Text allowFontScaling={false} style={styles.btnText}>
                    Send OTP
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
  },
  logo: {
    marginLeft: 5,
    height: 37,
    width: 140,
    objectFit: 'contain',
  },
  skip: {
    paddingHorizontal: 9,
    marginRight: 5,
    color: Color.primarygrey,
    alignSelf: 'flex-end',
    alignItems: 'center',
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 15,
    minWidth: 50,
    height: 27,
    textDecorationLine: 'underline',
  },
  skipButton: {
    alignSelf: 'center',
    padding: 5,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  titleText: {
    fontSize: FontSizes.large2,
    fontFamily: FontFamilies.bold,
    lineHeight: LineHeights.medium,
    fontWeight: '800',
    color: Color.black,
    paddingTop: 15,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    gap: 10,
    marginTop: Platform.OS === 'ios' ? 10 : 10,
  },
  inputWrapper1: {
    width: 47,
    borderRadius: 12,
    backgroundColor: Color.secondarygrey,
    height: Platform.OS === 'ios' ? 48 : 51,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : 8,
  },
  inputWrapper2: {
    width: '85%',
    position: 'relative',
  },
  inputWrapperWithError: {
    marginBottom: Platform.OS === 'ios' ? 25 : 25,
  },
  inputField1Text: {
    fontFamily: FontFamilies.bold,
    fontSize: FontSizes.medium,
    color: Color.black,
    fontWeight: '400',
  },
  inputField2: {
    flex: 1,
    width: '100%',
    borderRadius: 12,
    paddingVertical: 0,
    paddingHorizontal: 15,
    fontWeight: '400',
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.bold,    
    height: Platform.OS === 'ios' ? 48 : 51,
    color: Color.black,
    backgroundColor: Color.secondarygrey,
    marginTop: Platform.OS === 'ios' ? 0 : 8,
  },
  errorText: {
    color: 'red',
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    marginTop: 4,
    marginLeft: 4,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? -25 : -25,
    left: 0,
  },
  btn: {
    backgroundColor: Color.black,
    borderRadius: 12,
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? 52 : 52,
    alignItems: 'center',
    width: '90%',
    marginTop: 5,
  },
  btnText: {
    fontSize: FontSizes.large,
    lineHeight: 20,
    fontWeight: '400',
    color: '#FFF',
    fontFamily: FontFamilies.semibold,
    letterSpacing: LetterSpacings.wide,
  },
  termsText: {
    fontSize: FontSizes.small,
    color: Color.primarygrey,
    textAlign: 'center',
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
  },
  termsLink: {
    color: Color.black,
    fontWeight: '800',
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.small,
    textDecorationLine: 'underline',
  },
  otpText: {
    fontSize: FontSizes.small,
    color: Color.primarygrey,
    textAlign: 'left',
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    marginTop: Platform.OS === 'ios' ? 10 : 10,
    lineHeight: 18,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    gap: 10,
    bottom: 0,
    position: 'absolute',
  },
});

export default Landing;
