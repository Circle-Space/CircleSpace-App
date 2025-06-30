import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  Platform,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {post} from '../../services/dataRequest';
import CustomTextInput from '../screens/profile/businessProfile/customTextInput';
import PasswordInputField from '../formFields/passwordInputField';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';

const LoginBottomSheet = ({visible, onClose, showIcon}: any) => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showModal, setShowModal] = useState(visible);
  const phoneInputRef = useRef(null);

  useEffect(() => {
    const focusPhoneInput = () => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      }
    };
    const timeoutId = setTimeout(focusPhoneInput, 200);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      const accountType_ = await AsyncStorage.getItem('accountType');
      if (userToken && accountType_ !== 'temp') {
        navigation.navigate('BottomBar' as never);
      }
    };
    checkToken();
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      // When the screen is focused
      return () => {
        // When the screen is unfocused, hide the modal
        onClose();
      };
    }, [onClose]),
  );

  const validateUsername = () => {
    if (username.trim() === '') {
      setUsernameError('Username is required');
      return false;
    } else if (!/^[a-z]+$/.test(username)) {
      setUsernameError('Username should contain only lowercase alphabets');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const handleUsernameChange = (text: any) => {
    const sanitizedText = text.toLowerCase();
    const cleanedText = sanitizedText.replace(/[^a-z]/g, '');
    setUsername(cleanedText);
  };

  const validatePassword = () => {
    if (password.trim() === '') {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handlePasswordChange = (text: any) => {
    const sanitizedText = text.replace(/\s+/g, '');
    setPassword(sanitizedText);
  };

  const handleLogin = async () => {
    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();

    if (isUsernameValid && isPasswordValid) {
      const payload = {
        username: username,
        password: password,
      };
      try {
        setLoading(true);
        const responseData = await post('user/login-username', payload);
        if (responseData.status === 200) {
          await AsyncStorage.setItem('userToken', responseData.authToken);
          await AsyncStorage.setItem(
            'accountType',
            responseData?.user?.accountType,
          );
          await AsyncStorage.setItem(
            'user',
            JSON.stringify(responseData?.user),
          );
          Alert.alert('Success', responseData.message);
          navigation.reset({
            index: 0,
            routes: [{name: 'BottomBar' as never}],
          });
        } else {
          Alert.alert('Error', responseData.message);
        }
      } catch (error) {
        Alert.alert(
          'Error',
          'An error occurred during login. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Error', 'Please fix the errors in the form.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <SafeAreaView style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pillContainer}>
                <View style={styles.pill} />
              </View>
              {showIcon ? (
                <TouchableOpacity style={styles.cancelIcon} onPress={onClose}>
                  <Icon name="cancel" size={24} color="#000" />
                </TouchableOpacity>
              ) : null}
              <Text style={styles.modalText}>
                Please log in to your account.
              </Text>
              <View style={{width: '100%'}}>
                <CustomTextInput
                  ref={phoneInputRef}
                  label="Username"
                  style={[
                    styles.inputField,
                    usernameError ? {marginBottom: 0} : {marginBottom: 15},
                    usernameError ? styles.errorInput : null,
                  ]}
                  value={username}
                  placeholder="Enter your username"
                  iconName="account"
                  onChangeText={handleUsernameChange}
                  onFocus={() => setUsernameError('')}
                  onBlur={validateUsername}
                  error={usernameError}
                />

                <PasswordInputField
                  label="Password"
                  style={[
                    styles.inputField,
                    passwordError ? {marginBottom: 0} : {marginBottom: 15},
                    passwordError ? styles.errorInput : null,
                  ]}
                  value={password}
                  placeholder="********"
                  iconName={showPassword ? 'eye-off' : 'eye'}
                  secureTextEntry={!showPassword}
                  onChangeText={handlePasswordChange}
                  onFocus={() => setPasswordError('')}
                  onBlur={validatePassword}
                  error={passwordError}
                  onIconPress={() => setShowPassword(!showPassword)}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleLogin}
                  style={styles.button}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color={Color.black} />
                  ) : (
                    <Text style={styles.buttonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text
                style={styles.signup}
                onPress={() => {
                  navigation.navigate('Landing' as never);
                }}>
                Don't have an account?{' '}
                <Text style={styles.signupText}>Sign Up</Text>
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    position: 'absolute', // Fixes the positioning
    bottom:Platform.OS === 'ios'?-21: 0, // Anchors the modal content at the bottom
    left: 0,
    right: 0,
  },
  pillContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  pill: {
    width: 60,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  cancelIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  modalText: {
    fontSize: 16,
    fontFamily: FontFamilies.semibold,
    marginBottom: 20,
  },
  inputField: {
    fontFamily: FontFamilies.regular,
    backgroundColor: '#fff',
  },
  errorInput: {
    borderColor: 'red',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: Color.black,
    paddingVertical: 10,
    height:48,
    justifyContent:'center',
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: Color.white,
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    fontFamily: FontFamilies.bold,
  },
  signup: {
    color:Color.black,
    textAlign: 'center',
  },
  signupText: {
    color: Color.grey,
    fontWeight: '400',
    fontFamily: FontFamilies.bold,
    textDecorationLine: 'underline',
  },
});

export default LoginBottomSheet;
