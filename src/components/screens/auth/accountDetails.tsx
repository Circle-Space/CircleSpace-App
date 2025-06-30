import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Color,
  FontFamilies,
  FontSizes,
  FontWeights,
  LineHeights,
  scaleFont,
} from '../../../styles/constants';
import CustomTextInput from '../profile/businessProfile/customTextInput';
import {useNavigation, useRoute, RouteProp, NavigationProp} from '@react-navigation/native';
import {createUser, get} from '../../../services/dataRequest';
import {post} from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../commons/customBackHandler';

type RootStackParamList = {
  AccountDetails: {
    phoneNumber: string;
  };
  MultiSelectCategory: {
    firstName: string;
    username: string;
    selectedOption: string;
    phoneNumber: string;
  };
  BottomBar: undefined;
};

type AccountDetailsRouteProp = RouteProp<RootStackParamList, 'AccountDetails'>;
type AccountDetailsNavigationProp = NavigationProp<RootStackParamList>;

const AccountDetails = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [firstName, setFirstName] = useState('');
  const route = useRoute<AccountDetailsRouteProp>();
  const {phoneNumber} = route.params;
  const [username, setUsername] = useState('');
  const [usernameAvailabilityMessage, setUsernameAvailabilityMessage] =
    useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptionError, setSelectedOptionError] = useState('');

  const [isSettingUp, setIsSettingUp] = useState(false);
  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const navigation = useNavigation<AccountDetailsNavigationProp>();

  const validateName = () => {
    // Allow alphabets, numbers, special characters and spaces
    const nameRegex = /^[A-Za-z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    if (!firstName.trim()) {
      setNameError('Name is required');
      return false;
    }
    if (!nameRegex.test(firstName.trim())) {
      setNameError('Name can only contain letters, numbers, spaces, and special characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateUsername = () => {
    // Only allow alphabets, numbers, dots, and underscores
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!username.trim()) {
      setUsernameError('Username is required');
      return false;
    }
    if (username.length < 4) {
      setUsernameError('Username must be longer than 4 characters');
      return false;
    }
    if (!usernameRegex.test(username)) {
      setUsernameError('Username can only contain letters, numbers, dots, and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const submitData = async () => {
    // Reset errors
    setNameError('');
    setUsernameError('');
    setSelectedOptionError('');

    // Validate name
    if (!firstName.trim()) {
      setNameError('Name is required');
      return;
    }

    // Check for specific invalid characters in name
    if (/[^a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(firstName)) {
      const invalidChars = firstName.match(/[^a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
      if (invalidChars) {
        setNameError(`Character${invalidChars.length > 1 ? 's' : ''} "${invalidChars.join('')}" ${invalidChars.length > 1 ? 'are' : 'is'} not allowed. Only letters, numbers, spaces, and special characters are allowed.`);
      }
      return;
    }

    // Validate username
    if (!username.trim()) {
      setUsernameError('Username is required');
      return;
    }
    if (username.length < 4) {
      setUsernameError('Username must be longer than 4 characters');
      return;
    }
    
    // Check for specific invalid characters
    if (username.includes(' ')) {
      setUsernameError('Spaces are not allowed in username');
      return;
    }
    if (/[^a-zA-Z0-9._]/.test(username)) {
      const invalidChars = username.match(/[^a-zA-Z0-9._]/g);
      setUsernameError(`Character${invalidChars?.length > 1 ? 's' : ''} "${invalidChars?.join('')}" ${invalidChars?.length > 1 ? 'are' : 'is'} not allowed. Only letters, numbers, dots, and underscores are allowed.`);
      return;
    }

    if (!selectedOption) {
      setSelectedOptionError('*Please select an option before proceeding.');
      return;
    }

    // Check username availability first
    setIsLoading(true);
    const usernameResponse = await post('user/username-available', {
      username: username.toLowerCase(),
    });

    if (!usernameResponse.available) {
      setUsernameError(usernameResponse.message || 'Username is not available');
      setIsLoading(false);
      return;
    }
    if (selectedOption === 'personal') {
      try {
        const payload = {
          phoneNumber: phoneNumber,
          accountType: selectedOption,
          password: '', // You'll need to get this from previous steps
          username: username.toLowerCase(),
          firstName: firstName.trim(),
          lastName: '', // Empty string since we're only using firstName
          email: '', // You'll need to get this from previous steps
          businessName: '', // Not needed for personal
          address: {
            line1: '', // You'll need to get this from previous steps
            city: '', // You'll need to get this from previous steps
            state: '', // You'll need to get this from previous steps
            pincode: '', // You'll need to get this from previous steps
          },
          locationServed: [], // Not needed for personal
          minBudget: '', // Not needed for personal
          maxBudget: '', // Not needed for personal
          professionalType: '', // Not needed for personal
          professionalCategory: [], // Not needed for personal
          servicesProvided: [], // Not needed for personal
          website: '', // Not needed for personal
          otherServices: [], // Not needed for personal
        };
        setIsSettingUp(true);

        const responseData = await createUser('user/create', payload);
        console.log("responseData", responseData);

        if (responseData.status === 200) {
          await AsyncStorage.setItem('userToken', responseData?.authToken);
          await AsyncStorage.setItem('accountType', responseData?.user?.accountType);

          // Store the user object as a string
          await AsyncStorage.setItem('user', JSON.stringify(responseData.user));

          // Store the userId (prefer _id, fallback to userId)
          const userId = responseData.user._id || responseData.user.userId;
          if (userId) {
            await AsyncStorage.setItem('UserId', userId);
          }

          setTimeout(() => {
            setIsSettingUp(false);
            navigation.reset({
              index: 0,
              routes: [{name: 'BottomBar'}],
            });
          }, 3000);
        } else {
          setIsSettingUp(false);
          console.log('Error res:', responseData);
          Alert.alert(
            'Error',
            responseData.message || 'Failed to create user. Please try again.',
          );
        }
      } catch (error) {
        setIsSettingUp(false);
        console.error('Error:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } else {
      console.log('data ::',firstName,username);
      // For professional/business, navigate to next screen with only firstName
      console.log('data ::',phoneNumber,firstName,username);
      navigation.navigate('BusinessDetailsStep2' as never, {
        phoneNumber: phoneNumber,
        businessName: firstName,
        businessUsername: username,
      });
    }
    setIsLoading(false);
  };

  // detect hadrware back click & block back button

  return (
    <SafeAreaView style={styles.container}>
      <View style={{top:10}}>
        <BackButton/>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Account Details</Text>

        <View style={styles.formContainer}>
          <CustomTextInput
            label="Enter Name"
            placeholder="Enter Name"
            value={firstName}
            onChangeText={text => {
              setFirstName(text);
            }}
            error={nameError}
          />

          <CustomTextInput
            label="Username"
            placeholder="Enter Username"
            value={username}
            onChangeText={text => {
              setUsername(text.toLowerCase());
            }}
            error={usernameError}
            autoCapitalize="none"
            hint="Use letters, numbers, dots, and underscores. Minimum 4 characters."
          />
          {/* <Text style={styles.hintText}>Choose your username carefully, it can't be changed later.</Text> */}
        </View>

        <Text style={styles.label}>What describes you the best?</Text>

         <View style={styles.optionsContainer}>
          <View style={styles.optionWrapper}>
            <TouchableOpacity
              style={[
                styles.option,
                selectedOption === 'personal' && styles.selectedOption,
              ]}
              onPress={() => setSelectedOption('personal')}>
              <Image
                source={
                  selectedOption === 'personal'
                    ? require('../../../assets/onboarding/accountDetails/Homeowner.png')
                    : require('../../../assets/onboarding/accountDetails/Homeowner1.png')
                }
                style={styles.image}
              />
            </TouchableOpacity>
            <View
              style={[
                styles.optionText,
                selectedOption === 'personal' && styles.selectedOptionText,
              ]}>
              <Text
                style={[
                  styles.text,
                  selectedOption === 'personal' && styles.selectedText,
                ]}
                numberOfLines={1}>
                Personal
              </Text>
            </View>
          </View>

          <View style={styles.optionWrapper}>
            <TouchableOpacity
              style={[
                styles.option,
                selectedOption === 'professional' && styles.selectedOption,
              ]}
              onPress={() => setSelectedOption('professional')}>
              <Image
                source={
                  selectedOption === 'professional'
                    ? require('../../../assets/onboarding/accountDetails/Business.png')
                    : require('../../../assets/onboarding/accountDetails/Business1.png')
                }
                style={styles.image}
              />
            </TouchableOpacity>
            <View
              style={[
                styles.optionText,
                selectedOption === 'professional' && styles.selectedOptionText,
              ]}>
              <Text
                style={[
                  styles.text,
                  selectedOption === 'professional' && styles.selectedText,
                ]}
                numberOfLines={1}>
                Business
              </Text>
            </View>
          </View>
        </View>
        {selectedOptionError ? (
          <Text style={styles.errorText}>{selectedOptionError}</Text>
        ) : null}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.nextButton,
          // (!firstName.trim() ||
          //   !username.trim() ||
          //   username.length <= 4 ||
          //   !selectedOption) &&
          //   styles.disabledButton,
        ]}
        onPress={submitData}
        // disabled={
        //   !firstName.trim() ||
        //   !username.trim() ||
        //   username.length <= 4 ||
        //   !selectedOption
        // }
        >
        <Text style={styles.nextButtonText}>
          {selectedOption === 'personal' ? 'Submit' : 'Continue'}
        </Text>
      </TouchableOpacity>
      {isSettingUp && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.black} />
            <Text style={styles.loadingText}>Setting up your account...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    marginTop:30,
  },
  header: {
    fontSize: 20,
    fontFamily: FontFamilies.bold,
    lineHeight: LineHeights.large,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    color: Color.black,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    marginBottom: 5,
  },
  availabilityText: {
    color: 'green',
    fontSize: 12,
    marginBottom: 15,
  },
  formContainer: {
    flex: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
    gap: 22,
  },
  optionWrapper: {
    paddingVertical: 10,
    // justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  option: {
    width: Dimensions.get('window').width * 0.3,
    height: Dimensions.get('window').width * 0.3,
    borderWidth: 2,
    borderColor: '#F3F3F3',
    borderRadius: 14,
    overflow: 'hidden',
  },
  selectedOption: {
    borderColor: '#000',
  },
  image: {
    width: Dimensions.get('window').width * 0.29,
    height: Dimensions.get('window').width * 0.29,
  },
  optionText: {
    backgroundColor: Color.secondarygrey, // No background when not selected
    paddingVertical: 5.5,
    paddingHorizontal: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 40,
    borderRadius: 10,
  },

  selectedOptionText: {
    backgroundColor: Color.black, // Black background for selected
  },

  text: {
    color: '#000', // Default black text for unselected
    fontSize: 11,
    textAlign: 'center',
    fontFamily: FontFamilies.semibold,
  },

  selectedText: {
    color: Color.white, // White text for selected option
  },
  errorText: {
    color: Color.black,
    fontSize: 12,
    marginTop: 5,
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.medium,
    color: Color.black,
    textAlign: 'center',
  },
  hintText: {
    color: Color.primarygrey,
    fontSize: FontSizes.extraSmall,
    marginLeft: 5,
    marginTop: -15,
    marginBottom: 10,
  },
});

export default AccountDetails;
