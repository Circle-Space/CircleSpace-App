import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Image,
  SafeAreaView,
  BackHandler,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Color, FontFamilies, FontSizes, LetterSpacings, LineHeights} from '../../../../styles/constants';
import {put} from '../../../../services/dataRequest';
import CustomTextInput from '../businessProfile/customTextInput';
import LocationModal from '../../../commons/LocationModal';
import CustomAlertModal from '../../../commons/customAlert';
import AWS from 'aws-sdk';
import {launchImageLibrary} from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import BackButton from '../../../commons/customBackHandler';
import CustomSingleSelect from '../../jobs/addJob/CustomSingleSelect';

type RootStackParamList = {
  MultiSelectCategory: {
    existingCategories: string[];
    fromProfile: boolean;
    onSaveCategories: (categories: string[]) => Promise<void>;
  };
  ProfileRewamp: undefined;
};

const formatToDisplayDate = (dateString: string): string => {
  if (!dateString) return ''; 
  
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return dateString;
  
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    return dateString;
  }
};

const LocationInput = ({label, value, iconImage, onPress}: any) => {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        onPress={onPress} 
        style={styles.locationInputContainer}
      >
        <View style={styles.locationContent}>
          <Image source={iconImage} style={styles.locationIcon} />
          <Text style={styles.locationText}>{value || 'Select your city'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const EditProfileRewamped = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const profile: any = route.params ? route.params : {};

  // Add error states
  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [gstError, setGstError] = useState('');
  const [activeSinceError, setActiveSinceError] = useState('');

  // AWS Configuration
  const S3_BUCKET = 'csappproduction-storage';
  const REGION = 'ap-south-1';
  const ACCESS_KEY = 'AKIAU6GDZYODLC5QOLPX';
  const SECRET_KEY = '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';

  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
  });

  const s3 = new AWS.S3();

  // State management based on JSON structure
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [aboutUs, setAboutUs] = useState(profile.aboutUs || '');
  const [servicesProvided, setServicesProvided] = useState<string[]>(profile.servicesProvided || []);
  const [address, setAddress] = useState(profile.address?.city || '');
  const [teamSize, setTeamSize] = useState(profile.teamSize?.toString() || '0');
  const [businessEmail, setBusinessEmail] = useState(profile.businessEmail || '');
  const [contactNumber, setContactNumber] = useState(profile.mobileNo || '');
  const [websiteLink, setWebsiteLink] = useState(profile.website || '');
  const [activeSince, setActiveSince] = useState(
    profile.activeSince ? new Date(profile.activeSince).getFullYear().toString() : ''
  );
  const [socialMedia, setSocialMedia] = useState({
    facebook: profile.socialMedia?.facebook || '',
    instagram: profile.socialMedia?.instagram || '',
    linkedin: profile.socialMedia?.linkedin || '',
    twitter: profile.socialMedia?.twitter || '',
    pinterest: profile.socialMedia?.pinterest || '',
  });
  const [certifications, setCertifications] = useState<string[]>(profile.certifications || ['']);
  const [awards, setAwards] = useState<string[]>(profile.awards || []);
  const [achievements, setAchievements] = useState<string[]>(profile.achievements || []);
  const [profilePic, setProfilePic] = useState(profile?.profilePic || '');
  const [gstNumber, setGstNumber] = useState(profile.GSTIN || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth || '');
  const [gender, setGender] = useState(profile.gender || '');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Modal states
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isClearProfilePicModalVisible, setIsClearProfilePicModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const genderOptions = ['Male', 'Female', 'Other'];

  const [selectedSocialMedia, setSelectedSocialMedia] = useState<'instagram' | 'pinterest' | 'facebook'>('instagram');

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1899 },
    (_, i) => ({
      value: (currentYear - i).toString(),
    })
  );

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleProfilePickerNew = async () => {
    try {
      const image = await ImagePicker?.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
        compressImageMaxWidth: 1000,
        compressImageMaxHeight: 1000,
        compressImageQuality: 1,
      });

      if (image) {
        const response = await fetch(image.path);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        const blob = await response.blob();

        const params = {
          Bucket: S3_BUCKET,
          Key: `users/${image.filename}`,
          Body: blob,
          ContentType: image.mime,
          ACL: 'public-read',
        };

        const data = await s3.upload(params).promise();
        setProfilePic(data.Location);
      }
    } catch (error: any) {
      if (error.message !== 'User cancelled image picker') {
        console.error('Error uploading file:', error);
        setErrorMessage('Failed to upload image. Please try again.');
        setErrorModalVisible(true);
      }
    }
  };

  const handleClearProfilePic = () => {
    setIsClearProfilePicModalVisible(true);
  };

  const handleClearProfilePicConfirm = () => {
    setProfilePic('');
    setIsClearProfilePicModalVisible(false);
  };

  const handleClearProfilePicCancel = () => {
    setIsClearProfilePicModalVisible(false);
  };

  const validateName = () => {
    if (!firstName.trim()) {
      setNameError('Name is required');
      return false;
    }

    // Check for specific invalid characters in name
    if (/[^a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(firstName)) {
      const invalidChars = firstName.match(/[^a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
      if (invalidChars) {
        setNameError(`Character${invalidChars.length > 1 ? 's' : ''} "${invalidChars.join('')}" ${invalidChars.length > 1 ? 'are' : 'is'} not allowed. Only letters, numbers, spaces, and special characters are allowed.`);
      }
      return false;
    }

    setNameError('');
    return true;
  };

  const validateUsername = () => {
    if (!username.trim()) {
      setUsernameError('Username is required');
      return false;
    }

    if (username.length < 4) {
      setUsernameError('Username must be longer than 4 characters');
      return false;
    }
    
    // Check for specific invalid characters
    if (username.includes(' ')) {
      setUsernameError('Spaces are not allowed in username');
      return false;
    }

    if (/[^a-zA-Z0-9._]/.test(username)) {
      const invalidChars = username.match(/[^a-zA-Z0-9._]/g);
      if (invalidChars) {
        setUsernameError(`Character${invalidChars.length > 1 ? 's' : ''} "${invalidChars.join('')}" ${invalidChars.length > 1 ? 'are' : 'is'} not allowed. Only letters, numbers, dots, and underscores are allowed.`);
      }
      return false;
    }

    setUsernameError('');
    return true;
  };

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  };

  const validateGST = (gst: string) => {
    // GST format: 2 digits, 10 characters (PAN), 1 digit (entity), 1 digit (Z by default), 1 digit (checksum)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const handleGSTChange = (text: string) => {
    // Convert to uppercase and remove spaces
    const formattedText = text.toUpperCase().replace(/\s/g, '');
    setGstNumber(formattedText);
    
    if (formattedText && !validateGST(formattedText)) {
      setGstError('Please enter a valid GST number');
    } else {
      setGstError('');
    }
  };

  const handleLocationSelect = (location: any) => {
    if (location && location.City) {
      setAddress(location.City);
      setLocationModalVisible(false);
      console.log('Selected location:', location.City);
    }
  };

  const handleDateConfirm = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setDateOfBirth(formattedDate);
    setDatePickerVisible(false);
  };

  const handleDateCancel = () => {
    setDatePickerVisible(false);
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSaveChanges = async () => {
    // Reset errors
    setNameError('');
    setUsernameError('');
    setGstError('');
    setActiveSinceError('');

    // Validate required fields
    if (!validateName()) return;
    if (!validateUsername()) return;

    // Validate email if provided
    if (businessEmail && !validateEmail(businessEmail)) {
      setErrorMessage('Please enter a valid email address');
      setErrorModalVisible(true);
      return;
    }

    // Validate phone number if provided
    if (contactNumber && !validatePhoneNumber(contactNumber)) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      setErrorModalVisible(true);
      return;
    }

    // Validate GST if provided
    if (gstNumber && !validateGST(gstNumber)) {
      setGstError('Please enter a valid GST number');
      return;
    }

    // Validate active since year
    if (activeSince) {
      const currentYear = new Date().getFullYear();
      const year = parseInt(activeSince, 10);
      if (isNaN(year) || year < 1900 || year > currentYear) {
        setActiveSinceError('Please enter a valid year between 1900 and current year');
        return;
      }
    }

    // Format the data according to backend requirements
    const finalData = {
      firstName,
      username,
      bio,
      aboutUs,
      GSTIN: gstNumber,
      servicesProvided: servicesProvided.filter(service => service.trim() !== ''),
      location: address,
      teamSize: parseInt(teamSize, 10) || 0,
      businessEmail,
      mobileNo: contactNumber,
      website: websiteLink,
      activeSince: activeSince ? `${activeSince}-01-01` : '',
      socialMedia: {
        facebook: socialMedia.facebook || '',
        instagram: socialMedia.instagram || '',
        linkedin: socialMedia.linkedin || '',
        twitter: socialMedia.twitter || '',
        pinterest: socialMedia.pinterest || '',
      },
      address: {
        line1: '',
        line2: '',
        city: address,
        state: '',
        pincode: ''
      },
      certifications: certifications[0] ? [certifications[0]] : [],
      profilePic,
      dateOfBirth,
      gender
    };

    console.log('Final data being sent:', finalData);

    try {
      const response = await put('user/update-user', finalData);
      console.log('API Response:', response);

      if (response.status === 200) {
        setSuccessMessage('Profile updated successfully');
        setSuccessModalVisible(true);
        setTimeout(() => {
          navigation.navigate('ProfileRewamp' as never);
        }, 1000);
      } else {
        setErrorMessage(response.message || 'Failed to update profile');
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error('Error saving:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setErrorModalVisible(true);
    }
  };

  const handleModalConfirm = () => {
    setIsModalVisible(false);
    navigation.navigate('ProfileRewamp' as never);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setIsModalVisible(true);
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const renderLocationItem = (location: string, index: number) => (
    <View key={index} style={styles.locationItem}>
      <Text style={styles.locationText}>{location}</Text>
      <TouchableOpacity>
        <Icon name="close" size={20} color={Color.black} />
      </TouchableOpacity>
    </View>
  );

  const renderEditableField = (
    label: string,
    value: string,
    field: string,
    placeholder: string = '',
  ) => {
    if (field === 'professionalCategory') {
      return (
        <View style={styles.section}>
          <Text style={styles.label}>{label}</Text>
          <TouchableOpacity
            style={[styles.card, styles.categoryCard]}
            onPress={() => navigation.navigate('MultiSelectCategory', {
              existingCategories: servicesProvided,
              fromProfile: true,
              onSaveCategories: async (categories: string[]) => {
                setServicesProvided(categories);
              }
            })}>
            <View style={styles.categoryContent}>
              <Image
                source={require('../../../../assets/icons/tagIcon.png')}
                style={[styles.categoryIcon, { tintColor: Color.black }]}
              />
              <Text style={[styles.cardText, styles.categoryText]}>
                {servicesProvided.length > 0 ? servicesProvided.join(', ') : 'Select Category'}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={Color.black} />
          </TouchableOpacity>
        </View>
      );
    }

    if (field === 'website') {
      return (
        <View style={styles.section}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.cardText}
              value={value}
              onChangeText={text => setWebsiteLink(text)}
              placeholder={placeholder}
            />
          </View>
        </View>
      );
    }

    if (field === 'mobileNo') {
      return (
        <View style={styles.section}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.card}>
            <View style={styles.locationContent}>
              <Image
                source={require('../../../../assets/icons/phoneIcon.png')}
                style={styles.locationIcon}
              />
              <TextInput
                style={styles.cardText}
                value={value}
                onChangeText={text => setContactNumber(text.replace(/\D/g, '').replace(/^91/, ''))}
                placeholder={placeholder}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>
      );
    }

    if (field === 'email') {
      return (
        <View style={styles.section}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.card}>
            <View style={styles.locationContent}>
              <Image
                source={require('../../../../assets/icons/mailIcon.png')}
                style={styles.locationIcon}
              />
              <TextInput
                style={styles.cardText}
                value={value}
                onChangeText={text => setBusinessEmail(text)}
                placeholder={placeholder}
                keyboardType="email-address"
              />
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderSocialMediaTabs = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.label}>Social Media</Text>
        <View style={styles.socialMediaTabs}>
          <TouchableOpacity 
            style={[styles.socialTab, selectedSocialMedia === 'instagram' && styles.selectedSocialTab]} 
            onPress={() => setSelectedSocialMedia('instagram')}
          >
            <Image 
              source={require('../../../../assets/icons/instagram.png')} 
              style={[styles.socialIcon, selectedSocialMedia === 'instagram' && styles.selectedSocialIcon]} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.socialTab, selectedSocialMedia === 'pinterest' && styles.selectedSocialTab]}
            onPress={() => setSelectedSocialMedia('pinterest')}
          >
            <Image 
              source={require('../../../../assets/icons/pinterest.png')} 
              style={[styles.socialIcon, selectedSocialMedia === 'pinterest' && styles.selectedSocialIcon]} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.socialTab, selectedSocialMedia === 'facebook' && styles.selectedSocialTab]}
            onPress={() => setSelectedSocialMedia('facebook')}
          >
            <Image 
              source={require('../../../../assets/icons/facebook.png')} 
              style={[styles.socialIcon, selectedSocialMedia === 'facebook' && styles.selectedSocialIcon]} 
            />
          </TouchableOpacity>
        </View>

        {selectedSocialMedia === 'instagram' && (
          <View style={styles.socialInputContainer}>
            <TextInput
              style={styles.socialInput}
              value={socialMedia.instagram}
              onChangeText={(text) => setSocialMedia(prev => ({...prev, instagram: text}))}
              placeholder="Enter Instagram Link"
              placeholderTextColor={Color.primarygrey}
            />
          </View>
        )}

        {selectedSocialMedia === 'pinterest' && (
          <View style={styles.socialInputContainer}>
            <TextInput
              style={styles.socialInput}
              value={socialMedia.pinterest || ''}
              onChangeText={(text) => setSocialMedia(prev => ({...prev, pinterest: text}))}
              placeholder="Enter Pinterest Link"
              placeholderTextColor={Color.primarygrey}
            />
          </View>
        )}

        {selectedSocialMedia === 'facebook' && (
          <View style={styles.socialInputContainer}>
            <TextInput
              style={styles.socialInput}
              value={socialMedia.facebook}
              onChangeText={(text) => setSocialMedia(prev => ({...prev, facebook: text}))}
              placeholder="Enter Facebook Link"
              placeholderTextColor={Color.primarygrey}
            />
          </View>
        )}
      </View>
    );
  };

  const renderAchievements = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.label}>Awards, Achievements & Certifications</Text>
        <View style={styles.achievementInputContainer}>
          <TextInput
            style={styles.achievementInput}
            value={certifications[0] || ''}
            onChangeText={(text) => {
              setCertifications([text]);
            }}
            placeholder="Enter certifications"
            placeholderTextColor={Color.primarygrey}
            multiline
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setIsModalVisible(true)}>
            <Image source={require('../../../../assets/header/backIcon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.backButton} />
      </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.keyboardView, isKeyboardVisible && styles.keyboardVisible]}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView 
            contentContainerStyle={[styles.scrollContent, isKeyboardVisible && styles.keyboardScrollContent]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            onTouchStart={() => Keyboard.dismiss()}>
            {/* Profile Image */}
            <View style={styles.profileImageContainer}>
              {profilePic ? (
                <View style={styles.profileImage}>
                  <Image
                    source={{uri: profilePic}}
                    style={styles.profilePicture}
                  />
                  {/* <TouchableOpacity
                    style={styles.editIconContainer}
                    onPress={handleProfilePicker}>
                    <Icon name="edit" size={16} color="#FFF" />
                  </TouchableOpacity> */}
                  <TouchableOpacity
                    style={styles.editIconContainer}
                    onPress={handleClearProfilePic}>
                    <Icon name="close" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.profileImage}
                  onPress={handleProfilePickerNew}>
                  <Icon name="person" size={40} color={Color.black} />
                  <View style={styles.editIconContainer}>
                    <Icon name="edit" size={16} color="#FFF" />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Category */}
            {profile.accountType !== 'personal' && (
              renderEditableField(
                'Category',
                servicesProvided.length > 0 ? servicesProvided.join(', ') : 'Select Category',
                'professionalCategory',
                'Select Category'
              )
            )}

            {/* Services Provided */}
            {/* {servicesProvided.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.label}>Services Provided</Text>
                <View style={styles.servicesContainer}>
                  {servicesProvided.map((service: string, index: number) => (
                    <View key={index} style={styles.serviceItem}>
                      <Text style={styles.serviceText}>{service}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )} */}

            {/* Name */}
            <CustomTextInput
              label="Name"
              value={firstName}
              placeholder="Enter Name"
              onChangeText={text => {
                setFirstName(text);
                validateName();
              }}
              error={nameError}
              placeholderTextColor={Color.primarygrey}
            />

            {/* Username */}
            <CustomTextInput
              label="Username"
              value={username}
              placeholder="Enter Username"
              onChangeText={text => {
                setUsername(text.toLowerCase());
                validateUsername();
              }}
              error={usernameError}
              autoCapitalize="none"
              placeholderTextColor={Color.primarygrey}
            />

            {/* Bio */}
            <CustomTextInput
              label="Bio"
              value={bio}
              placeholder="Enter Bio"
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              maxLength={135}
              style={styles.bioInput}
              rightText={`${135 - (bio?.length || 0)}`}
              placeholderTextColor={Color.primarygrey}
            />
            {/* Date of Birth */}
             <View style={styles.section}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity 
                style={styles.card}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={styles.cardText}>
                  {dateOfBirth ? formatDateForDisplay(dateOfBirth) : 'Select Date of Birth'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Gender */}
            <View style={styles.section}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                <CustomSingleSelect
                  label=""
                  placeholder="Select Gender"
                  data={genderOptions.map(option => ({ value: option, label: option }))}
                  selectedValue={gender ? { value: gender, label: gender } : null}
                  setSelectedValue={(item: { value: string, label: string } | null) => setGender(item?.value || '')}
                />
              </View>
            </View>

            {/* About Us */}
            {profile.accountType !== 'personal' && (
              <CustomTextInput
                label="About Us"
                value={aboutUs}
                placeholder="Enter About Us"
                onChangeText={setAboutUs}
              multiline
                numberOfLines={3}
                placeholderTextColor={Color.primarygrey}
              />
            )}

            {/* Location */}
            <LocationInput
              label="Location"
              value={address}
              iconImage={require('../../../../assets/settings/editProfile/city.png')}
              onPress={() => {
                setLocationModalVisible(true);
              }}
            />

            {/* Active Since */}
            {profile.accountType !== 'personal' && (
              <CustomSingleSelect
                label="Active Since"
                placeholder="Select year"
              data={yearOptions.map(year => ({ ...year, label: year.value }))}
                selectedValue={activeSince ? { value: activeSince, label: activeSince } : null}
                setSelectedValue={(item: { value: string, label: string } | null) => setActiveSince(item?.value || '')}
                error={activeSinceError}
                onFocus={() => setActiveSinceError('')}
              />
            )}

            {/* Team Size */}
            {profile.accountType !== 'personal' && (
            <CustomTextInput
              label="Team Size"
              value={teamSize}
                placeholder="Enter Team Size"
                onChangeText={text => setTeamSize(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholderTextColor={Color.primarygrey}
              />
            )}

            {/* Contact Number */}
            {profile.accountType !== 'personal' && (
              <CustomTextInput
              label="Contact Number"
              value={contactNumber}
              placeholder="Enter your 10-digit number"
              readOnly={true}
              onChangeText={text => setContactNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholderTextColor={Color.primarygrey}
              />
            )}

            {/* Business Email */}
            {profile.accountType !== 'personal' && (
              <CustomTextInput
                label="Business Email"
                value={businessEmail}
                placeholder="Enter your email"
                onChangeText={setBusinessEmail}
                keyboardType="email-address"
                placeholderTextColor={Color.primarygrey}
              />
            )}

            {/* Website Link */}
            {profile.accountType !== 'personal' && (
              <CustomTextInput
                label="Website Link"
                value={websiteLink}
                placeholder="Enter website URL"
                onChangeText={setWebsiteLink}
                placeholderTextColor={Color.primarygrey}
              />
            )}

            {/* Social Media */}
            {profile.accountType !== 'personal' && renderSocialMediaTabs()}

            {/* Replace Certifications, Awards, and Achievements sections with the new version */}
            {profile.accountType !== 'personal' && renderAchievements()}

            {/* GST Number */}
            {profile.accountType !== 'personal' && (
              <View style={styles.section}>
                <Text style={styles.label}>GSTIN</Text>
                <View style={[styles.card, gstError ? styles.errorInput : null]}>
                <TextInput
                  style={styles.cardText}
                  value={gstNumber}
                  onChangeText={handleGSTChange}
                  placeholder="Enter your 15-digit GST number"
                  placeholderTextColor={Color.primarygrey}
                  autoCapitalize="characters"
                  maxLength={15}
                />
                </View>
                {gstError ? <Text style={[styles.errorText, { fontSize: FontSizes.small }]}>{gstError}</Text> : null}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

      {/* Fixed Save Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      {/* Location Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelect={handleLocationSelect}
      />

      {/* Discard Changes Modal */}
      <CustomAlertModal
        visible={isModalVisible}
        title="Discard Changes"
        description="The changes will not be saved. Are you sure you want to discard these changes?"
        buttonOneText="Discard"
        buttonTwoText="Save Changes"
        onPressButton1={handleModalConfirm}
        onPressButton2={handleSaveChanges}
        onClose={() => setIsModalVisible(false)}
      />

      {/* Clear Profile Pic Modal */}
      <CustomAlertModal
        visible={isClearProfilePicModalVisible}
        title="Remove Profile Picture"
        description="Are you sure you want to remove your profile picture?"
        buttonOneText="Remove"
        buttonTwoText="Cancel"
        onPressButton1={handleClearProfilePicConfirm}
        onPressButton2={handleClearProfilePicCancel}
        onClose={() => setIsClearProfilePicModalVisible(false)}
      />

      {/* Error Modal */}
      <CustomAlertModal
        visible={errorModalVisible}
        title="Error"
        description={errorMessage}
        buttonOneText="OK"
        onPressButton1={() => setErrorModalVisible(false)}
        onClose={() => setErrorModalVisible(false)}
      />

      {/* Success Modal */}
      <CustomAlertModal
        visible={successModalVisible}
        title="Success"
        description={successMessage}
        buttonOneText="OK"
        onPressButton1={() => setSuccessModalVisible(false)}
        onClose={() => setSuccessModalVisible(false)}
      />

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={handleDateCancel}
        maximumDate={new Date()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Color.secondarygrey,
  },
  headerTitle: {
    fontSize: 18,
    color: Color.black,
    fontFamily: FontFamilies.semibold,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  keyboardView: {
    flex: 1,
  },
  keyboardVisible: {
    paddingBottom: 120,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  keyboardScrollContent: {
    paddingBottom: 100,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Color.secondarygrey,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Color.black,
    borderRadius: 24,
    padding: 6,
  },
  cancelIconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Color.black,
    borderRadius: 24,
    padding: 6,
  },
  label: {
    fontSize: FontSizes.medium,
    color: Color.black,
    marginBottom: 8,
    fontWeight: '800',
    fontFamily: FontFamilies.semibold,
    lineHeight:LineHeights.small,
  },
  hintText: {
    color: Color.primarygrey,
    fontSize: 10,
    marginLeft: 5,
    marginTop: -15,
    marginBottom: 10,
  },
  bioInput: {
    height: 100,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.secondarygrey,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationButtonText: {
    marginLeft: 8,
    color: Color.black,
    fontFamily: FontFamilies.regular,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Color.secondarygrey,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationText: {
    color: Color.black,
    fontFamily: FontFamilies.regular,
  },
  socialMediaSection: {
    marginVertical: 16,
  },
  socialMediaContainer: {
    gap: 12,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Color.secondarygrey,
  },
  saveButton: {
    backgroundColor: Color.black,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Color.white,
    fontSize: 16,
    fontFamily: FontFamilies.semibold,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 15,
    borderRadius: 12,
    minHeight: 46,
  },
  cardText: {
    flex: 1,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: '#1E1E1E',
    letterSpacing: LetterSpacings.wide,
    lineHeight: LineHeights.small,
  },
  categoryCard: {
    backgroundColor: '#F3F3F3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  categoryText: {
    color: Color.black,
    flex: 1,
  },
  locationInputContainer: {
    backgroundColor: Color.secondarygrey,
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 16,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  serviceItem: {
    backgroundColor: Color.secondarygrey,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceText: {
    color: Color.black,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
  },
  socialMediaTabs: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  socialTab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Color.primarygrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSocialTab: {
    backgroundColor: Color.black,
  },
  socialIcon: {
    width: 24,
    height: 24,
    tintColor: Color.white,
  },
  selectedSocialIcon: {
    tintColor: Color.white,
  },
  socialInputContainer: {
    backgroundColor: Color.secondarygrey,
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 16,
  },
  socialInput: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: Color.black,
  },
  achievementInputContainer: {
    backgroundColor: Color.secondarygrey,
    borderRadius: 12,
    padding: 16,
  },
  achievementInput: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: Color.black,
    minHeight: 40,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.white,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 4,
  },
  chipText: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: Color.black,
  },
  chipRemove: {
    padding: 2,
  },
  errorInput: {
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    marginTop: 4,
    fontFamily: FontFamilies.regular,
  },
  genderContainer: {
    backgroundColor: Color.secondarygrey,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  genderSelectContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 12,
  },
  genderDropdown: {
    backgroundColor: Color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Color.secondarygrey,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default EditProfileRewamped;