import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAlertModal from '../../../commons/customAlert';
import {get, put} from '../../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import PasswordInputField from '../../../formFields/passwordInputField';
import { FontFamilies } from '../../../../styles/constants';
const PrivacySecurityScreen = () => {
  const navigation = useNavigation();
  const [isProfessionalAccount, setIsProfessionalAccount] = useState(false);
  const [isPasswordSectionVisible, setIsPasswordSectionVisible] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypeNewPassword, setRetypeNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypeNewPassword, setShowRetypeNewPassword] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [retypeNewPasswordError, setRetypeNewPasswordError] = useState('');

  const [allFieldsEmpty, setAllFieldsEmpty] = useState(true);

  const validatePassword = (password: string) => {
    if (password.trim() === '') {
      return 'Password is required';
    } else if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    } else if (!/\d/.test(password)) {
      return 'Password must contain at least one digit';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handlePasswordChange = (text: any, field: any) => {
    const sanitizedText = text.replace(/\s+/g, '');
    if (field === 'current') {
      setCurrentPassword(sanitizedText);
      setCurrentPasswordError(''); // Reset error on change
    } else if (field === 'new') {
      setNewPassword(sanitizedText);
      setNewPasswordError(''); // Reset error on change
    } else if (field === 'retype') {
      setRetypeNewPassword(sanitizedText);
      setRetypeNewPasswordError(''); // Reset error on change
    }

    // Check if any password field is non-empty
    if (currentPassword || newPassword || retypeNewPassword) {
      setAllFieldsEmpty(false);
    } else {
      setAllFieldsEmpty(true);
    }
  };

  const changePassword = async () => {
    const newPassError = validatePassword(newPassword);
    setNewPasswordError(newPassError);

    if (newPassError) return;

    if (newPassword !== retypeNewPassword) {
      setRetypeNewPasswordError(
        'New password and re-type new password must match',
      );
      return;
    }

    try {
      const finalData = {
        password: newPassword,
      };
      const response = await put('user/update-user', finalData);
      console.log('resp :', response);
      if (response.message === 'User updated successfully.') {
        Alert.alert('Password changed successfully.');
        handleLogout();
      } else {
        const errorData = await response.json();
        console.error('Error Response: ', errorData);
        Alert.alert('Error', errorData.message || 'Something went wrong.');
      }
    } catch (error: any) {
      console.error('Error: ', error);
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  // Fetch token
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const fetchToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('user');
      if (savedToken) {
        setToken(savedToken);
        setUserId(JSON.parse(userData!)?.userId);
      } else {
        console.log('else 97');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchToken();
    }, []),
  );

  // Account type toggle
  const handleAccountTypeToggle = () => {
    setIsProfessionalAccount(previousState => !previousState);
  };

  // delete account
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] =
    useState(false);

  const deleteAccountAlert = () => {
    setDeleteAccountModalVisible(true); // Show confirmation modal
  };

  const handleDeleteConfirm = async () => {
    try {
      const data = await get(`user/delete-account`, '', token);
      if (data) {
        if (data.status === 200) {
          Alert.alert('Success', 'Account Deleted Successfully.');
          handleLogout();
        }
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{name: 'Landing'}],
      });
      setDeleteAccountModalVisible(false); // Show confirmation modal
    } catch (error) {
      console.error('Error removing user token', error);
    }
  };

  const handleDeleteCancel = () => {
    console.log('Delete account canceled');
    setDeleteAccountModalVisible(false); // Close modal
  };

  const arrowRightIcon = require('../../../../assets/settings/arrowRightIcon.png');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <View style={styles.section}>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.dropdownHeader,
            isPasswordSectionVisible && styles.dropdownHeaderExpanded,
          ]}
          onPress={() =>
            setIsPasswordSectionVisible(!isPasswordSectionVisible)
          }>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Icon
            name={isPasswordSectionVisible ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#1E1E1E"
          />
        </TouchableOpacity>

        {isPasswordSectionVisible && (
          <>
            <Text style={styles.footerText}>
              Password Criteria: At least 8 characters long, contains at least
              one digit, and contains at least one special character.
            </Text>
            <PasswordInputField
              label="Current Password *"
              placeholder="********"
              value={currentPassword}
              onChangeText={(text: any) =>
                handlePasswordChange(text, 'current')
              }
              iconName={showCurrentPassword ? 'eye-off' : 'eye'}
              secureTextEntry={!showCurrentPassword}
              onIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
              error={currentPasswordError} // Display error for current password
            />
            <PasswordInputField
              label="New Password *"
              placeholder="********"
              value={newPassword}
              onChangeText={(text: any) => handlePasswordChange(text, 'new')}
              iconName={showNewPassword ? 'eye-off' : 'eye'}
              secureTextEntry={!showNewPassword}
              onIconPress={() => setShowNewPassword(!showNewPassword)}
              error={newPasswordError} // Display error for new password
            />
            <PasswordInputField
              label="Re-Type New Password *"
              placeholder="********"
              value={retypeNewPassword}
              onChangeText={(text: any) => handlePasswordChange(text, 'retype')}
              iconName={showRetypeNewPassword ? 'eye-off' : 'eye'}
              secureTextEntry={!showRetypeNewPassword}
              onIconPress={() =>
                setShowRetypeNewPassword(!showRetypeNewPassword)
              }
              error={retypeNewPasswordError} // Display error for re-typed password
            />
            <TouchableOpacity
              activeOpacity={1}
              style={styles.saveButton}
              onPress={() => changePassword()}
              disabled={allFieldsEmpty}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </>
        )}
      </View> */}

      {/* <TouchableOpacity
        activeOpacity={1}
        style={styles.deleteButton}
        onPress={() => {
          deleteAccountAlert();
        }}>
        <Text style={styles.deleteButtonText}>Delete Account</Text>
        <Image source={arrowRightIcon} style={styles.icon} />
      </TouchableOpacity> */}

      {/* <Text style={styles.footerText}>
        Once you delete your account you won’t be able to login to it anymore &
        your profile, photos, videos, comments, likes and followers will be
        permanently removed, you can’t recover them afterwards.
      </Text> */}
      <Text style={styles.query}>
        To learn more, visit our : {''}
        <Text
          style={[
            styles.query,
            {color: 'blue', textDecorationLine: 'underline'},
          ]}
          onPress={() =>
            Linking.openURL('https://circlespace.in/privacy-policy')
          }>
          Privacy Policy
        </Text>
      </Text>
      <CustomAlertModal
        visible={deleteAccountModalVisible}
        title="Delete Account"
        description="You can’t recover your account afterwards.Are you sure you want to delete your account."
        buttonOneText="Delete Account"
        buttonTwoText="Cancel"
        onPressButton1={handleDeleteConfirm}
        onPressButton2={handleDeleteCancel}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1E1E1E',
    fontFamily: FontFamilies.medium,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownHeaderExpanded: {
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
  },
  deleteButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  deleteButtonText: {
    color: '#ED4956',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
  },
  footerText: {
    fontSize: 10,
    color: '#81919E',
    fontFamily: FontFamilies.regular,
    lineHeight: 15,
    marginBottom: 10,
  },
  query: {
    color: '#81919E',
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    marginVertical: 10,
  },
  icon: {
    height: 20,
    width: 20,
  },
});

export default PrivacySecurityScreen;
