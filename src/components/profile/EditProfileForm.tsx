import React, {useState, useContext, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ScrollView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useRoute, useNavigation} from '@react-navigation/native';
import cityData from '../datasets/citydata';
import {ProfileContext} from '../../context/ProfileContext';
import {SafeAreaView} from 'react-native-safe-area-context';
import ImagePicker from 'react-native-image-crop-picker';
import AWS from 'aws-sdk';
import { Color, FontFamilies } from '../../styles/constants';
import { getInitials } from '../../utils/commonFunctions';
import CustomAlertModal from '../commons/customAlert';
import { post } from '../../services/dataRequest';
import { debounce } from 'lodash';

const defaultAvatar = require('../../assets/profile/defaultAvatar.png');

const genderOptions = ['Male', 'Female', 'Other'];
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

const locationOptions = [
  'Arunachal Pradesh',
  'Assam',
  'Ahemadnagar',
  'Bihar',
  'Chandigarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const EditProfileForm = ({route}: any) => {
  const {initial} = route.params;
  const navigation = useNavigation();
  const {updateProfile} = useContext(ProfileContext);
  const [profilePic, setProfilePic] = useState(initial.profilePic || '');
  const [name, setName] = useState(initial.name || '');
  const [username, setUsername] = useState(initial.username || '');
  const [tempUsername, setTempUsername] = useState(initial.username || '');
  const [previousUsername, setPreviousUsername] = useState(initial.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [bio, setBio] = useState(initial.bio || '');
  const [gender, setGender] = useState(initial.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(initial.dateOfBirth || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [city, setCity] = useState(initial.city || '');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [contactNumber] = useState(initial.contactNumber || 'XXXXXXXXXX');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDiscardChanges, setIsDiscardChanges] = useState(false);

  const handleBack = () => {
    setIsModalVisible(true);
  };

  const handleModalConfirm = () => {
    setIsModalVisible(false);
    navigation.goBack();
  };

  const handleSaveChanges = () => {
    setIsModalVisible(false);
    handleSave();
  };

  // Add username validation function
  const validateUsername = async (username: string) => {
    // Skip validation if username is unchanged and not empty
    if (username === previousUsername && username.trim() !== '') {
      console.log('Skipping validation - username unchanged:', username);
      return true;
    }

    setUsernameError('');
    
    // Basic validation
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
      setUsernameError(`Character${invalidChars?.length > 1 ? 's' : ''} "${invalidChars?.join('')}" ${invalidChars?.length > 1 ? 'are' : 'is'} not allowed. Only letters, numbers, dots, and underscores are allowed.`);
      return false;
    }

    // Check username availability
    try {
      setIsCheckingUsername(true);
      const usernameResponse = await post('user/username-available', {
        username: username.toLowerCase(),
      });

      if (!usernameResponse.available) {
        setUsernameError(usernameResponse.message || 'Username is not available');
        return false;
      }
      // Update previous username when validation succeeds
      setPreviousUsername(username);
      console.log('Username validation successful, updated previousUsername:', username);
      return true;
    } catch (error) {
      console.error('Error checking username availability:', error);
      setUsernameError('Error checking username availability');
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Add effect to update previousUsername when initial username changes
  useEffect(() => {
    if (initial.username) {
      setPreviousUsername(initial.username);
    }
  }, [initial.username]);

  // Add debounced username check
  const debouncedUsernameCheck = useCallback(
    debounce(async (value: string) => {
      if (value && value.length >= 4) {
        await validateUsername(value);
      }
    }, 500),
    []
  );

  const handleSave = async () => {
    // Validate username first
    const isUsernameValid = await validateUsername(tempUsername);
    if (!isUsernameValid) {
      return; // Stop if username validation fails
    }

    // Set the username state if validation passes
    setUsername(tempUsername);

    try {
      setIsLoading(true);
      setError('');

      const profileData = {
        firstName: name,
        username: tempUsername, // Use tempUsername here since we just validated it
        bio: bio,
        gender: gender,
        dateOfBirth: dateOfBirth,
        profilePic: profilePic,
        address: {
          city: city,
        },
        mobileNo: contactNumber,
      };

      const result = await updateProfile(profileData);
      console.log('updateProfile result', result);

      if (result.success) {
        navigation.goBack();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleProfilePicker = async () => {
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
      console.log('error', error);
    }
  };

  const handleRemoveProfilePic = () => {
    setShowCustomAlert(true);
  };

  const handleRemoveProfilePicConfirm = () => {
    setProfilePic('');
    setShowCustomAlert(false);
  };

  const renderLocationItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      key={`${item.City}-${item.State}-${index}`}
      style={[
        styles.locationOption,
        city === item.City && styles.locationOptionSelected,
        index === cityData.length - 1 && {borderBottomWidth: 0},
      ]}
      onPress={() => {
        setCity(item.City);
        setShowLocationDropdown(false);
        setLocationSearch('');
      }}
      activeOpacity={0.7}>
      <Text
        style={[
          styles.locationOptionText,
          city === item.City && styles.locationOptionTextSelected,
        ]}>
        {item.City}, {item.State}
      </Text>
    </TouchableOpacity>
  );

  const filteredLocations = cityData.filter(l =>
    l.City.toLowerCase().includes(locationSearch.toLowerCase()),
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fff',
      }}>
      <View style={styles.outer}>
        {/* Figma Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.headerBackBtn}>
            <Icon name="arrow-back-ios" size={20} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={[
              styles.headerSaveBtn,
              isLoading && styles.headerSaveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={isLoading}>
            <Text style={styles.headerSaveText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null} */}
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          {/* Profile Picture */}
          <View style={styles.profilePicWrapper}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profilePic} />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>{getInitials(username)}</Text>
              </View>
            )}
            {!profilePic && (
              <TouchableOpacity style={styles.editPicBtn} onPress={handleProfilePicker}>
                <Icon name="mode" size={18} color="#FFF" />
              </TouchableOpacity>
            )}
            {profilePic && (
              <TouchableOpacity 
                style={[styles.editPicBtn]} 
                onPress={handleRemoveProfilePic}
              >
                <Icon name="close" size={18} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <View style={styles.nameInputWrapper}>
            <Image
              source={require('../../assets/profile/editProfile/nameIcon.png')}
              style={{width: 20, height: 20}}
            />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="#888"
            />
          </View>
          {/* Username (now editable) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[
                styles.input,
                usernameError ? styles.inputError : null,
                isCheckingUsername ? styles.inputChecking : null,
              ]}
              value={tempUsername}
              onChangeText={(text) => {
                const lower = text.toLowerCase();
                setTempUsername(lower);
                setUsernameError('');
                debouncedUsernameCheck(lower);
              }}
              placeholder="Username"
              placeholderTextColor="#888"
            />
            {usernameError ? (
              <Text style={styles.helperText}>{usernameError}</Text>
            ) : (
              <Text style={styles.helperText}>Use letters, numbers, dots, and underscores. Minimum 4 characters.</Text>
            )}
          </View>
          {/* Bio */}
          <Text style={styles.label}>Bio</Text>
          <View style={styles.bioInputWrapper}>
            <TextInput
              style={styles.inputBio}
              value={bio}
              onChangeText={text => text.length <= 135 && setBio(text)}
              placeholder="Enter Bio"
              placeholderTextColor="#888"
              multiline
              maxLength={135}
            />
            <Text style={styles.bioCharCount}>{135 - bio.length}</Text>
          </View>
          {/* Gender Field (always visible options) */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderOptionsBox}>
            {genderOptions.map((option, idx) => (
              <React.Fragment key={option}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === option && styles.genderOptionSelected,
                  ]}
                  onPress={() => setGender(option)}>
                  <Text
                    style={[
                      styles.genderOptionText,
                      gender === option && styles.genderOptionTextSelected,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
                {idx !== genderOptions.length - 1 && (
                  <View style={styles.genderDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
          {/* Date of Birth */}
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}>
            <Text style={{color: dateOfBirth ? '#222' : '#888'}}>
              {dateOfBirth ? formatDate(dateOfBirth) : 'DD/MM/YYYY'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setDateOfBirth(date.toISOString());
              }}
              maximumDate={new Date()}
            />
          )}
          {/* City (Location Dropdown) */}
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationDropdownWrapper}>
            <TouchableOpacity
              style={styles.locationDropdownBtn}
              onPress={() => setShowLocationDropdown(!showLocationDropdown)}
              activeOpacity={0.8}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={require('../../assets/profile/editProfile/locationIcon.png')}
                  style={{width: 20, height: 20, marginRight: 10}}
                />
                <Text
                  style={[
                    styles.locationDropdownText,
                    !city && {color: '#888'},
                  ]}>
                  {city || 'Select Location'}
                </Text>
              </View>
              <Icon
                name={
                  showLocationDropdown
                    ? 'keyboard-arrow-up'
                    : 'keyboard-arrow-down'
                }
                size={22}
                color="#222"
              />
            </TouchableOpacity>
            {showLocationDropdown && (
              <View style={styles.locationDropdownBox}>
                <View style={styles.locationSearchBarWrapper}>
                  <Image
                    source={require('../../assets/profile/editProfile/searchIcon.png')}
                    style={{width: 20, height: 20, marginRight: 10}}
                  />
                  <TextInput
                    style={styles.locationSearchInput}
                    placeholder="Search"
                    placeholderTextColor="#888"
                    value={locationSearch}
                    onChangeText={setLocationSearch}
                  />
                </View>
                <FlatList
                  data={filteredLocations}
                  renderItem={renderLocationItem}
                  keyExtractor={(item, index) => `${item.City}-${item.State}-${index}`}
                  style={styles.locationScrollView}
                  contentContainerStyle={{flexGrow: 1}}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                />
              </View>
            )}
          </View>
          {/* Contact Number */}
          <Text style={styles.label}>Contact Number</Text>
          <View style={styles.contactNumberBox}>
            <Image
              source={require('../../assets/profile/editProfile/phoneIcon.png')}
              style={{width: 20, height: 20, marginRight: 10}}
            />
            <Text style={styles.contactNumberText}>{contactNumber}</Text>
          </View>
        </ScrollView>
      </View>
      <CustomAlertModal
        visible={showCustomAlert}
        onClose={() => setShowCustomAlert(false)}
        title="Remove Profile Picture"
        description="Are you sure you want to remove your profile picture?"
        buttonOneText="Remove"
        buttonTwoText="Cancel"
        onPressButton1={handleRemoveProfilePicConfirm}
        onPressButton2={() => setShowCustomAlert(false)}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFF',
  },
  headerBackBtn: {
    padding: 6,
    borderRadius: 20,
    width:100
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FontFamilies.bold,
    color: Color.black,
    flex: 1,
    textAlign: 'center',
    marginLeft: -32, // visually center title between back and save
  },
  headerSaveBtn: {
    backgroundColor: Color.black,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  headerSaveBtnDisabled: {
    backgroundColor: Color.primarygrey,
  },
  headerSaveText: {
    color: Color.white,
    fontWeight: '600',
    fontSize: 15,
    fontFamily: FontFamilies.bold,
  },
  container: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  profilePicWrapper: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Color.secondarygrey,
  },
  editPicBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Color.black,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    color: Color.black,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  nameInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.secondarygrey,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Color.secondarygrey,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  inputReadOnly: {
    color: '#AAA',
  },
  bioInputWrapper: {
    position: 'relative',
    backgroundColor: Color.secondarygrey,
    borderRadius: 16,
    minHeight: 80,
    marginBottom: 10,
    justifyContent: 'flex-end',
  },
  inputBio: {
    minHeight: 80,
    padding: 16,
    paddingBottom: 28,
    fontSize: 15,
    fontFamily: FontFamilies.regular,
    color: Color.black,
    backgroundColor: 'transparent',
    borderRadius: 16,
    textAlignVertical: 'top',
  },
  bioCharCount: {
    position: 'absolute',
    right: 16,
    bottom: 10,
    color: '#888',
    fontSize: 13,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  genderOptionsBox: {
    backgroundColor: Color.secondarygrey,
    borderRadius: 14,
    overflow: 'hidden',
    paddingTop: 4,
    paddingBottom: 4,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  genderOptionSelected: {
    backgroundColor: Color.white,
    borderRadius: 14,
    marginHorizontal: 6,
    marginVertical: 2,
  },
  genderOptionText: {
    fontSize: 15,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  genderOptionTextSelected: {
    fontWeight: '700',
    fontSize: 15,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  genderDivider: {
    height: 1,
    backgroundColor: Color.white,
    marginHorizontal: 0,
    width: '90%',
    alignSelf: 'center',
  },
  locationDropdownWrapper: {
    marginBottom: 10,
    overflow: 'visible',
  },
  locationDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.secondarygrey,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  locationDropdownText: {
    fontSize: 15,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  locationDropdownBox: {
    backgroundColor: Color.secondarygrey,
    borderRadius: 16,
    marginTop: 6,
    paddingBottom: 4,
    maxHeight: 260,
    overflow: 'hidden',
  },
  locationSearchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.white,
    borderRadius: 12,
    margin: 10,
    marginBottom: 4,
    paddingHorizontal: 8,
    height: 38,
  },
  locationSearchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FontFamilies.regular,
    color: Color.black,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  locationOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Color.secondarygrey,
    backgroundColor: 'transparent',
  },
  locationOptionSelected: {
    backgroundColor: Color.white,
    borderRadius: 12,
  },
  locationOptionText: {
    fontSize: 15,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  locationOptionTextSelected: {
    fontWeight: '700',
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  locationScrollView: {
    maxHeight: 260,
  },
  contactNumberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.secondarygrey,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 2,
    marginBottom: 10,
  },
  contactNumberText: {
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  errorContainer: {
    backgroundColor: Color.black,
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: Color.white,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: FontFamilies.regular,
  },
  initialsAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Color.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 40,
    fontFamily: FontFamilies.regular,
    color: Color.white,
    textAlign: 'center',
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#ED4956',
  },
  inputChecking: {
    borderColor: Color.black,
  },
  helperText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    fontFamily: FontFamilies.regular,
  },
});

export default EditProfileForm;
