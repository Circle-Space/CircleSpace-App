import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Modal, Pressable, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import SettingRoute from '../commons/settingRouteHandler';
import { useProfile } from '../../hooks/useProfile';
import { useDispatch, useSelector } from 'react-redux';
import { updateFollowStatus, setFollowCounts } from '../../redux/slices/followSlice';
import { RootState } from '../../redux/store';
import { handleShareProfile } from '../screens/jobs/utils/utils';
import routes from '../../constants/routes';
import apiEndPoints from '../../constants/apiEndPoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCurrentUserId } from '../../redux/reducers/chatSlice';
import chatRequest from '../../services/chatRequest';
import SharePostToChat from '../screens/Home/SharePostToChat';

interface ProfileData {
  _id: string;
  name: string;
  username: string;
  bio: string;
  profileImage: string;
  about: string;
  jobTitle: string;
  verified: boolean;
  sinceActive: string;
  stats: {
    saves: number;
    followers: number;
    following: number;
  };
  location?: string;
}

interface HeaderProps {
  isSelf: boolean;
  onFollowToggle?: () => void;
  onBackPress?: () => void;
  profileType?: 'business' | 'personal';
  profile?: any;
  onSharePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSelf, onFollowToggle, onBackPress, profileType, profile, onSharePress }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const { toggleFollow } = useProfile();
  const dispatch = useDispatch();
  
  // Get follow status from Redux
  const followedUsers = useSelector((state: RootState) => state.follow.followedUsers);
  const isFollowing = profile?._id ? followedUsers[profile._id] || false : false;
  console.log('isFollowing', isFollowing);

  const handleFollowToggle = async () => {
    if (!profile?._id) return;
    
    try {
      const success = await toggleFollow(profile._id);
      if (success) {
        const newFollowStatus = !isFollowing;
        
        // Update Redux state
        dispatch(updateFollowStatus({ 
          userId: profile._id, 
          isFollowed: newFollowStatus 
        }));

        // Update follow counts in Redux
       

        // Call the parent's onFollowToggle if provided
        if (onFollowToggle) {
          onFollowToggle();
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleSendInquiry = async () => {
      const data: any = await AsyncStorage.getItem('user');

      const profileData = JSON.parse(data);
      const urlencoded = new FormData();
      urlencoded.append('receiver_id', profile?._id);
      urlencoded.append('receiver_username', profile?.username);
      urlencoded.append('receiver_avatar', profile?.avatar);
      urlencoded.append(
        'user_username',
        profileData?.firstName ?? profileData?.username
      );
      urlencoded.append('user_avatar', profileData?.avatar);
      // urlencoded.append('payload', JSON.stringify(profile));
      console.log('profile chat', urlencoded);
      dispatch(setCurrentUserId(profileData?._id))
      chatRequest(
        apiEndPoints.createRoom,
        'POST',
        urlencoded,
        'multipart/form-data',
      ).then(res => {
        console.log('room created', res?.data?.results?.room);
        navigation.navigate(routes.privateChat, {
          roomData: res?.data?.results?.room,
        });
        // navigation.navigate(routes.chats);
      });
      setModalVisible(false);
  }

  const handleShareAccount = () => {
    setModalVisible(false);
    if (onSharePress) {
      onSharePress();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBackPress}>
        <Image source={require('../../assets/profile/header/backIcon.png')} style={styles.icon} />
      </TouchableOpacity>

      <View style={styles.rightIcons}>
        {isSelf ? (
          <>
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => {
                if (profileType === 'business') {
                  (navigation as any).navigate('EditBusinessPage', {
                    initial: {
                      profilePic: profile?.profileImage || '',
                      name: profile?.name || '',
                      username: profile?.username || '',
                      category: profile?.jobTitle || '',
                      bio: profile?.bio || '',
                      aboutUs: profile?.about || '',
                      gstin: profile?.gstin || '',
                      location: profile?.location || '',
                      city: profile?.city || '',
                      teamSize: profile?.teamSize || '',
                      businessEmail: profile?.businessEmail || '',
                      website: profile?.website || '',
                      activeSince: profile?.sinceActive || '',
                      socialMedia: {
                        facebook: profile?.socialMedia?.facebook || '',
                        instagram: profile?.socialMedia?.instagram || '',
                        linkedin: profile?.socialMedia?.linkedin || '',
                        twitter: profile?.socialMedia?.twitter || '',
                        pinterest: profile?.socialMedia?.pinterest || '',
                      },
                      address: profile?.address || '',
                      dateOfBirth: profile?.dateOfBirth || '',
                      gender: profile?.gender || '',
                      contactNumber: profile?.contactNumber || '',
                      GSTIN: profile?.GSTIN || '',
                      servicesProvided: profile?.servicesProvided || '',

                    }
                  });
                } else {
                  (navigation as any).navigate('EditProfileForm', {
                    initial: {
                      profilePic: profile?.profileImage || '',
                      name: profile?.name || '',
                      username: profile?.username || '',
                      bio: profile?.bio || '',
                      gender: profile?.gender || '',
                      dateOfBirth: profile?.dateOfBirth || '',
                      city: profile?.city || '',
                      contactNumber: profile?.contactNumber || '',
                    }
                  });
                }
              }}
            >
              <Image source={require('../../assets/profile/header/editIcon.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('Notifications' as never)}>
              <Image source={require('../../assets/profile/header/notificationIcon.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconContainer} onPress={() => setModalVisible(true)}>
              <Image source={require('../../assets/profile/header/moreIcon.png')} style={styles.icon} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={isFollowing ? styles.followingButton : styles.followButton}
              onPress={handleFollowToggle}
            >
              <Text style={isFollowing ? styles.followingText : styles.followText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.icon} onPress={() => setModalVisible(true)}>
              <Image source={require('../../assets/profile/header/moreIcon.png')} style={styles.icon} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Modal for 3-dots */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            {isSelf ? (
              <>
                <TouchableOpacity style={styles.modalOption} onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('SettingPage' as never);
                }}>
                  <Text style={styles.modalText}>Settings</Text>
                  <Image source={require('../../assets/profile/header/settingsIcon.png')} style={{ width: 20, height: 20, marginLeft: 10 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={handleShareAccount}>
                  <Text style={styles.modalText}>Share Account</Text>
                  <Image source={require('../../assets/profile/header/shareIcon.png')} style={{ width: 20, height: 20, marginLeft: 10 }} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                {profileType === 'business' && (
                  <TouchableOpacity style={styles.modalOption} onPress={handleSendInquiry}>
                    <Text style={styles.modalText}>Send Inquiry</Text>
                    <Image source={require('../../assets/profile/profileInfo/messageIcon.png')} style={{ width: 20, height: 20, marginLeft: 10 }} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.modalOption} onPress={handleShareAccount}>
                  <Text style={styles.modalText}>Share Account</Text>
                  <Image source={require('../../assets/profile/header/shareIcon.png')} style={{ width: 20, height: 20, marginLeft: 10 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption}>
                  <Text style={styles.reportText}>Report</Text>
                  <Image source={require('../../assets/profile/header/reportIcon.png')} style={{ width: 20, height: 20, marginLeft: 10 }} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Add SharePostToChat component */}
      <SharePostToChat
        feed={profile}
        openShare={false}
        setOpenShare={() => {}}
        isProfile={true}
      />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    width: 22,
    height: 22,
    marginLeft: 10,
  },
  iconContainer: {
    width: 37,
    height: 37,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 22,
    borderRadius: 12,
    height: 35,
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 22,
    borderRadius: 12,
    height: 35,
  },
  followText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  followingText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop:Platform.OS==="ios"? 120 : 50,
    marginRight: 16,
    paddingVertical: 6,
    width: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  modalText: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  reportText: {
    flex: 1,
    fontSize: 15,
    color: '#F44336',
    fontWeight: '600',
  },
});
