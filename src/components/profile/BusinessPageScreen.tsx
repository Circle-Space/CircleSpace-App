import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, FlatList, Image, ScrollView, TouchableWithoutFeedback, ActivityIndicator, Platform } from 'react-native';
import Header from './Header';
import ProfileInfo from './ProfileInfo';
import PostTab from './PostTab';
import SavedTab from './SavedTab';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Gallery } from './Gallery';
import PinnedReviews from '../screens/profile/PinnedReviews';
import CircleSpaceBadges from './CircleSpaceBadges';
import SocialLinks from './SocialLinks';
import { useProfile } from '../../hooks/useProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createVideoThumbnail } from 'react-native-compressor';
import RatingAndReviews from './RatingAndReviews';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import CustomFAB from '../commons/customFAB';
import SharePostToChat from '../screens/Home/SharePostToChat';
import { useBottomBarScroll } from '../../hooks/useBottomBarScroll';
import messageIcon from '../../assets/icons/messageicon.png';
import calendarIcon from '../../assets/icons/calendaricon.png';
import { generateChannelId, generateBusinessChannelId, generateBusinessChannelName, generateAppointmentChannelName } from '../../utils/videoCallUtils';
import { getStaticChannelId } from '../../config/videoCall.config';

const { width } = Dimensions.get('window');

interface BusinessPageScreenProps {
  route: {
    params: {
      isSelf: boolean;
      userId: string;
    };
  };
}

// Temporary type for Review to fix linter error
type Review = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  time: string;
  text: string;
  pinned: boolean;
};

