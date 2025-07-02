import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, ScrollView, ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Header from './Header';
import ProfileInfo from './ProfileInfo';
import PostTab from './PostTab';
import SavedTab from './SavedTab';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useProfile } from '../../hooks/useProfile';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontFamilies, Color } from '../../styles/constants';
import CustomFAB from '../commons/customFAB';
import SharePostToChat from '../screens/Home/SharePostToChat';
import { useBottomBarScroll } from '../../hooks/useBottomBarScroll';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  FollowersFollowingScreen: {
    username: string;
    userId: string;
    followersCount: number;
    followingCount: number;
    initialTab: 'followers' | 'following';
    isSelfProfile: boolean;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProfileScreenProps {
  route: {
    params: {
      isSelf: boolean;
      userId: string;
    };
  };
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ route }) => {
  const { isSelf, userId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { profile, loading, error, fetchProfile, fetchPosts, fetchSavedCollections } = useProfile();
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'saved'>('posts');
  const [currentUserId, setCurrentUserId] = useState<string>(userId);
  const [token, setToken] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  
  // Add bottom bar scroll handler
  const { handleScroll: handleBottomBarScroll } = useBottomBarScroll();
  
  useFocusEffect(
    useCallback(() => {
      const initializeProfile = async () => {
        try {
          setIsInitialized(false); // Reset initialization state
          if (isSelf) {
            const user = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('userToken');
            setToken(token || '');
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
            console.log("Fetching self profile with ID:", userData._id);
            console.log("profile::", profile);
            await Promise.all([
              fetchProfile(userData._id),
              fetchPosts(userData._id),
              // fetchSavedCollections(userData._id, false)
            ]);
          } else if (userId) {
            setCurrentUserId(userId);
            const token = await AsyncStorage.getItem('userToken');
            setToken(token || '');
            console.log("Fetching other user profile with ID:", userId);
            await Promise.all([
              fetchProfile(userId),
              fetchPosts(userId),
              // fetchSavedCollections(userId, true)
            ]);
          }
          setIsInitialized(true); // Mark as initialized after all data is loaded
        } catch (error) {
          console.error('Error initializing profile:', error);
        }
      };

      initializeProfile();
    }, [userId, isSelf])
  );

  const handleFollowToggle = () => {
    setIsFollowing((prev) => !prev);
    console.log('Follow toggled');
  };

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

  if (error || !profile) {
    return (
      <View style={styles.container}>
        <Text>Error: {error || 'Profile not found'}</Text>
      </View>
    );
  }

  if (loading || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.black} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isSelf && (
        <CustomFAB
          accountType={'personal'}
          isOpen={isFabOpen}
          onToggle={handleFabToggle}
        />
      )}
      <ScrollView 
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onTouchStart={handleScreenPress}
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 100 }} 
      >
        <Header
          isSelf={isSelf}
          onFollowToggle={handleFollowToggle}
          onBackPress={()=>{
            navigation.goBack()
          }}
          profile={profile}
          profileType={profile?.jobTitle ? 'business' : 'personal'}
          onSharePress={() => setOpenShare(true)}
        />
        <ProfileInfo
          isSelf={isSelf}
          name={profile.name}
          username={profile.username}
          bio={profile.bio}
          profileImage={profile.profileImage}
          stats={profile.stats}
          about={profile.about || ''}
          jobTitle={profile.jobTitle || ''}
          verified={profile.verified || false}
          sinceActive={profile.sinceActive || ''}
          onFollowersPress={() => navigation.navigate('FollowersFollowingScreen', {
            isSelfProfile: isSelf,
            username: profile.username,
            userId: currentUserId,
            followersCount: profile.stats.followers,
            followingCount: profile.stats.following,
            initialTab: 'followers',
          })}
          onFollowingPress={() => navigation.navigate('FollowersFollowingScreen', {
            isSelfProfile: isSelf,
            username: profile.username,
            userId: currentUserId,
            followersCount: profile.stats.followers,
            followingCount: profile.stats.following,
            initialTab: 'following',
          })}
          profile={profile}
        />
        {/* Tabs */}
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBarPill}>
            <TouchableOpacity
              style={[styles.tabBtn, selectedTab === 'posts' && styles.tabBtnActive]}
              onPress={() => setSelectedTab('posts')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, selectedTab === 'posts' && styles.tabTextActive]}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, selectedTab === 'saved' && styles.tabBtnActive]}
              onPress={() => setSelectedTab('saved')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, selectedTab === 'saved' && styles.tabTextActive]}>Saved</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Content */}
        {selectedTab === 'posts' ? (
          <PostTab userId={currentUserId} isSelf={isSelf} token={token} accountType={profile?.accountType} />
        ) : (
          <SavedTab userId={currentUserId} isSelf={isSelf} token={token} accountType={profile?.accountType}/>
        )}
      </ScrollView>

      <SharePostToChat
        feed={profile as any}
        openShare={openShare}
        setOpenShare={setOpenShare}
        isProfile={true}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBarContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  tabBarPill: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F4',
    borderRadius: 14,
    width: width * 0.7,
    alignSelf: 'center',
    height: 56,
    padding: 6,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 2,
  },
  tabText: {
    color: Color.black,
    fontFamily: FontFamilies.medium,
    fontSize: 14,
  },
  tabTextActive: {
    fontFamily: FontFamilies.bold,
    color: Color.black,
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
});
