import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { FontFamilies, Color, FontSizes } from '../../styles/constants';
import apiEndPoints from '../../constants/apiEndPoints';
import routes from '../../constants/routes';
import chatRequest from '../../services/chatRequest';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setCurrentUserId } from '../../redux/reducers/chatSlice';
import { getInitials, getName, getUsername } from '../../utils/commonFunctions';

interface Stats {
  saves: number;
  followers: number;
  following: number;
  sinceActive?: string;
}

interface ProfileInfoProps {
  name: string;
  username: string;
  bio: string;
  profileImage: string;
  about: string;
  jobTitle: string;
  verified: boolean;
  sinceActive: string;
  stats: Stats;
  isSelf?: boolean;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
  profileType?: 'business' | 'personal';
  location?: string;
  category?: string;
  profile: any
}

const { width } = Dimensions.get('window');

const iconMap = [
  { name: 'bookmark-outline', color: '#F4C542' }, // Saves
  { name: 'people-outline', color: '#3B82F6' },   // Followers
  { name: 'person-add-outline', color: '#EF4444' } // Following
];

const defaultAvatar = require('../../assets/profile/defaultAvatar.png');

const ProfileInfo: React.FC<ProfileInfoProps> = ({ name, username, bio, profileImage, verified, stats, isSelf, onFollowersPress, onFollowingPress, profileType, location, category, sinceActive, profile }) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  console.log(isSelf);

  // Determine image source or initials
  let imageSource;
  let showInitials = false;
  if (!profileImage) {
    showInitials = true;
  } else if (profileImage.startsWith('http')) {
    imageSource = { uri: profileImage };
  } else {
    showInitials = true;
  }

  const initials = getInitials(username);

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const renderBio = () => {
    if (!bio) {
      console.log('Bio is empty or undefined');
      return null;
    }
    // Count lines and characters
    const lines = bio.split('\n');
    const hasMoreLines = lines.length > 3;
    const cleanBio = bio.replace(/\n/g, '');
    const hasMoreChars = cleanBio.length > 135;
    const shouldShowMore = hasMoreLines || hasMoreChars;

    // Get display text
    let displayText = bio;
    if (!isBioExpanded) {
      // Limit to 3 lines
      const limitedLines = lines.slice(0, 2);
      displayText = limitedLines.join('\n');

      // If still too long, truncate to 90 chars
      if (cleanBio.length > 135) {
        let charCount = 0;
        let truncatedText = '';
        for (let i = 0; i < displayText.length; i++) {
          if (displayText[i] === '\n') {
            truncatedText += '\n';
          } else if (charCount < 135) {
            truncatedText += displayText[i];
            charCount++;
          }
        }
        displayText = truncatedText;
      }
    }

    return (
      <Text style={styles.bio}>
        {displayText}
        {shouldShowMore && (
          <>
            {!isBioExpanded && '... '}
            <Text
              style={styles.moreButtonText}
              onPress={() => setIsBioExpanded(!isBioExpanded)}>
              {isBioExpanded ? ' less' : 'more'}
            </Text>
          </>
        )}
      </Text>
    );
  };

  return (
    <View style={styles.card}>
      {/* Row 1: Name, Username, Profile Image */}
      <View style={styles.row1}>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>
            {getName(name, 15)}
            {verified && (
              <Image source={require('../../assets/profile/profileInfo/verifiedIcon.png')} style={styles.verifiedIcon} />
            )}
          </Text>
          <Text style={styles.username}>
            <Image source={require('../../assets/profile/profileInfo/atIcon.png')} style={{ width: width * 0.04, height: width * 0.04, marginRight: 0, marginTop: Platform.OS === 'ios' ? -2 : 0}} />
            {getUsername(username, 15)}</Text>
          {/* Location and Category for business or if provided */}
          {(location || category) && (
            <View style={{marginBottom: 2 }}>
              {category && (
                <View style={{ flexDirection: 'row', alignItems: 'center' , marginRight: 8}}>
                  {/* <Icon name="briefcase-outline" size={14} color="#888" style={{ marginRight: 2 }} /> */}
                  <Image source={require('../../assets/profile/profileInfo/categoryIcon.png')} style={{ width: width * 0.04, height: width * 0.04, marginRight: 8 }} />
                  <Text style={{ fontSize: FontSizes.small, color: Color.primarygrey, fontFamily: FontFamilies.medium , marginTop: 2 }}>{category}</Text>
                </View>
              )}
              {location && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                  <Image source={require('../../assets/profile/profileInfo/locationIcon.png')} style={{ width: width * 0.04, height: width * 0.04, marginRight: 8 }} />
                  <Text style={{ fontSize: FontSizes.small, color: Color.primarygrey, fontFamily: FontFamilies.medium , marginTop: 2 }}>{location}</Text>
                </View>
              )}
            </View>
          )}
          {!isSelf && profileType !== 'business' && (
            <TouchableOpacity onPress={async () => {
              const data: any = await AsyncStorage.getItem('user')
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
              console.log('profile chat', urlencoded,profile);
              dispatch(setCurrentUserId(profileData?._id))
              chatRequest(
                apiEndPoints.createRoom,
                'POST',
                urlencoded,
                'multipart/form-data',
              ).then(res => {
                console.log('room created',  res?.data?.results?.room);
                navigation.navigate(routes.privateChat, {
                  roomData: res?.data?.results?.room,
                });
                // navigation.navigate(routes.chats);
              });


            }} style={styles.messageIconWrapper}>
              <Image source={require('../../assets/profile/profileInfo/messageIcon.png')} style={styles.messageIcon} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.profileShadowWrapper}>
          {showInitials ? (
            <View style={[styles.profileImage, styles.initialsContainer]}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          ) : (
            <Image source={imageSource} style={styles.profileImage} />
          )}
        </View>
      </View>
      {/* Row 2: Bio */}
      <View style={styles.row2}>
        {renderBio()}
      </View>
      {/* Row 3: Stat Tiles */}
      <View style={styles.statsRow}>
        <View style={{ flex: 1 }}>
          <LinearGradient colors={["#000000", "#BABABA"]} style={styles.statTileGradient}>
            <View style={styles.statTileInner}>
              {profileType === 'business' ? (
                <Image source={require('../../assets/profile/profileInfo/sinceActiveIcon.png')} style={styles.statTileIcon} />
              ) : (
                <Image source={require('../../assets/profile/profileInfo/savesIcon.png')} style={styles.statTileIcon} />
              )}
              <Text style={styles.statTileValue}>
                {profileType === 'business' ? (sinceActive ?? '2020') : (stats.saves ?? '0')}
              </Text>
              <Text style={styles.statTileLabel}>
                {profileType === 'business' ? 'Since active' : 'Saves'}
              </Text>
            </View>
          </LinearGradient>
        </View>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onFollowersPress}>
          <LinearGradient colors={["#000000", "#BABABA"]} style={styles.statTileGradient}>
            <View style={styles.statTileInner}>
              <Image source={require('../../assets/profile/profileInfo/followersIcon.png')} style={styles.statTileIcon} />
              <Text style={styles.statTileValue}>{stats.followers}</Text>
              <Text style={styles.statTileLabel}>Followers</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onFollowingPress}>
          <LinearGradient colors={["#000000", "#BABABA"]} style={styles.statTileGradient}>
            <View style={styles.statTileInner}>
              <Image source={require('../../assets/profile/profileInfo/followingIcon.png')} style={styles.statTileIcon} />
              <Text style={styles.statTileValue}>{stats.following}</Text>
              <Text style={styles.statTileLabel}>Following</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileInfo;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: width * 0.04,
    paddingHorizontal: width * 0,
    marginHorizontal: width * 0.04,
    marginTop: width * 0.04,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: width * 0.02,
  },
  nameBlock: {
    flex: 1,
    marginRight: width * 0.04,
    justifyContent: 'center',
  },
  profileShadowWrapper: {
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.25,
    // shadowRadius: 16,
    // elevation: 10,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
  profileImage: {
    width: width * 0.20,
    height: width * 0.20,
    borderRadius: 50,
    borderWidth: 0.1,
    borderColor: Color.black,
    backgroundColor: Color.white,
  },
  initialsContainer: {
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
 initialsText: {
    color: Color.white,
    fontSize: width * 0.08,
    fontFamily: FontFamilies.semibold,
  },
  row2: {
    width: '100%',
    marginBottom: width * 0.05,
    alignItems: 'flex-start',
  },
  name: {
    fontSize: FontSizes.large3,
    fontFamily: FontFamilies.bold,
    color: Color.black,
    marginBottom: -6,
    paddingBottom: Platform.OS === 'ios' ? 6 : 0,
  },
  verifiedIcon: {
    width: width * 0.05,
    height: width * 0.05,
    marginLeft: 6,
  },
  username: {
    fontSize: FontSizes.small,
    color: Color.black,
    fontFamily: FontFamilies.semibold,
    marginBottom: 6,
  },
  bio: {
    fontSize: 12,
    color: Color.black,
    lineHeight: width * 0.045,
    fontFamily: FontFamilies.regular,
    marginTop: 2,
    textAlign: 'left',
    marginRight: 10,
  },
  moreButtonText: {
    color: Color.primarygrey,
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.small,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: width * 0.01,
  },
  statTileGradient: {
    flex: 1,
    borderRadius: 18,
    marginHorizontal: width * 0.01,
    minHeight: width * 0.18,
    padding: 2.5,
  },
  statTileInner: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'flex-end',
    padding: width * 0.03,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  statTileIcon: {
    width: width * 0.07,
    height: width * 0.07,
    position: 'absolute',
    top: width * 0.025,
    right: width * 0.025,
  },
  statTileValue: {
    fontSize: FontSizes.large,
    fontFamily: FontFamilies.bold,
    color: Color.black,
    position: 'absolute',
    left: width * 0.04,
    bottom: width * 0.06,
  },
  statTileLabel: {
    fontSize: FontSizes.small,
    color: Color.primarygrey,
    position: 'absolute',
    left: width * 0.04,
    bottom: width * 0.02,
    fontFamily: FontFamilies.medium,
  },
  messageIconWrapper: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    width: width * 0.12,
    height: width * 0.09,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageIcon: {
    width: width * 0.06,
    height: width * 0.06,
  },
});
