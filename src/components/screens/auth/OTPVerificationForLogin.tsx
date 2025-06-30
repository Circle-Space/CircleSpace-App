import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  AppState,
  AppStateStatus,
  ScrollView,
  StatusBar,
  Keyboard,
  Clipboard,
} from 'react-native';
import {post} from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FontSizes,
  Color,
  FontFamilies,
  LineHeights,
} from '../../../styles/constants';
import {OtpInput} from 'react-native-otp-entry';

interface OTPVerificationParams {
  orderIdPassed: string;
  phoneNumber: string;
}

export default function OTPVerificationForLogin({navigation}: any) {
  const [otpCode, setOtpCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const otpInputRef = useRef<any>(null);
  const {orderIdPassed, phoneNumber} =
    useRoute<
      RouteProp<
        {OTPVerificationForLogin: OTPVerificationParams},
        'OTPVerificationForLogin'
      >
    >().params;
  const [orderId] = useState<string>(orderIdPassed);
  console.log('orderId', orderId);
  console.log('phoneNumber', phoneNumber);
  const [timer, setTimer] = useState<number>(60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const appState = useRef(AppState.currentState);
  const lastTimeRef = useRef<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const currentTime = Date.now();
        if (lastTimeRef.current) {
          const timeElapsed = Math.floor(
            (currentTime - lastTimeRef.current) / 1000,
          );
          setTimer(prevTimer => Math.max(prevTimer - timeElapsed, 0));
        }
      } else if (nextAppState.match(/inactive|background/)) {
        lastTimeRef.current = Date.now();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    if (isTimerActive && timer > 0) {
      timerInterval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isTimerActive, timer]);

  const handleVerifyOTP = useCallback(
    async (code: string = otpCode) => {
      if (code.length !== 6 || isVerifying) return;

      setIsVerifying(true);
      const payload = {
        phoneNumber: `91${phoneNumber}`,
        otp: code,
        orderId,
      };

      try {
        const response = await post('mobile/verify-login-otp', payload);
        console.log('response otp verification', response);
        if (response.status === 200) {
          await AsyncStorage.setItem('verifiedMobile', phoneNumber);
          console.log('response.accounts',response.accounts)
          navigation.navigate('SelectAccount', {
            accounts: response.accounts,
            phoneNumber: phoneNumber,
          });
        } else if (response.message === 'Invalid or expired OTP.') {
          Alert.alert('OTP invalid or expired', 'Please try again.');
          setOtpCode('');
        } else if (
          response.status === 404 &&
          response.message === 'No accounts found for the provided mobile number.'
        ) {
          navigation.navigate('AccountDetails', {phoneNumber});
        } else {
          throw new Error('Verification failed.');
        }
      } catch (error) {
        console.log('error otp verification', error);
        setOtpCode('');
      } finally {
        setIsVerifying(false);
      }
    },
    [otpCode, orderId, phoneNumber, navigation, isVerifying],
  );

  const resendOTP = useCallback(async () => {
    if (orderId) {
      try {
        const response = await post('mobile/resend-otp', { 
          phoneNumber: `91${phoneNumber}`
        });
        console.log('response resend otp', response);
        if (response) {
          setIsTimerActive(false);
          setTimer(60);
          setIsTimerActive(true);
          setOtpCode('');
          Alert.alert('Success', 'OTP resent successfully.');
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to resend OTP');
      }
    } else {
      Alert.alert('Error', 'Order ID not found. Please try again.');
    }
  }, [orderId, phoneNumber]);

  const handleSendOtp = async () => {
   
      try {
        const mob = '91' + phoneNumber;
        const payload = {phoneNumber: mob};
        console.log('payload', payload);
        const responseData = await post('mobile/initiate-login', payload);
        console.log('responseData', responseData);
        console.log(responseData);
        if (responseData.status === 200) {
          setIsTimerActive(false);
          setTimer(60);
          setIsTimerActive(true);
          setOtpCode('');
          Alert.alert('Success', 'OTP resent successfully.');
        } else {
          throw new Error(responseData.message);
        }
        
      } catch (error) {
        Alert.alert('Error', 'Failed to resend OTP');
      } 
    }
  

  const routeToRegister = useCallback(
    () => navigation.navigate('Landing', {}),
    [navigation],
  );

  const handleClipboardPaste = useCallback(async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      // Check if clipboard contains a 6-digit OTP
      const otpMatch = clipboardContent.match(/\b\d{6}\b/);
      if (otpMatch) {
        const extractedOTP = otpMatch[0];
        setOtpCode(extractedOTP);
        // Auto-verify if we have a valid 6-digit OTP
        setTimeout(() => handleVerifyOTP(extractedOTP), 100);
      }
    } catch (error) {
      console.log('Error reading clipboard:', error);
    }
  }, [handleVerifyOTP]);

  const handleOTPFocus = useCallback(() => {
    console.log('Focused');
    // Check clipboard when focused to help with iOS SMS OTP
    if (Platform.OS === 'ios') {
      handleClipboardPaste();
    }
  }, [handleClipboardPaste]);

  const handleOTPTextChange = useCallback((text: string) => {
    // Ensure we only accept numeric input and maintain length
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpCode(numericText);
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      },
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.mainContent}>
          <Text style={styles.title}>Please enter OTP</Text>
          <Text style={styles.subTitle}>OTP sent to +91 {phoneNumber}</Text>
          <TouchableOpacity onPress={routeToRegister}>
            <Text style={styles.changeNumber}>Change number</Text>
          </TouchableOpacity>

          <OtpInput
            numberOfDigits={6}
            focusColor="#000"
            autoFocus={true}
            hideStick={true}
            blurOnFilled={false}
            disabled={false}
            type="numeric"
            secureTextEntry={false}
            onFocus={handleOTPFocus}
            onBlur={() => {}}
            onTextChange={handleOTPTextChange}
            onFilled={text => handleVerifyOTP(text)}
            theme={{
              containerStyle: styles.otpInputContainer,
              pinCodeContainerStyle: styles.otpBox,
              pinCodeTextStyle: styles.otpText,
            }}
          />

          <View style={{ alignItems: 'center', marginTop: 16 }}>
            {isTimerActive ? (
              <Text style={styles.resendOtpButtonText}>Resend OTP in {timer} seconds</Text>
            ) : (
              <TouchableOpacity
                style={styles.resendOtpButton}
                onPress={handleSendOtp}
                disabled={isTimerActive}
            >
              <Text style={styles.resendOtpButtonText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
          </View>
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.btn,
              !otpCode || otpCode.length !== 6 || isVerifying ? styles.btnDisabled : null,
            ]}
            onPress={() => handleVerifyOTP()}
            disabled={!otpCode || otpCode.length !== 6 || isVerifying}>
            <Text allowFontScaling={false} style={styles.btnText}>
              {isVerifying ? 'Verifying...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
    backgroundColor: '#fff',
  },
  pinCodeContainer: {
    borderWidth: 1,
    borderColor: 'black',
    height: 45,
    width: 45,
    marginHorizontal: 0,
  },
  pinCodeText: {
    color: 'black',
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.large,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  mainContent: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.large2,
    fontWeight: '800',
    marginBottom: 10,
    color: Color.black,
    textAlign: 'center',
    fontFamily: FontFamilies.bold,
    lineHeight: LineHeights.large,
  },
  subTitle: {
    fontSize: FontSizes.small,
    fontWeight: '400',
    marginBottom: 5,
    fontFamily: FontFamilies.medium,
    color: Color.primarygrey,
    textAlign: 'center',
    lineHeight: 14.4,
  },
  changeNumber: {
    color: Color.black,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.semibold,
    fontWeight: '800',
    textAlign: 'center',
  },
  otpContainer: {
    width: '80%',
    height: 80,
    marginVertical: 24,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderRadius: 12,
    backgroundColor: Color.secondarygrey,
    color: Color.black,
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.semibold,
    borderWidth: 0,
  },
  otpInputFocus: {
    borderWidth: 0,
    borderColor: Color.black,
  },
  resendButton: {
    marginTop: 10,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    borderRadius: 12,
    backgroundColor: Color.white,
    paddingHorizontal: 20,
  },
  resendText: {
    color: Color.black,
    textAlign: 'center',
    marginTop: Platform.OS === 'android' ? 0 : 10,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.medium,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  btn: {
    backgroundColor: Color.black,
    borderRadius: 12,
    justifyContent: 'center',
    height: 52,
    alignItems: 'center',
    width: '90%',
    marginTop: 5,
  },
  btnText: {
    fontSize: FontSizes.large,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    color: Color.white,
  },
  btnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  pasteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Color.black,
    borderRadius: 12,
    justifyContent: 'center',
    height: 40,
    alignItems: 'center',
    width: '80%',
    marginTop: 15,
  },
  pasteButtonText: {
    fontSize: FontSizes.medium,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    color: Color.black,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 22,
    gap: 5, // space between boxes
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',

    alignItems: 'center',
    borderWidth: 0,
    marginHorizontal: 6,
    elevation: 0,
  },
  otpText: {
    color: '#111',
    fontSize: FontSizes.medium2,
    fontFamily: FontFamilies.regular,
    textAlign: 'center',
  },
  resendOtpButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  resendOtpButtonText: {
    color: '#111',
    fontSize: 16,
    fontFamily: FontFamilies.medium,
    // fontWeight: '600',
  },
});
