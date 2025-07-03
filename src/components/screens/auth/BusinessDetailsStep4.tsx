import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../styles/constants';
import BackButton from '../../commons/customBackHandler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import { getInitials } from '../../../utils/commonFunctions';
import { createUser } from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AWS from 'aws-sdk';
import { getPlanDates } from '../../../utils/dateUtils';
const defaultAvatar = require('../../../assets/profile/defaultAvatar.png');

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

type BusinessDetailsStep4Params = {
  phoneNumber: string;
  businessName: string;
  businessUsername: string;
  category: string;
  location: string;
  activeSince: string;
  bio: string;
  aboutUs: string;
  socialLinks: {
    instagram?: string;
    pinterest?: string;
    facebook?: string;
    web?: string;
  };
};

type BusinessDetailsStep4RouteProp = RouteProp<{
  BusinessDetailsStep4: BusinessDetailsStep4Params;
}, 'BusinessDetailsStep4'>;

const BusinessDetailsStep4 = () => {
  const navigation = useNavigation();
  const route = useRoute<BusinessDetailsStep4RouteProp>();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const username = route.params?.businessUsername || '';
  const [error, setError] = useState<string | null>(null);
  console.log('route.params ::',route.params);

  const handlePickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
        compressImageMaxWidth: 1000,
        compressImageMaxHeight: 1000,
        compressImageQuality: 1,
      });
      if (image && image.path) {
        setProfilePic(image.path);
      }
    } catch (error: any) {
      if (error.message !== 'User cancelled image picker') {
        Alert.alert('Error', 'Failed to pick image.');
      }
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
    setProfilePic(null);
  };

  const handleDone = async () => {
    try {
      setIsSettingUp(true);
      
      // Extract all data from route.params
      const {
        phoneNumber,
        businessName,
        businessUsername,
        category,
        location,
        activeSince,
        bio,
        aboutUs,
        socialLinks,
      } = route.params;

      // Format activeSince to ISO format
      const formattedActiveSince = activeSince 
        ? new Date(parseInt(activeSince), 0, 1).toISOString() 
        : new Date().toISOString();

      // Create payload structure
      const { planStartDate, planEndDate } = getPlanDates();

      const payload = {
        phoneNumber,
        accountType: 'professional',
        username: businessUsername.toLowerCase(),
        firstName: businessName.trim(),
        lastName: '', // Empty string since we're only using businessName
        email: '', // You'll need to get this from previous steps
        businessName: businessName.trim(),
        address: {
          line1: '', // You'll need to get this from previous steps
          city: location || '',
          state: '', // You'll need to get this from previous steps
          pincode: '', // You'll need to get this from previous steps
        },
        locationServed: [location],
        minBudget: '', // Not needed for initial setup
        maxBudget: '', // Not needed for initial setup
        professionalType: category,
        professionalCategory: [category],
        servicesProvided: [], // You'll need to get this from previous steps
        website: socialLinks?.web || '',
        otherServices: [], // Not needed for initial setup
        bio,
        aboutUs,
        activeSince: activeSince,
        profilePic: profilePic || '',
        socialMedia: {
          instagram: socialLinks?.instagram || '',
          pinterest: socialLinks?.pinterest || '',
          facebook: socialLinks?.facebook || '',
        },
        isPaid: true,
        userPlan: "paid",
        planStartDate,
        planEndDate,
        planDuration: 365,
        planStatus: "active"
      };
      console.log('payload ::',payload);

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

        setIsSettingUp(false);
        navigation.navigate('BusinessListedSuccess' as never);
      } else {
        setIsSettingUp(false);
        console.log('Error res:', responseData);
        Alert.alert(
          'Error',
          responseData.message || 'Failed to create business account. Please try again.',
        );
      }
    } catch (error) {
      setIsSettingUp(false);
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{top:10,marginBottom:15}}>
        <BackButton/>
      </View>
      {/* Progress Bar and Step */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
        <View style={styles.stepBox}>
          <Text style={styles.stepText}>3/3</Text>
        </View>
      </View>
      <View style={{marginHorizontal:20}}>
        <Text style={styles.header}>Business Profile Picture</Text>
        <Text style={styles.hint}>Add your business logo or photo to help people recognise your business.</Text>
      </View>
      <View style={styles.centerContent}>
        <View style={styles.avatarWrapper}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.avatar} />
          ) : (
            <Image source={require('../../../assets/profile/editProfile/noProfile.png')} style={styles.avatar2} />
          )}
          {!profilePic && (
            <TouchableOpacity style={styles.editIconBtn} onPress={handleProfilePicker}>
              <Icon name="mode" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          {profilePic && (
            <TouchableOpacity style={styles.editIconBtn} onPress={handleRemoveProfilePic}>
              <Icon name="close" size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Next/Previous Buttons Footer */}
      <View style={styles.footerBtnRow}>
        <TouchableOpacity style={styles.prevBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#111" style={{ marginRight: 8 }} />
          <Text style={styles.prevBtnText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.nextBtn, isSettingUp && styles.disabledButton]} 
          onPress={handleDone}
          disabled={isSettingUp}
        >
          {isSettingUp ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>Done</Text>
              <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    marginHorizontal: 20,
  },
  progressBarBg: {
    flex: 1,
    height: 7,
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
    marginRight: 10,
  },
  progressBarFill: {
    width: '100%', // 3/3th progress
    height: 7,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  stepBox: {
    backgroundColor: '#000',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stepText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  header: {
    fontSize: FontSizes.large2,
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    marginBottom: 15,
    marginLeft: 2,
    marginTop: 10,
  },
  hint: {
    color: Color.primarygrey,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    marginBottom: 18,
    marginLeft: 2,
  },
  centerContent: {
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    top: -100,
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Color.white,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    resizeMode: 'cover',
    backgroundColor: Color.white,
  },
  avatar2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
    backgroundColor: Color.white,
  },
  editIconBtn: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: '#111',
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  footerBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginRight: 8,
    flex: 1,
    justifyContent: 'center',
  },
  prevBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginLeft: 8,
    flex: 1,
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  initialsAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  disabledButton: {
    backgroundColor: '#666',
  },
});

export default BusinessDetailsStep4; 