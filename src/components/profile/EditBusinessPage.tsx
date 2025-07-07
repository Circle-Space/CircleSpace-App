import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, FlatList,SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InstagramIcon from '../../assets/profile/businessPage/instagram.png';
import PinterestIcon from '../../assets/profile/businessPage/pinterest.png';
import FacebookIcon from '../../assets/profile/businessPage/facebook.png';
import WebIcon from '../../assets/profile/businessPage/web.png';
import VideoIcon from '../../assets/profile/editProfile/videoIcon.png';
import ArrowRightIcon from '../../assets/profile/editProfile/arrowRightIcon.png';
import { ProfileContext } from '../../context/ProfileContext';
import cityData from '../datasets/citydata';
import AWS from 'aws-sdk';
import ImagePicker from 'react-native-image-crop-picker';
import { getInitials } from '../../utils/commonFunctions';
import { Color, FontFamilies } from '../../styles/constants';
import CustomAlertModal from '../commons/customAlert';
import { post } from '../../services/dataRequest';
import { debounce } from 'lodash';
// import { SafeAreaView } from 'react-native-safe-area-context';

const defaultAvatar = require('../../assets/profile/defaultAvatar.png');

// AWS Configuration
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

const categoryOptions = [
  'Architecture',
  'Interior Design',
  'Photography',
  'Publications',
  'Solar Panels',
  'Curtains',
  'Vastu',
  'Home Automation',
  'Electricals',
  'Gardening and Landscaping',
  'Flooring',
  'CCTV & Security Systems',
  'Furniture',
  'Painting',
  'Sanitary fixtures',
  'Theatre and Acoustics',
  'Packers and Movers',
  'Stones and Marbles',
  'Modular Kitchen & Wardrobes',
  'Lighting',
  'Carpets & Rugs',
  'Modular Kitchen & Wardrobes',
  'Other',
];


