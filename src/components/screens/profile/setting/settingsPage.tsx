/* eslint-disable prettier/prettier */
import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Share from 'react-native-share';
import CustomAlertModal from '../../../commons/customAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleShareProfile} from '../../jobs/utils/utils';
import {
  Color,
  FontFamilies,
  FontSizes,
  LineHeights,
} from '../../../../styles/constants';
import {useFocusEffect} from '@react-navigation/native';
import {getInitials} from '../../../../utils/commonFunctions';
import {get} from '../../../../services/dataRequest';
import {ProfileContext} from '../../../../context/ProfileContext';
import {useDispatch} from 'react-redux';

const APP_STORE_ID = 'id6472727148'; // Your iOS App Store ID
const PLAY_STORE_ID = 'com.circlespace.in'; // Your Android Package Name

// Add type for account info
type AccountInfo = {
  email?: string;
  mobileNo?: string;
  username?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  accountType?: string;
};

const SettingsPage = ({navigation}: any) => {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [accountType, setAccountType] = useState('');
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({});
  const [isPaid, setIsPaid] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        try {
          setIsLoading(true);
          const profile: any = await AsyncStorage.getItem('user');
          const cleanedProfile = JSON.parse(profile);
          console.log('Cleaned Profile ::', cleanedProfile);
          setAccountInfo(cleanedProfile);
          setAccountType(cleanedProfile.accountType);

          setUsername(cleanedProfile.username || '');

          // Set name based on account type and available fields
          let fullName;
          // if (cleanedProfile.businessName) {
          //   fullName = cleanedProfile.businessName;
          // } else {
          //   fullName = `${cleanedProfile.firstName || ''} ${cleanedProfile.lastName || ''}`.trim();
          // }
          setName(cleanedProfile.firstName || '');
          setProfilePic(cleanedProfile.profilePic || '');
          console.log('User Data:', {
            username: cleanedProfile.username,
            name: cleanedProfile.firstName,
            profilePic: cleanedProfile.profilePic,
            accountType: cleanedProfile.accountType,
          });

          setIsPaid(cleanedProfile.isPaid);
          console.log('isPaid ::', cleanedProfile.isPaid);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }, []),
  );

  const handleLogout = () => {
    setLogoutModalVisible(true); // Show confirmation modal
  };

  const handleEditProfile = () => {
    // Implement edit profile functionality here
    console.log('Edit Profile pressed');
  };

  const handleDeleteAccount = () => {
    // Implement delete account functionality here
    console.log('Delete Account pressed');
  };
  const dispatch = useDispatch();
  const handleNotificationSettings = () => {
    // Implement notification settings functionality here
    console.log('Notification Settings pressed');
  };
  const {resetContext} = useContext(ProfileContext)!;
  const handleLogoutConfirm = async () => {
    console.log('Logout confirmed');
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const res = await get('user/logout-user', {}, token);
        console.log('res ::', res);
      }

      await AsyncStorage.clear();
      await resetContext();
      dispatch({type: 'REVERT_ALL'});

      navigation.reset({
        index: 0,
        routes: [{name: 'Landing'}],
      });
      setLogoutModalVisible(false); // Close modal after action
    } catch (error) {
      console.error('Error removing user token', error);
    }
    // Example: perform logout action
  };

  const handleLogoutCancel = () => {
    // Implement cancel action for logout confirmation
    console.log('Logout canceled');
    setLogoutModalVisible(false); // Close modal
  };

  const logoutIcon = require('../../../../assets/settings/logout.png'); // Adjust the path as needed
  const faqIcon = require('../../../../assets/settings/faqIcon.png'); // Adjust the path as needed
  const aboutUsIcon = require('../../../../assets/settings/aboutus.png'); // Adjust the path as needed

  const notificationsIcon = require('../../../../assets/settings/notificationIcon.png'); // Adjust the path as needed
  const privacySecurityIcon = require('../../../../assets/settings/policies.png'); // Adjust the path as needed
  const rateUsIcon = require('../../../../assets/settings/rateUs.png'); // Adjust the path as needed
  const shareIcon = require('../../../../assets/settings/share.png'); // Adjust the path as needed
  const arrowRightIcon = require('../../../../assets/settings/rightIcon.png'); // Adjust the path as needed
  const editIcon = require('../../../../assets/settings/editIcon.png'); // Adjust the path as needed
  // const copyRightSetting = require('../../../../assets/settings/copyRightSetting.png'); // Adjust the path as needed
  const copyRightSetting = require('../../../../assets/settings/CSVersionIcon.png');

  const shareApp = async () => {
    // Define URLs for different platforms
    const iosUrl =
      'https://apps.apple.com/app/circlespace-super-app/id6472727148'; // Replace with your iOS app URL
    const androidUrl =
      'https://play.google.com/store/apps/details?id=com.circlespace.in'; // Replace with your Android app URL

    // Set the URL based on the platform
    const url = Platform.OS === 'ios' ? iosUrl : androidUrl;

    const shareOptions = {
      title: 'Share via',
      message: 'Check out this awesome app!',
      url: url,
    };

    try {
      const result = await Share.open(shareOptions);
      console.log('Share result:', result);
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const routeToEdit = async () => {
    const profile: any = await AsyncStorage.getItem('user');
    const cleanedProfile = JSON.parse(profile);
    // navigation.navigate('EditProfile', cleanedProfile);
    navigation.navigate('EditProfileRewamped', cleanedProfile);
  };

  const routeToBusinessEdit = async () => {
    const profile: any = await AsyncStorage.getItem('user');
    const cleanedProfile = JSON.parse(profile);
    console.log('Cleaned', cleanedProfile);
    AsyncStorage.setItem('isPaid', 'false');
    navigation.navigate('EditProfileRewamped', cleanedProfile);
    // navigation.navigate('EditBusinessProfile', cleanedProfile);
  };

  const routeToUploadProject = () => {
    navigation.navigate('UploadProjects');
  };
  const routeToUploadCatalog = () => {
    navigation.navigate('UploadCatalog');
  };
  const handleAboutUs = () => {
    navigation.navigate('AboutUsPage');
  };
  const shareProfile = () => {
    if (accountType === 'personal') {
      handleShareProfile(accountInfo, false);
    } else {
      handleShareProfile(accountInfo, true);
    }
  };

  const openAppRating = async () => {
    try {
      if (Platform.OS === 'ios') {
        // For iOS
        const link = `itms-apps://apps.apple.com/app/${APP_STORE_ID}?action=write-review`;
        const canOpen = await Linking.canOpenURL(link);
        if (canOpen) {
          await Linking.openURL(link);
        } else {
          // Fallback to App Store
          await Linking.openURL(`https://apps.apple.com/app/${APP_STORE_ID}`);
        }
      } else {
        // For Android
        const link = `market://details?id=${PLAY_STORE_ID}`;
        const canOpen = await Linking.canOpenURL(link);
        if (canOpen) {
          await Linking.openURL(link);
        } else {
          // Fallback to Play Store website
          await Linking.openURL(
            `https://play.google.com/store/apps/details?id=${PLAY_STORE_ID}`,
          );
        }
      }
    } catch (error) {
      console.error('Error opening store:', error);
    }
  };

  const renderPremiumBanner = () => {
    if (!isPaid) {
      return (
        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => navigation.navigate('PremiumFeatures')}>
          <Image
            source={require('../../../../assets/profile/premium/TheCIRCLE.png')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.black} />
        </View>
      ) : (
        <>
      {/* User Info Tile */}
      {/* <View style={styles.userInfoContainer}>
        <View style={styles.userInfoLeft}>
          {profilePic ? (
            <Image
              source={{uri: profilePic}}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>
                {getInitials(
                  accountInfo?.username
                )}
              </Text>
            </View>
          )}
          <View style={styles.userTextContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.userName}>{(name || accountInfo.businessName || '').slice(0, 15) + (accountInfo?.businessName?.length > 15 ? '...' : '')}</Text>
              {accountInfo?.isPaid && accountInfo?.accountType === 'professional' && (
                <View style={{padding: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 50, marginLeft: 5, height: 18, width: 18}}>
                  <Image source={require('../../../../assets/settings/subscription/VerifiedIcon.png')} style={styles.verifiedBadge} />
                </View>
              )}
            </View>
            <Text style={styles.userHandle}>@{username || ''}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={accountType === 'personal' ? routeToEdit : routeToBusinessEdit}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View> */}

      {/* Premium Banner */}
      {renderPremiumBanner()}

      {accountType === 'personal' && (
        <>{/* <View style={styles.divider} /> */}</>
      )}
      {accountType === 'professional' && (
        <>{/* <View style={styles.divider} /> */}</>
      )}
      {/* <>
          <TouchableOpacity
            style={styles.Tab}
            onPress={() => {
              // navigation.navigate('NotificationSetting') as never;
              navigation.navigate('SubscriptionScreen') as never;
            }}>
            <View style={styles.optionButton}>
              <Image source={rateUsIcon} style={styles.icon} />
              <Text style={styles.optionText}>Unlock Benefits</Text>
            </View>
            <Image source={arrowRightIcon} style={styles.icon} />
          </TouchableOpacity>

          <View style={styles.divider} />
        </> */}
      {/* {!isPaid ? (
        <>
          <TouchableOpacity
            style={styles.Tab}
            onPress={() => {
              // navigation.navigate('NotificationSetting') as never;
              navigation.navigate('SubscriptionScreen') as never;
            }}>
            <View style={styles.optionButton}>
              <Image source={rateUsIcon} style={styles.icon} />
              <Text style={styles.optionText}>Unlock Benefits</Text>
            </View>
            <Image source={arrowRightIcon} style={styles.icon} />
          </TouchableOpacity>

          <View style={styles.divider} />
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.Tab}
            onPress={() => {
              navigation.navigate('CancelSubscriptionScreen') as never;
            }}>
            <View style={styles.optionButton}>
              <Image source={rateUsIcon} style={styles.icon} />
              <Text style={styles.optionText}>Cancel Subscription</Text>
            </View>
            <Image source={arrowRightIcon} style={styles.icon} />
          </TouchableOpacity>

          <View style={styles.divider} />
        </>
      )} */}
      <TouchableOpacity
        style={styles.Tab}
        onPress={() => {
          navigation.navigate('PrivacySecurity');
        }}>
        <View style={styles.optionButton}>
          <Image source={privacySecurityIcon} style={styles.icon} />
          <Text style={styles.optionText}>Policies</Text>
        </View>
        <Image source={arrowRightIcon} style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.divider} />

      {/* <TouchableOpacity
        style={styles.Tab}
        onPress={() => {
          shareProfile();
        }}>
        <View style={styles.optionButton}>
          <Image source={aboutUsIcon} style={styles.icon} />
          <Text style={styles.optionText}>Share Profile</Text>
        </View>
        <Image source={arrowRightIcon} style={styles.icon} />
      </TouchableOpacity> */}
      {/* <View style={styles.divider} /> */}
      <TouchableOpacity
        style={styles.Tab}
        onPress={() => {
          handleAboutUs();
        }}>
        <View style={styles.optionButton}>
          <Image source={aboutUsIcon} style={styles.icon} />
          <Text style={styles.optionText}>About Us</Text>
        </View>
        <Image source={arrowRightIcon} style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.Tab}
        onPress={() => {
          shareApp();
        }}>
        <View style={styles.optionButton}>
          <Image source={shareIcon} style={styles.icon} />
          <Text style={styles.optionText}>Share App</Text>
        </View>
        <Image source={arrowRightIcon} style={styles.icon} />
      </TouchableOpacity>
      {/* <View style={styles.divider} />
      <View style={styles.Tab}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleEditProfile}>
          <Image source={rateUsIcon} style={styles.icon} />
          <Text style={styles.optionText}>Rate Us</Text>
        </TouchableOpacity>
        <Image source={arrowRightIcon} style={styles.icon} />
      </View> */}
      {/* <View style={styles.divider} />
      <View style={styles.Tab}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleDeleteAccount}>
          <Image source={faqIcon} style={styles.icon} />
          <Text style={styles.optionText}>FAQ</Text>
        </TouchableOpacity>
        <Image source={arrowRightIcon} style={styles.icon} />
      </View> */}
      <View style={styles.divider} />
      <TouchableOpacity style={styles.Tab} onPress={openAppRating}>
        <View style={styles.optionButton}>
          <Image source={aboutUsIcon} style={styles.icon} />
          <Text style={styles.optionText}>Rate Us</Text>
        </View>
        <Image source={arrowRightIcon} style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.Tab}
        onPress={() => {
          navigation.navigate('SettingsReviews');
        }}>
        <View style={styles.optionButton}>
          <Image source={aboutUsIcon} style={styles.icon} />
          <Text style={styles.optionText}>Reviews</Text>
        </View>
        <Image source={arrowRightIcon} style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.Tab}
        onPress={() => {
          handleLogout();
        }}>
        <View style={styles.optionButton}>
          <Image source={logoutIcon} style={styles.icon} />
          <Text style={[styles.optionText]}>Logout</Text>
        </View>
        <Image source={arrowRightIcon} style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.divider} />
      <CustomAlertModal
        visible={logoutModalVisible}
        title="Logout"
        description="Are you sure you want to logout?"
        buttonOneText="Logout"
        buttonTwoText="Cancel"
        onPressButton1={handleLogoutConfirm}
        onPressButton2={handleLogoutCancel}
      />

      {/* Copyright */}
      {/* <View style={styles.copyRight}>
        <Image source={copyRightSetting} style={styles.copyIcon} />
      </View> */}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  Tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    justifyContent: 'space-between',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
  },
  icon: {
    marginRight: 10,
    height: 18,
    width: 18,
    color: Color.black,
  },
  optionText: {
    fontSize: FontSizes.medium,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    lineHeight: 16,
    color: Color.black,
  },
  logoutText: {
    color: '#ED4956',
  },
  divider: {
    height: 1,
    opacity: 0.4,
    backgroundColor: '#B9B9BB',
    marginVertical: 10,
    width: '100%',
  },
  copyRight: {
    marginVertical: 25,
    alignItems: 'center',
    bottom: 10,
    left: 0,
    right: 0,
    position: 'absolute',
  },
  copyIcon: {
    height: 180,
    width: 180,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
  },
  userTextContainer: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: FontSizes.medium2,
    fontWeight: '400',
    color: Color.black,
    fontFamily: FontFamilies.semibold,
    // marginBottom: 5,
    lineHeight: LineHeights.large,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
  },
  verifiedBadgeText: {
    fontSize: FontSizes.small,
    color: Color.primarygrey,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    lineHeight: LineHeights.medium,
  },
  userHandle: {
    fontSize: FontSizes.small,
    color: Color.primarygrey,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    lineHeight: LineHeights.medium,
  },
  editButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    width: 88,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FontFamilies.semibold,
  },
  premiumBanner: {
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
  },
  initialsAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Color.black,
    marginRight: 12,
  },
  initialsText: {
    fontSize: FontSizes.medium,
    color: Color.white,
    fontFamily: FontFamilies.semibold,
    lineHeight: LineHeights.large,
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SettingsPage;
