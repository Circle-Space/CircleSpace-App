import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useProfile} from '../../hooks/useProfile';
import {User} from '../../types/profile';
import {SafeAreaView} from 'react-native-safe-area-context';
import { routeToOtherUserProfile } from '../screens/notifications/routingForNotification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInitials, getName, getUsername } from '../../utils/commonFunctions';
import { Color, FontFamilies } from '../../styles/constants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateFollowStatus, setFollowCounts } from '../../redux/slices/followSlice';

const {width} = Dimensions.get('window');

interface FollowersFollowingScreenProps {
  navigation: any;
  route: {
    params: {
      username: string;
      isSelfProfile: boolean;
      userId: string;
      followersCount: number;
      followingCount: number;
      initialTab: 'followers' | 'following';
    };
  };
}

const FollowersFollowingScreen: React.FC<FollowersFollowingScreenProps> = ({
  navigation,
  route,
}) => {
  const {username, userId, followersCount, followingCount, initialTab,isSelfProfile} =
    route.params;
  const [selectedTab, setSelectedTab] = useState<'followers' | 'following'>(
    initialTab,
  );
  console.log("isSelfProfile :: 100 :: ", isSelfProfile);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useDispatch();
const followedUsers = useSelector((state: RootState) => state.follow.followedUsers);
const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const {
    followers,
    following,
    followersLoading,
    followingLoading,
    followersError,
    followingError,
    fetchFollowersFollowing,
    toggleFollow,
  } = useProfile();
  console.log('followers screen', followers);
  console.log('following screen', following);

  // Load data when tab changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchFollowersFollowing(userId, selectedTab, 1);
        if (response) {
          setHasMore(response.currentPage < response.totalPages);
          setCurrentPage(response.currentPage);

          // Update Redux state if this is self profile
          if (isSelfProfile) {
            if (selectedTab === 'followers') {
              dispatch(setFollowCounts({
                followers: response.totalUsers || followersCount,
                following: followingCount
              }));
            } else {
              dispatch(setFollowCounts({
                followers: followersCount,
                following: response.totalUsers || followingCount
              }));
            }

            // Update follow status for each user
            const users = response.users || [];
            users.forEach((user: User) => {
              dispatch(updateFollowStatus({
                userId: user._id,
                isFollowed: user.isFollowing || false
              }));
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [selectedTab, userId, isSelfProfile]);

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userObj = JSON.parse(user);
        setCurrentUserId(userObj._id);
      }
    };
    fetchCurrentUserId();
  }, []);

  const handleTabChange = (tab: 'followers' | 'following') => {
    if (tab !== selectedTab) {
      setSelectedTab(tab);
      setCurrentPage(1);
      setHasMore(true);
    }
  };

  const loadMore = async () => {
    if (!hasMore) return;

    const nextPage = currentPage + 1;
    try {
      const response = await fetchFollowersFollowing(
        userId,
        selectedTab,
        nextPage,
      );
      if (response) {
        setCurrentPage(nextPage);
        setHasMore(response.currentPage < response.totalPages);

        // Update Redux state for new users if this is self profile
        if (isSelfProfile) {
          const users = response.users || [];
          users.forEach((user: User) => {
            dispatch(updateFollowStatus({
              userId: user._id,
              isFollowed: user.isFollowing || false
            }));
          });
        }
      }
    } catch (error) {
      console.error('Error loading more:', error);
    }
  };

  const handleFollowToggle = async (id: string) => {
    try {
      const success = await toggleFollow(id);
      if (success) {
        const newFollowStatus = !followedUsers[id];
        
        // Update Redux state
        dispatch(updateFollowStatus({ 
          userId: id, 
          isFollowed: newFollowStatus 
        }));

        // Update follow counts in Redux if this is self profile
        if (isSelfProfile) {
          if (selectedTab === 'followers') {
            dispatch(setFollowCounts({
              followers: followersCount,
              following: followingCount + (newFollowStatus ? 1 : -1)
            }));
          } else {
            dispatch(setFollowCounts({
              followers: followersCount + (newFollowStatus ? 1 : -1),
              following: followingCount
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const filteredUsers = (
    selectedTab === 'followers' ? followers : following
  ).filter(
    (user: User) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  const routeToProfile = async (id: string, accountType: string) => {
    if (!id) return;

    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('UserId');
      // const screen = userId !== id ? 'OtherUserProfile' : 'Profile';

      if (id === userId) {
        // If it's the user's own profile, navigate through BottomBar
        navigation.navigate('BottomBar', {
          screen: 'ProfileScreen',
          params: {
            isSelf: true
          }
        });
      } else {
        // Check if the profile is personal or professional
        
        if (accountType === 'professional') {
          // Navigate to business profile screen
          navigation.navigate('otherBusinessScreen', {
            userId: id,
            isSelf: false
          });
        } else {
          // Navigate to personal profile screen
          navigation.navigate('otherProfileScreen', {
            userId: id,
            isSelf: false
          });
        }
      }
    }
    catch (error) {}
    
  };

  const renderItem = ({ item }: { item: User }) => {
    const showInitials = !item.profilePic;
    const initials = getInitials(item?.username);

    return (
      <Pressable
        onPress={() => {
          routeToProfile(item?._id,item?.accountType);
        }}
        style={styles.userTile}>
        <View style={styles.avatarContainer}>
          {showInitials ? (
            <View style={[styles.avatar, styles.initialsContainer]}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          ) : (
            <Image
              source={{uri: item.profilePic}}
              style={styles.avatar}
            />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>
            {getName(item.businessName || `${item.firstName} ${item.lastName}`.trim(), 15)}
          </Text>
          <Text style={styles.username}>@{getUsername(item.username, 15)}</Text>
        </View>
        {item._id !== currentUserId && (
        <TouchableOpacity
          style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
          onPress={() => handleFollowToggle(item._id)}>
          <Text
            style={[
              styles.followBtnText,
              item.isFollowing && styles.followingBtnText,
            ]}>
            {item.isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
        )}
      </Pressable>
    );
  };

  if (followersLoading || followingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (followersError || followingError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {followersError || followingError || 'An error occurred'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}>
            <Icon name="chevron-back" size={26} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{username}</Text>
          <View style={{width: 32}} />
        </View>

        <View style={styles.tabBarContainer}>
          <View style={styles.tabBarPill}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                selectedTab === 'followers' && styles.tabBtnActive,
              ]}
              onPress={() => handleTabChange('followers')}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'followers' && styles.tabTextActive,
                ]}>
                {followersCount} Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                selectedTab === 'following' && styles.tabBtnActive,
              ]}
              onPress={() => handleTabChange('following')}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'following' && styles.tabTextActive,
                ]}>
                {followingCount} Following
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBarWrapper}>
          <Icon
            name="search"
            size={22}
            color="#222"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 24}}
          // onEndReached={loadMore}
          // onEndReachedThreshold={0.5}
        />
      </View>
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
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 0,
    marginTop: 12,
    marginBottom: 12,
  },
  tabBarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    padding: 6,
    width: width * 0.7,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 2,
  },
  tabText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    fontWeight: '700',
    color: '#111',
  },
  userTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
  },
  initialsContainer: {
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: Color.white,
    fontSize: 16,
    fontFamily: FontFamilies.regular,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  username: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 7,
    minWidth: 100,
    alignItems: 'center',
  },
  followingBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  followBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  followingBtnText: {
    color: '#000',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 2,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    paddingLeft: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    color: '#ED4956',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FollowersFollowingScreen;