const EditBusinessPage = ({ route, navigation }: any) => {
  const { initial } = route.params;
  console.log("initial", initial);
  const { updateProfile } = useContext(ProfileContext);
  const [profilePic, setProfilePic] = useState(initial.profilePic || '');
  const [name, setName] = useState(initial.name || '');
  const [username, setUsername] = useState(initial.username || '');
  const [category, setCategory] = useState(initial.category || '');
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [gstin, setGstin] = useState(initial.gstin || '');
  const [gstinError, setGstinError] = useState('');
  const [location, setLocation] = useState(initial.city || '');
  const [locationDropdown, setLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [bio, setBio] = useState(initial.bio || '');
  const [aboutUs, setAboutUs] = useState(initial.aboutUs || '');
  const [activeSince, setActiveSince] = useState(initial.activeSince || '');
  const [activeSinceDropdown, setActiveSinceDropdown] = useState(false);
  const [activeSinceSearch, setActiveSinceSearch] = useState('');
  const [selectedSocial, setSelectedSocial] = useState('instagram');
  const [socialLinks, setSocialLinks] = useState({
    instagram: initial.socialMedia?.instagram || '',
    pinterest: initial.socialMedia?.pinterest || '',
    facebook: initial.socialMedia?.facebook || '',
    web: initial.socialMedia?.website || '',
  });
  const [website, setWebsite] = useState(initial.website || '');
  const [city, setCity] = useState(initial.city || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(initial.username || '');
  const [previousUsername, setPreviousUsername] = useState<string>(initial.username || '');
  const [socialLinkErrors, setSocialLinkErrors] = useState({
    instagram: '',
    pinterest: '',
    facebook: '',
    web: '',
  });
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationAlertMsg, setValidationAlertMsg] = useState('');
  // Memoize filtered locations
  const filteredLocations = useMemo(() => {
    return cityData.filter(l => 
      l.City.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [locationSearch]);

  const renderLocationItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      key={item.City}
      style={[
        styles.dropdownOption,
        location === item.City && styles.dropdownOptionSelected,
        index === filteredLocations.length - 1 && { borderBottomWidth: 0 },
      ]}
      onPress={() => {
        setLocation(item.City);
        setCity(item.City);
        setLocationDropdown(false);
        setLocationSearch('');
      }}
    >
      <Text style={[styles.dropdownOptionText, location === item.City && styles.dropdownOptionTextSelected]}>
        {item.City}, {item.State}
      </Text>
    </TouchableOpacity>
  );

  const handleModalConfirm = () => {
    setIsModalVisible(false);
    navigation.goBack();
  };

  const handleSaveChanges = () => {
    setIsModalVisible(false);
    handleSave();
  };

  const handleSave = async () => {
    let validationMessages: string[] = [];

    // Validate username first
    const isUsernameValid = await validateUsername(tempUsername);
    if (!isUsernameValid) {
      validationMessages.push(usernameError || 'Invalid username.');
    }
    // GSTIN validation
    if (gstin && !validateGSTIN(gstin)) {
      setGstinError('Please enter a valid GSTIN');
      validationMessages.push('Please enter a valid GSTIN.');
    } else {
      setGstinError('');
    }
    // Set the username state if validation passes
    setUsername(tempUsername);

    // Check social link errors
    const socialLinkErrorEntries = Object.entries(socialLinkErrors).filter(([_, error]) => error);
    if (socialLinkErrorEntries.length > 0) {
      socialLinkErrorEntries.forEach(([key, error]) => {
        if (error) validationMessages.push(error);
      });
    }

    if (validationMessages.length > 0) {
      setValidationAlertMsg(validationMessages.join('\n'));
      setShowValidationAlert(true);
      return;
    }

    // Rest of your existing save logic
    try {
      setIsLoading(true);
      setError('');

      const profileData = {
        businessName: name,
        username: tempUsername, // Use tempUsername here since we just validated it
        bio: bio,
        aboutUs: aboutUs,
        GSTIN: gstin,
        location: location,
        activeSince: activeSince,
        profilePic: profilePic,
        socialMedia: {
          instagram: socialLinks.instagram,
          pinterest: socialLinks.pinterest,
          facebook: socialLinks.facebook,
          website: socialLinks.web
        },
        website: website,
        address: {
          city: city,
        },
        professionalType: category,
      };
      console.log("profileData", profileData);

      const result = await updateProfile(profileData);
      console.log("updateProfile result", result);
      
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
      if (error.message !== 'User cancelled image picker') {
        console.error('Error uploading file:', error);
        setError('Failed to upload image. Please try again.');
      }
    }
  };

  const handleRemoveProfilePic = () => {
    setShowCustomAlert(true);
  };

  const handleRemoveProfilePicConfirm = () => {
    setProfilePic('');
    setShowCustomAlert(false);
  };

  const filteredCategories = categoryOptions.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));

  // Generate years for dropdown (e.g., 2025 to 2000)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear + 0 - i).toString());
  const filteredYears = years.filter(y => y.includes(activeSinceSearch));
  console.log("filteredYears", filteredYears);

  const socialIcons = [
    { id: 'instagram', icon: InstagramIcon, placeholder: 'Instagram Link' },
    { id: 'pinterest', icon: PinterestIcon, placeholder: 'Pinterest Link' },
    { id: 'facebook', icon: FacebookIcon, placeholder: 'Facebook Link' },
    { id: 'web', icon: WebIcon, placeholder: 'Website Link' },
  ];

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

  // GSTIN validation function
  const validateGSTIN = (gst: string) => {
    // GST format: 2 digits, 10 characters (PAN), 1 digit (entity), 1 digit (Z by default), 1 digit (checksum)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  // GSTIN input handler
  const handleGstinChange = (text: string) => {
    const formatted = text.toUpperCase().replace(/\s/g, '');
    setGstin(formatted);
    if (formatted && !validateGSTIN(formatted)) {
      setGstinError('Please enter a valid GSTIN');
    } else {
      setGstinError('');
    }
  };

  const validateInstagram = (url: string) => {
    if (!url) return '';
    const regex = /^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._%-]+\/?(\?.*)?$/;
    return regex.test(url) ? '' : 'Invalid Instagram URL';
  };

  const validatePinterest = (url: string) => {
    if (!url) return '';
    const regex = /^(https?:\/\/)?(([a-zA-Z0-9-]+\.)?pinterest\.com|pin\.it)\/[A-Za-z0-9._%-]+\/?(\?.*)?$/;
    return regex.test(url) ? '' : 'Invalid Pinterest URL';
  };

  const validateFacebook = (url: string) => {
    if (!url) return '';
    const regex = /^(https?:\/\/)?(www\.)?facebook\.com\/[A-Za-z0-9._%-]+\/?(\?.*)?$/;
    return regex.test(url) ? '' : 'Invalid Facebook URL';
  };

  const validateWebsite = (url: string) => {
    if (!url) return '';
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
    return regex.test(url) ? '' : 'Invalid website URL';
  };

  return (
    <SafeAreaView style={styles.outer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.headerBackBtn}>
          <Icon name="arrow-back-ios" size={20} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={[styles.headerSaveBtn, isLoading && styles.headerSaveBtnDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.headerSaveText}>{isLoading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // adjust as needed for your header
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
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
            {/* <Icon name="person-outline" size={20} color="#888" style={{ marginRight: 8 }} /> */}
            <Image source={require('../../assets/profile/editProfile/nameIcon.png')} style={{ width: 20, height: 20, marginRight: 0 }} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="#888"
            />
          </View>
          {/* Username (read-only) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[
                styles.input,
                usernameError ? styles.inputError : null,
              ]}
              value={tempUsername}
              onChangeText={(text) => {
                setTempUsername(text);
                setUsernameError(''); // Clear error when user types
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
          {/* Category Dropdown */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setCategoryDropdown(!categoryDropdown)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../../assets/profile/editProfile/categoryIcon.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                <Text style={[styles.dropdownText, !category && { color: '#888' }]}>{category || 'Select Category'}</Text>
              </View>
              <Icon name={categoryDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#222" />
            </TouchableOpacity>
            {categoryDropdown && (
              <View style={styles.dropdownBox}>
                <View style={styles.searchBarWrapper}>
                  <Image source={require('../../assets/profile/editProfile/searchIcon.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#888"
                    value={categorySearch}
                    onChangeText={setCategorySearch}
                  />
                </View>
                <ScrollView style={styles.dropdownScrollView}
                  contentContainerStyle={{ flexGrow: 1 }}
                  nestedScrollEnabled={true} 
                  keyboardShouldPersistTaps="handled">
                  {filteredCategories.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownOption,
                        category === option && styles.dropdownOptionSelected,
                      ]}
                      onPress={() => {
                        setCategory(option);
                        setCategoryDropdown(false);
                        setCategorySearch('');
                      }}
                    >
                      <Text style={[styles.dropdownOptionText, category === option && styles.dropdownOptionTextSelected]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          {/* Location Dropdown */}
          <Text style={styles.label}>Location</Text>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setLocationDropdown(!locationDropdown)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../../assets/profile/editProfile/locationIcon.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                <Text style={[styles.dropdownText, !location && { color: '#888' }]}>{location || 'Select Location'}</Text>
              </View>
              <Icon name={locationDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#222" />
            </TouchableOpacity>
            {locationDropdown && (
              <View style={styles.dropdownBox}>
                <View style={styles.searchBarWrapper}>
                  <Image source={require('../../assets/profile/editProfile/searchIcon.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#888"
                    value={locationSearch}
                    onChangeText={setLocationSearch}
                  />
                </View>
                <FlatList
                  data={filteredLocations}
                  renderItem={renderLocationItem}
                  keyExtractor={item => item.City}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  removeClippedSubviews={true}
                  getItemLayout={(data, index) => ({
                    length: 50,
                    offset: 50 * index,
                    index,
                  })}
                  style={{ maxHeight: 200 }}
                  contentContainerStyle={{ paddingBottom: 4 }}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                />
              </View>
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
          {/* About Us */}
          <Text style={styles.label}>About Us</Text>
          <View style={styles.bioInputWrapper}>
            <TextInput
              style={styles.inputBio}
              value={aboutUs}
              onChangeText={setAboutUs}
              placeholder="Enter About Us"
              placeholderTextColor="#888"
              multiline
            />
          </View>
          {/* Active Since Dropdown */}
          <Text style={styles.label}>Active Since</Text>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setActiveSinceDropdown(!activeSinceDropdown)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../../assets/profile/editProfile/activeSinceIcon.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                <Text style={[styles.dropdownText, !activeSince && { color: '#888' }]}>{activeSince || 'Select Year'}</Text>
              </View>
              <Icon name={activeSinceDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#222" />
            </TouchableOpacity>
            {activeSinceDropdown && (
              <View style={styles.dropdownBox}>
                <View style={styles.searchBarWrapper}>
                  <Image source={require('../../assets/profile/editProfile/searchIcon.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#888"
                    value={activeSinceSearch}
                    onChangeText={setActiveSinceSearch}
                  />
                </View>
                <ScrollView 
                  style={styles.dropdownScrollView}
                  contentContainerStyle={{ flexGrow: 0 }}
                  nestedScrollEnabled={true} 
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}>
                  {filteredYears.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownOption,
                        activeSince === option && styles.dropdownOptionSelected,
                      ]}
                      onPress={() => {
                        setActiveSince(option);
                        setActiveSinceDropdown(false);
                        setActiveSinceSearch('');
                      }}
                    >
                      <Text style={[styles.dropdownOptionText, activeSince === option && styles.dropdownOptionTextSelected]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          {/* Social Links */}
          <Text style={styles.label}>Social Links</Text>
          <View style={styles.socialIconsRow}>
            {socialIcons.map(social => (
              <TouchableOpacity
                key={social.id}
                style={[styles.socialIconCircle, selectedSocial === social.id && styles.socialIconCircleActive]}
                onPress={() => setSelectedSocial(social.id)}
                activeOpacity={0.7}
              >
                <Image source={social.icon} style={styles.socialIconImg} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.socialInputWrapper}>
            <TextInput
              style={styles.socialInput}
              placeholder={socialIcons.find(s => s.id === selectedSocial)?.placeholder}
              placeholderTextColor="#888"
              value={selectedSocial === 'web' ? website : socialLinks[selectedSocial as keyof typeof socialLinks]}
              onChangeText={text => {
                let error = '';
                if (selectedSocial === 'web') {
                  setWebsite(text);
                  setSocialLinks({ ...socialLinks, web: text });
                  error = validateWebsite(text);
                } else if (selectedSocial === 'instagram') {
                  setSocialLinks({ ...socialLinks, instagram: text });
                  error = validateInstagram(text);
                } else if (selectedSocial === 'pinterest') {
                  setSocialLinks({ ...socialLinks, pinterest: text });
                  error = validatePinterest(text);
                } else if (selectedSocial === 'facebook') {
                  setSocialLinks({ ...socialLinks, facebook: text });
                  error = validateFacebook(text);
                }
                setSocialLinkErrors(prev => ({ ...prev, [selectedSocial]: error }));
              }}
            />
          </View>
          {socialLinkErrors[selectedSocial] ? (
            <Text style={styles.helperText}>{socialLinkErrors[selectedSocial]}</Text>
          ) : null}
          {/* GSTIN */}
          <Text style={styles.label}>GSTIN</Text>
          <TextInput
            style={[styles.input, gstinError ? styles.inputError : null]}
            value={gstin}
            onChangeText={handleGstinChange}
            placeholder="Enter GSTIN"
            placeholderTextColor="#888"
            autoCapitalize="characters"
            maxLength={15}
          />
          {gstinError ? <Text style={styles.helperText}>{gstinError}</Text> : null}
          {/* Online Consultation Card */}
          <TouchableOpacity style={styles.consultCard} activeOpacity={0.8} onPress={() => { /* Add navigation or callback here */ }}>
            <Image source={VideoIcon} style={styles.consultIcon} />
            <Text style={styles.consultText}>Online Consultation</Text>
            <Image source={ArrowRightIcon} style={styles.consultArrow} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
      <CustomAlertModal
        visible={showValidationAlert}
        onClose={() => setShowValidationAlert(false)}
        title="Validation Error"
        description={validationAlertMsg}
        buttonOneText="OK"
        onPressButton1={() => setShowValidationAlert(false)}
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
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    textAlign: 'center',
    marginLeft: 30,
  },
  headerSaveBtn: {
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  headerSaveBtnDisabled: {
    backgroundColor: '#999',
  },
  headerSaveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
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
    backgroundColor: '#EEE',
  },
  initialsAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: { 
    fontSize: 36,
    color: Color.white,
    fontWeight: '600',
    fontFamily: FontFamilies.medium,
  },
  editPicBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#222',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  nameInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    flex: 1,
  },
  inputReadOnly: {
    color: '#AAA',
  },
  dropdownWrapper: {
    marginBottom: 10,
    overflow: 'visible',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 15,
    color: '#222',
  },
  dropdownBox: {
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    marginTop: 6,
    paddingBottom: 4,
    maxHeight: 200,
    overflow: 'hidden',
    zIndex: 1000,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    marginBottom: 4,
    paddingHorizontal: 8,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    backgroundColor: 'transparent',
    height: 50, // Fixed height for better performance
  },
  dropdownOptionSelected: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: '#222',
  },
  dropdownOptionTextSelected: {
    fontWeight: '700',
    color: '#111',
  },
  dropdownScrollView: {
    maxHeight: 200,
    flexGrow: 0,
  },
  bioInputWrapper: {
    position: 'relative',
    backgroundColor: '#F5F5F3',
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
    color: '#222',
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
  },
  socialIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  socialIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  socialIconCircleActive: {
    backgroundColor: '#111',
  },
  socialIconImg: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  socialInputWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  socialInput: {
    fontSize: 15,
    color: '#222',
  },
  consultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  consultIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    resizeMode: 'contain',
  },
  consultText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    flex: 1,
  },
  consultArrow: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: '#222',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#ED4956',
  },
  inputChecking: {
    borderColor: Color.primary,
  },
  helperText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  checkingIndicator: {
    position: 'absolute',
    right: 12,
    top: 38,
  },
});

export default EditBusinessPage; 