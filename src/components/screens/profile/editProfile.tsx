/* eslint-disable prettier/prettier */
import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  BackHandler,
  Modal,
} from 'react-native';
import {put} from '../../../services/dataRequest';
import DocumentPicker from 'react-native-document-picker';
import AWS from 'aws-sdk';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Make sure to install this package
import CustomTextInput from './businessProfile/customTextInput';
import { useFocusEffect } from '@react-navigation/native';
import CustomAlertModal from '../../commons/customAlert';
import {launchImageLibrary} from 'react-native-image-picker';
import { Color, FontFamilies } from '../../../styles/constants';

const ProfileEditPage = ({route, navigation}: any) => {
  const profile = route.params;
  console.log('profile :', route.params);
  const [formData, setFormData] = useState({
    ...profile,
    gender: profile.gender || ''
  });
  const [previewPic, setPreviewPic] = useState(profile.profilePic || null);
  const [isFilePickerClicked, setIsFilePickerClicked] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [fullName, setFullName] = useState(`${profile.firstName || ''} ${profile.lastName || ''}`.trim());
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const genderOptions = ['Male', 'Female', 'Other'];

  const handleChange = (key: any, value: any) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleNameChange = (text: string) => {
    setFullName(text);
    const names = text.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ');
    
    // Update the formData with new firstName and lastName
    setFormData(prev => ({
      ...prev,
      firstName: firstName,
      lastName: lastName
    }));
  };

  const transformData = data => {
    const {
      firstName,
      lastName,
      businessName,
      bio,
      address,
      dateOfBirth,
      profilePic,
      gender,
    } = data;

    return {
      firstName: firstName || '',
      lastName: lastName || '',
      businessName: businessName || '',
      bio: bio || '',
      profilePic: profilePic || '',
      gender: gender || '',
      address: {
        line1: address?.line1 || '',
        line2: address?.line2 || '',
        city: address?.city || '',
        state: address?.state || '',
        pincode: address?.pincode || '',
      },
      dateOfBirth: dateOfBirth || '',
    };
  };

  const submitProfileData = async () => {
    try {
      let finalData;
      if (isFilePickerClicked && previewPic !== formData.profilePic) {
        finalData = transformData({...formData, profilePic: previewPic});
      } else {
        finalData = transformData({...formData});
      }
      console.log('finalData along with changes :', finalData);
      const response = await put('user/update-user', finalData);

      if (response.status === 200) {
        navigation.navigate('ProfileRewamp');
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        const errorData = await response.json();
        console.error('Error Response: ', errorData);
        Alert.alert('Error', errorData.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Error: ', error);
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  const S3_BUCKET = 'csappproduction-storage';
  const REGION = 'ap-south-1';
  const ACCESS_KEY = 'AKIAU6GDZYODGHPEKSGW';
  const SECRET_KEY = '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';

  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
  });

  const s3 = new AWS.S3();

  const uploadFiles = async () => {
    try {
      // Launch the image library
      const res = await new Promise((resolve, reject) => {
        launchImageLibrary(
          {
            mediaType: 'photo',
            selectionLimit: 1, // You can adjust this if you need multiple images
            includeBase64: false,
          },
          response => {
            if (response.didCancel) {
              reject('User cancelled image picker');
            } else if (response.errorCode) {
              reject(`Image Picker Error: ${response.errorMessage}`);
            } else {
              resolve(response.assets);
            }
          },
        );
      });

      if (res && res.length > 0) {
        const {uri, fileName, type} = res[0];

        // Fetch the file using its URI
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        const blob = await response.blob();

        const params = {
          Bucket: S3_BUCKET,
          Key: `users/${fileName}`,
          Body: blob,
          ContentType: type,
          ACL: 'public-read',
        };

        // Upload to S3
        const data = await s3.upload(params).promise();
        setPreviewPic(data.Location);
        setIsFilePickerClicked(true);
        return data.Location;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleConfirm = date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of day for accurate comparison
    if (date > today) {
      Alert.alert('Invalid Date', 'Please select a date that is not in the future');
      return;
    }
    setDatePickerVisibility(false);
    handleChange('dateOfBirth', date.toISOString().split('T')[0]); // Format date as YYYY-MM-DD
  };

  const {username, address, dateOfBirth, accountType} = formData;

  console.log('preview :', previewPic);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleModalConfirm = async () => {
    setModalVisible(false);
    navigation.navigate('Profile' as never);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setModalVisible(true); // Show the custom alert modal
        return true; // Prevent default back behavior
      };
      // Add event listener for hardware back press
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      // Clean up the event listener when the screen is unfocused
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
    style={styles.main}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}>
    <ScrollView showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          {previewPic ? (
            <View style={styles.profilePlaceholder}>
              <Image source={{uri: previewPic}} style={styles.profileImage} />
              <TouchableOpacity
                style={styles.profileMode}
                onPress={() => {
                  uploadFiles();
                }}>
                <Icon name="mode" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profilePlaceholder}>
              <Icon name="perm-identity" size={40} />
              <TouchableOpacity
                style={styles.profileMode}
                onPress={() => {
                  uploadFiles();
                }}>
                <Icon name="mode" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
          <CustomTextInput
            label="Name"
            value={fullName}
            onChangeText={handleNameChange}
            // iconName="account"
            iconImage={require('../../../assets/settings/editProfile/account.png')}
            placeholder="Enter name"
          />
          <CustomTextInput
            label="Username"
            value={username}
            onChangeText={(text: any) => handleChange('username', text)}
            // iconName="account"
            readOnly
            placeholder="ex. abc@123"
            hintText="Username cannot be changed"
          />
          <Text style={styles.hintText}>Username can't be changed</Text>
          {/* <CustomTextInput
            label="First Name"
            value={formData.firstName}
            onChangeText={(text: any) => handleChange('firstName', text)}
            iconName="unt"
            placeholder="Enter your first name"
                   <CustomTextInput
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text: any) => handleChange('lastName', text)}
            iconName="account"
            placeholder="Enter your last name"
          /> */}
          <View style={styles.bioInputContainer}>
            <CustomTextInput
              label="Bio"
              value={formData.bio}
              placeholder="Enter Bio"
              onChangeText={(text: any) => {
                if (text.length <= 135) {
                  handleChange('bio', text);
                }
              }}
              // iconName="information"
              multiline={true}
              numberOfLines={4}
              maxLength={135}
              style={styles.bioInput}
              rightText={`${135 - (formData.bio?.length || 0)}`}
            />
            {/* <Text style={styles.characterCount}>
              {`${formData.bio?.length || 0}/150`}
            </Text> */}
          </View>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Gender</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              value={formData.gender}
              onPress={() => setShowGenderDropdown(true)}
            >
              <Text style={[
                styles.dropdownText,
                !formData.gender && { color: '#666' }
              ]}>
                {formData.gender || 'Select Gender'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Modal
            visible={showGenderDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowGenderDropdown(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowGenderDropdown(false)}
            >
              <View style={styles.modalContent}>
                {genderOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      formData.gender === option && styles.selectedOption,
                      index === genderOptions.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => {
                      handleChange('gender', option);
                      setShowGenderDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.gender === option && { fontFamily: FontFamilies.semibold }
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
          {/* <CustomTextInput
            label="Address Line 1"
            value={address.line1}
            onChangeText={(text: any) =>
              handleChange('address', {...address, line1: text})
            }
            iconName="home"
            placeholder="Enter address line 1"
          />
          <CustomTextInput
            label="Address Line 2"
            value={address.line2}
            onChangeText={(text: any) =>
              handleChange('address', {...address, line2: text})
            }
            iconName="home"
            placeholder="Enter address line 2"
          /> */}
          <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
            <CustomTextInput
              placeholder="DD/MM/YYYY"
              label="Date of Birth"
              value={dateOfBirth}
              iconImage={require('../../../assets/settings/editProfile/calender.png')}
              readOnly
              onChangeText={() => {}}
            />
          </TouchableOpacity>
          <CustomTextInput
            label="Location"
            value={address.city}
            onChangeText={(text: any) =>
              handleChange('address', {...address, city: text})
            }
            // iconName="city"
            iconImage={require('../../../assets/settings/editProfile/city.png')}
            placeholder="Enter city"
          />
          {/* <CustomTextInput
            label="State"
            value={address.state}
            onChangeText={(text: any) =>
              handleChange('address', {...address, state: text})
            }
            iconName="map-marker"
            placeholder="Enter your state"
          /> */}
          {/* <CustomTextInput
            label="Pincode"
            value={address.pincode}
            onChangeText={(text: any) =>
              handleChange('address', {...address, pincode: text})
            }
            iconName="numeric"
            keyboardType="numeric"
            placeholder="Enter your pincode"
          /> */}
          {/* <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
            <CustomTextInput
              placeholder="Enter your DOB"
              label="Date of Birth"
              value={dateOfBirth}
              readOnly
              iconName="calendar"
            />
          </TouchableOpacity> */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={() => setDatePickerVisibility(false)}
            maximumDate={new Date()}
          />
          <TouchableOpacity style={styles.button} onPress={submitProfileData}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
        {isModalVisible && (
        <CustomAlertModal
          visible={isModalVisible}
          title="Discard Changes"
          description="The changes will not be saved. Are you sure you want to discard these changes?"
          buttonOneText="Discard"
          buttonTwoText="Save Changes"
          onPressButton1={handleModalConfirm}
          onPressButton2={submitProfileData}
        />
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  main: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    padding: 15,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    paddingVertical: 10,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '400',
    color: 'white',
    fontFamily: FontFamilies.semibold,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileImageText: {
    color: '#757575',
    textAlign: 'center',
  },
  profilePlaceholder: {
    marginHorizontal: 'auto',
    marginVertical: 20,
    marginBottom: 30,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMode: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 5,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: '#1D1919',
  },
  bioInputContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
    paddingRight: 45,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: FontFamilies.regular,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: Color.secondarygrey,
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: Color.black,
    fontFamily: FontFamilies.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  optionButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    fontFamily: FontFamilies.regular,
  },
  selectedOption: {
    backgroundColor: '#F5F5F5',
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
    fontFamily: FontFamilies.medium,
  },
  hintText: {
    color: Color.primarygrey,
    fontSize: 10,
    marginLeft: 5,
    marginTop: -15,
    marginBottom: 10,
  },
});

export default ProfileEditPage;
