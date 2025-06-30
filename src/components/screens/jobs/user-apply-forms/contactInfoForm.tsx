import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Appbar, TextInput} from 'react-native-paper';
import CustomProgressBar from '../utils/customProgressBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get} from '../../../../services/dataRequest';
import CustomTextInput from '../../profile/businessProfile/customTextInput';
import CustomAlertModal from '../../../commons/customAlert';
import { Color, FontFamilies, FontSizes, LetterSpacings, LineHeights } from '../../../../styles/constants';
import phoneIcon from '../../../../assets/jobs/apply/phoneIcon.png';
import mailIcon from '../../../../assets/jobs/apply/mailIcon.png';

const ContactInfoForm = ({route}: any) => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const {jobTitle, comingFromPreview, jobId} = route.params;

  const [token, setToken] = useState('');
  const [isTokenFetched, setIsTokenFetched] = useState(false);
  const [storedUserData, setStoredUserData] = useState();
  console.log('32 coming data : ', comingFromPreview);
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('user');
        setStoredUserData(JSON.parse(userData!));
        if (savedToken !== null) {
          setToken(savedToken);
        } else {
          setToken('No token found');
        }
        setIsTokenFetched(true);
      } catch (error) {
        console.error('Failed to fetch token:', error);
        setToken('Error fetching token');
        setIsTokenFetched(true);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (isTokenFetched) {
      const fetchData = async () => {
        try {
          const data = await get(`user/get-jobprofiledata`, {}, token);
          if (data.status == 200) {
            console.log('data 61 : ', storedUserData.businessName);
            const username = `${storedUserData?.firstName || ''} ${
              storedUserData?.lastName || ''
            }`.trim(); // Construct full name with a fallback to empty strings
            const name =
              data?.jobProfile?.applicantData?.name ||
              storedUserData?.businessName ||
              username || // Fall back to username if businessName is not available
              ''; // Final fallback to empty string if all else is falsy
            setName(name);
            setEmail(
              data?.jobProfile?.applicantData?.email ||
                storedUserData?.email ||
                '',
            );
            setPhone(
              data?.jobProfile?.applicantData?.phone ||
                storedUserData?.mobileNo ||
                '',
            );
          } else {
            Alert.alert('Error', data.message || 'Failed to fetch data');
          }
        } catch (error) {
          Alert.alert('Error', 'An error occurred while fetching data');
        }
      };
      fetchData();
    }
  }, [isTokenFetched, token]);

  const validateForm = () => {
    let valid = true;
    if (!email.trim() || !isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!phone.trim() || !isValidPhone(phone)) {
      setPhoneError('Please enter a valid phone number.');
      valid = false;
    } else {
      setPhoneError('');
    }

    return valid;
  };

  const isValidEmail = (email: any) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone: any) => /^\d{10}$/.test(phone);

  const onSave = () => {
    console.log('coming from  :', comingFromPreview);
    if (validateForm()) {
      const formData = {
        jobTitle: jobTitle,
        profilePic: storedUserData?.profilePic,
        bio:storedUserData?.bio,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
      if (comingFromPreview) {
        navigation.navigate('ProfessionalDetailForm', {
          formData: comingFromPreview,
          jobId,
        });
      } else {
        navigation.navigate('ProfessionalDetailForm', {formData, jobId});
      }
    }
  };

  const clearError = (field: any) => {
    switch (field) {
      case 'email':
        setEmailError('');
        break;
      case 'phone':
        setPhoneError('');
        break;
      default:
        break;
    }
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const handleModalConfirm = async () => {
    setModalVisible(false);
    navigation.navigate('Jobs' as never);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.main}>
      <Appbar.Header>
        <Appbar.Content
          title={`Apply for ${
            jobTitle ? jobTitle : comingFromPreview?.jobTitle
          }`}
          titleStyle={styles.appHeader} // Correct prop for styling the title text
        />
      </Appbar.Header>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
      <View style={{paddingHorizontal: 15, marginTop: 10}}>
        <CustomProgressBar progress={0.0} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Contact Information</Text>

        <View style={styles.cardContainer}>
          <View style={styles.profileContainer}>
            {/* Profile Image */}
            <Image
              source={{
                uri:
                  storedUserData?.profilePic ||
                  'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
              }}
              style={styles.profileImage}
            />

            {/* Text Container */}
            <View style={styles.textContainer}>
              {/* Name */}
              <Text style={styles.nameText}>{name}</Text>

              {/* Description */}
              {storedUserData?.bio && (
                <Text style={styles.descriptionText}>
                  {storedUserData?.bio}
                </Text>
              )}
            </View>
          </View>
        </View>
        <CustomTextInput
          label="Email ID *"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text: any) => setEmail(text)}
          error={emailError}
          onFocus={() => clearError('email')}
          iconImage={mailIcon}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <CustomTextInput
          label="Contact No. *"
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={(text: any) => {
            setPhone(text);
            clearError('phone');
          }}
          error={phoneError}
          onFocus={() => clearError('phone')}
          iconImage={phoneIcon}
          autoCapitalize="none"
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, styles.bottomApply]}
          onPress={onSave}>
          <Text style={[styles.buttonText, styles.buttonActiveText]}>Next</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 75,
  },
  appHeader: {
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
    fontSize: FontSizes.large,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  heading: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    marginVertical: 8,
    color: '#1E1E1E',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    padding: 10,
    paddingHorizontal: 20,
    height: 106,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap:15,
  },
  bottomButton: {
    height: 52,
    width: '50%',
    backgroundColor: Color.white,
    borderWidth:1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  bottomApply: {
    backgroundColor: 'rgba(44, 44, 44, 1)',
  },
  buttonText: {
    fontWeight: '400',
    fontSize: FontSizes.large,
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    letterSpacing:LetterSpacings.wide,
  },
  buttonActiveText: {
    color: Color.white,
  },
  // prof card
  cardContainer: {
    backgroundColor: '#1E1E1E', // Light background color
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: FontSizes.medium,
    fontWeight: '400',
    color: Color.white,
    fontFamily:FontFamilies.semibold,
    // height: 18,
  },
  descriptionText: {
    fontSize: FontSizes.small,
    fontWeight: '400',
    color: Color.white,
    fontFamily: FontFamilies.regular,
    lineHeight:LineHeights.small,
  },
});

export default ContactInfoForm;