const BusinessPageScreen: React.FC<BusinessPageScreenProps> = ({ route }) => {
  const { isSelf, userId } = route.params;
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<'posts' | 'saved'>('posts');
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>(userId);
  const [galleryImages, setGalleryImages] = useState<{ uri: string; type: 'photo' | 'video' }[]>([]);
  const [isProcessingThumbnails, setIsProcessingThumbnails] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [updatingGallery, setUpdatingGallery] = useState(false);
  const [token, setToken] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  console.log("king 100 ::", token);
  const [lastScrollTime, setLastScrollTime] = useState(0);

  // Add bottom bar scroll handler
  const { handleScroll: handleBottomBarScroll } = useBottomBarScroll();

  // Add token fetching
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        console.log("userToken business ::", userToken);
        if (userToken) {
          setToken(userToken);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };
    fetchToken();
  }, []);

  const { 
    profile, 
    loading, 
    error, 
    fetchProfile, 
    fetchPosts, 
    fetchSavedCollections,
    posts 
  } = useProfile();
  console.log("king  ::", profile);

  // Add function to handle post updates


  // Get follow status from Redux
  const followedUsers = useSelector((state: RootState) => state.follow.followedUsers);
  const isFollowing = profile?._id ? followedUsers[profile._id] || false : false;

  useFocusEffect(
    useCallback(() => {
      const initializeProfile = async () => {
        try {
          setIsInitialized(false); // Reset initialization state
          if (isSelf) {
            const user = await AsyncStorage.getItem('user');
            if (!user) {
              console.error('No user data found in AsyncStorage');
              return;
            }
            const userData = JSON.parse(user);
            if (!userData?._id) {
              console.error('No user ID found in user data');
              return;
            }
            setCurrentUserId(userData._id);
            console.log("Fetching self business profile with ID:", userData._id);
            await fetchProfile(userData._id);
            await fetchPosts(userData._id);
            await fetchSavedCollections(userData._id, false);
            
          } else if (userId) {
            setCurrentUserId(userId);
            console.log("Fetching other business profile with ID:", userId);
            await fetchProfile(userId);
            await fetchPosts(userId);
            await fetchSavedCollections(userId, true);
           
          }
          setIsInitialized(true); // Mark as initialized after all data is loaded
        } catch (error) {
          console.error('Error initializing business profile:', error);
        }
      };

      initializeProfile();
    }, [userId, isSelf])
  );

  // Process thumbnails when posts change
  useEffect(() => {
    const processThumbnails = async () => {
      if (!isInitialized) return; // Don't process if not initialized
      
      // Reset gallery images immediately when posts change
      setGalleryImages([]);
      
      if (!posts || posts.length === 0) {
        setIsProcessingThumbnails(false);
        return;
      }
      
      setIsProcessingThumbnails(true);
      try {
        const processed = await Promise.all(
          posts.map(async (post) => {
            if (!post.image) {
              return {
                uri: '',
                type: 'photo' as const
              };
            }

            if (post.image.endsWith('.mp4') || post.image.endsWith('.mov')) {
              try {
                const thumbnail = await createVideoThumbnail(post.image);
                return {
                  uri: thumbnail?.path || post.image,
                  type: 'video' as const
                };
              } catch (error) {
                console.error('Error generating thumbnail:', error);
                return {
                  uri: post.image,
                  type: 'video' as const
                };
              }
            }
            return {
              uri: post.image,
              type: 'photo' as const
            };
          })
        );

        // Filter out any invalid images (empty URIs)
        const validImages = processed
          .filter(img => img.uri && img.uri.trim() !== '')
          .map(img => ({
            uri: img.uri,
            type: img.type as 'photo' | 'video'
          }));
        setGalleryImages(validImages);
      } catch (error) {
        console.error('Error processing thumbnails:', error);
        // Fallback to basic processing if thumbnail generation fails
        const validImages = posts
          .filter(post => post.image && post.image.trim() !== '')
          .map(post => ({
            uri: post.image || '',
            type: (post.type === 'video' ? 'video' : 'photo') as 'photo' | 'video'
          }));
        setGalleryImages(validImages);
      } finally {
        setIsProcessingThumbnails(false);
      }
    };

    processThumbnails();
  }, [posts, isInitialized]);

  // Add console log for profile data in render
  console.log("Current Profile Data in BusinessPageScreen:", profile);

  // Add scroll handler
  useFocusEffect(
    useCallback(() => {
      setIsFabOpen(false);
    }, [])
  );

  const handleScroll = useCallback((event: any) => {
    const currentTime = Date.now();
    // Only close FAB if it's been more than 500ms since last scroll
    if (isFabOpen && currentTime - lastScrollTime > 500) {
      setIsFabOpen(false);
    }
    setLastScrollTime(currentTime);
    
    // Handle bottom bar scroll
    handleBottomBarScroll(event);
  }, [isFabOpen, lastScrollTime, handleBottomBarScroll]);

  const handleScreenPress = () => {
    if (isFabOpen) {
      setIsFabOpen(false);
    }
  };

  const handleFabToggle = () => {
    setIsFabOpen(prev => !prev);
    // Reset last scroll time when FAB is toggled
    setLastScrollTime(Date.now());
  };

  const renderAbout = () => {
    if (!profile || !profile.about) {
      return null;
    }
    // Count lines and characters
    const lines = profile.about.split('\n');
    const hasMoreLines = lines.length > 3;
    const cleanAbout = profile.about.replace(/\n/g, '');
    const hasMoreChars = cleanAbout.length > 135;
    const shouldShowMore = hasMoreLines || hasMoreChars;

    // Get display text
    let displayText = profile.about;
    if (!aboutExpanded) {
      // Limit to 3 lines
      const limitedLines = lines.slice(0, 2);
      displayText = limitedLines.join('\n');

      // If still too long, truncate to 135 chars
      if (cleanAbout.length > 135) {
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
      <Text style={styles.aboutText}>
        {displayText}
        {shouldShowMore && (
          <>
            {!aboutExpanded && '... '}
            <Text
              style={styles.readMore}
              onPress={() => setAboutExpanded((prev) => !prev)}
            >
              {aboutExpanded ? ' less' : 'more'}
            </Text>
          </>
        )}
      </Text>
    );
  };

  if (loading || !isInitialized || isProcessingThumbnails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.black} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.container}>
        <Text>Error: {error || 'Profile not found'}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isSelf && (
        <CustomFAB
          accountType={'professional'}
          isOpen={isFabOpen}
          onToggle={handleFabToggle}
        />
      )}
      <ScrollView 
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onTouchStart={handleScreenPress}
      >
        <Header
          isSelf={isSelf}
          profileType="business"
          onBackPress={() => {
            navigation.goBack()
          }}
          onFollowToggle={() => {
            // This will be handled by the Header component now
          }}
          profile={profile}
          onSharePress={() => setOpenShare(true)}
        />
        <View style={{ marginBottom: 20 }}>
          <ProfileInfo
            isSelf={isSelf}
            name={profile.name}
            username={profile.username}
            bio={profile.bio}
            profileImage={profile.profileImage}
            profileType="business"
            about={profile.about}
            jobTitle={profile.jobTitle}
            verified={profile.verified}
            sinceActive={profile.sinceActive}
            location={profile.city}
            stats={profile.stats}
            onFollowersPress={() => (navigation as any).navigate('FollowersFollowingScreen', {
              isSelfProfile: isSelf,
              username: profile.username,
              userId: currentUserId,
              followersCount: profile.stats.followers,
              followingCount: profile.stats.following,
              initialTab: 'followers',
            })}
            onFollowingPress={() => (navigation as any).navigate('FollowersFollowingScreen', {
              isSelfProfile: isSelf,
              username: profile.username,
              userId: currentUserId,
              followersCount: profile.stats.followers,
              followingCount: profile.stats.following,
              initialTab: 'following',
            })}
            profile={profile}
            category={profile.category}
          />
        </View>
        {/* Gallery Section */}
        <View style={{ marginBottom: 10 }}>
          {isProcessingThumbnails && updatingGallery ? (
            <View style={styles.galleryLoadingContainer}>
              <ActivityIndicator size="large" color={Color.black} />
              <Text style={styles.galleryLoadingText}>Updating gallery...</Text>
            </View>
          ) : (
            <Gallery 
              images={galleryImages}
              onSeeAllPress={() => {
                console.log('See all pressed');
              }}
              userId={currentUserId}
              username={profile.username}
              isSelf={isSelf}
              profile={profile}
            />
          )}
        </View>
        {/* About Section */}
        <View style={styles.aboutContainer}>
          <Text style={styles.aboutTitle}>About</Text>
          <View style={styles.aboutCard}>
            {renderAbout()}
          </View>
        </View>

        {/* <View style={styles.articleHeaderRow}>
          <Text style={styles.articleTitle}>Press & Articles</Text>
        </View> */}

        {/* <View style={styles.aboutCard}> */}
          {/* <Text style={styles.emptyText}>No Articles Yet</Text> */}
        {/* </View> */}
        
        {/* Ratings & Reviews Section */}
        <RatingAndReviews userId={currentUserId} isSelf={isSelf} profile={profile} />
        {/* {profile?._id && (
          <PinnedReviews
            userId={profile._id}
            onStatsUpdate={(stats) => {
              console.log('Stats updated:', stats);
            }}
          />
        )} */}
        {/* CircleSpace Badges Section */}
        <CircleSpaceBadges />
        {/* Social Links Section */}
        <SocialLinks socialMedia={profile?.socialMedia} website={profile?.website} />
        {/* GSTIN Section */}
        <View style={styles.gstinContainer}>
          <Text style={styles.gstinTitle}>GSTIN</Text>
          <View style={styles.gstinCard}>
            <Text style={styles.gstinText}>{profile.gstin}</Text>
          </View>
        </View>
      </ScrollView>

      <SharePostToChat
        feed={profile}
        openShare={openShare}
        setOpenShare={setOpenShare}
        isProfile={true}
      />

{!isSelf && (
      <View style={styles.bottomButtonBar} pointerEvents="box-none">
        <TouchableOpacity style={styles.inquiryButton} onPress={() => (navigation as any).navigate('InquiryForm')}>
          <Image source={messageIcon} style={{ width: 20, height: 20, marginRight: 6, resizeMode: 'contain' }} />
          <Text style={styles.inquiryButtonText}>Send Inquiry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.appointmentButton} onPress={() => {
          // Use static channel ID so all users join the same channel
          const channelId = getStaticChannelId(); // Static channel ID - same for everyone
          
          console.log('Joining static channel:', channelId); // Debug log
          
          (navigation as any).navigate('AgoraVideoCall', {
            channelId: channelId, // Static channel ID - everyone joins channel "12345"
            token: '',
            uid: 0,
          });
        }}>
          <Image source={calendarIcon} style={{ width: 20, height: 20, marginRight: 6, resizeMode: 'contain' }} />
          <Text style={styles.appointmentButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
      )}
    </SafeAreaView>
  );
};

export default BusinessPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingBottom: Platform.OS === 'ios' ? 50 : 90,
    // marginBottom: Platform.OS === 'ios' ? 50 : 90,
  },
  articleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  articleTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: Color.black,
  },
  galleryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 30,
    marginTop: 24,
    marginBottom: 8,
  },
  galleryTitle: {
    fontSize: 20,
    fontFamily: FontFamilies.bold,
    color: Color.black,
  },
  seeAllText: {
    fontSize: 15,
    fontFamily: FontFamilies.medium,
    color: Color.black,
    fontWeight: '500',
  },
  galleryImage: {
    width: width * 0.25,
    height: width * 0.35,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  aboutContainer: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  aboutTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    marginBottom: 8,
    color: Color.black,
  },
  aboutCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 18,
    padding: 16,
  },
  aboutText: {
    fontSize: 12,
    color: Color.primarygrey,
    lineHeight: width * 0.045,
    fontFamily: FontFamilies.regular,
    marginTop: 2,
  },
  readMore: {
    fontSize: 12,
    fontFamily: FontFamilies.medium,
    color: Color.black,
  },
  gstinContainer: {
    marginTop: 15,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 50 : 90,
  },
  gstinTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: Color.black,
    marginBottom: 12,
  },
  gstinCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  gstinText: {
    fontSize: 16,
    color: Color.black,
    letterSpacing: 0,
    fontFamily: FontFamilies.medium,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: FontFamilies.medium,
    color: Color.black,
  },
  galleryLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
  },
  galleryLoadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: FontFamilies.medium,
    color: Color.black,
  },
  emptyText: {
    fontFamily: FontFamilies.regular,
    fontWeight: '500',
    fontSize: FontSizes.small,
    lineHeight: 13,
    textAlign: 'center',
    color: Color.primarygrey,
    marginTop: 20,
    marginBottom: 20,
  },
  bottomButtonBar: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F3F3F3',
  },
  inquiryButton: {
    width: '40%',
    height: 46,
    borderRadius: 8,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  inquiryButtonText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0,
  },
  appointmentButton: {
    width: '40%',
    height: 46,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    flexDirection: 'row',
  },
  appointmentButtonText: {
    color: '#000',
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0,
  },
}); 