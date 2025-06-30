import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {get, post} from '../../services/dataRequest';
import {useNavigation} from '@react-navigation/native';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';
import { getInitials } from '../../utils/commonFunctions';

const LikesBottomSheet = ({likeCount, onClose, token, postId}: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [isFollowing, setIsFollowing] = useState(false);
  // Fetch likes API
  const fetchLikes = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await get(
        `ugc/${postId}/likes?page=${page}&limit=50`,
        {},
        token,
      );
      console.log('response :: 30 ::', response?.users);

      if (response?.users) {
        const newUsers = response?.users;

        // Update followingMap based on the fetched users
        const updatedFollowingMap = newUsers.reduce((map, user) => {
          map[user.userId] = user.isFollowing; // Assuming user.isFollowing indicates if the user is followed
          return map;
        }, {});

        setFollowingMap(prevMap => ({ ...prevMap, ...updatedFollowingMap }));
        setUsers((prevUsers: any) => [...prevUsers, ...newUsers]);
        setPage(prevPage => prevPage + 1);
        setHasMore(newUsers.length === 10); // If fewer than 10 users are fetched, stop further loading
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, postId, token]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const navigation = useNavigation();
  const routeToProfile = (id: any) => {
    console.log('id :::', id);
    navigation.navigate('OtherUserProfile' as never, {userId: id});
  };

  const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
    console.log('userId :::', userId);
    console.log('isFollowing :::', isFollowing);
    const action = isFollowing ? 'unfollow' : 'follow';
    console.log('action :::', action);
    try {
      const response = await post(`user/toggle-follow/${userId}`, {});
      console.log('response :::', response);  
      if (response.status === 200) {
        // Update the followingMap based on the action
        setFollowingMap(prevMap => ({ ...prevMap, [userId]: !isFollowing }));
      } else {
        console.error(`Failed to ${action} the user`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  // Render each user
  const renderUser = ({item}: any) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => routeToProfile(item?.userId)}>
      {item?.profilePic ? (
        <Image
          source={{uri: item?.profilePic}}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.initialsAvatar}>
          <Text style={styles.initialsText}>
            {getInitials(
              item?.username,
            )}
          </Text>
        </View>
      )}

      <View style={styles.userInfo}>
        <Text style={styles.name}>
          {item?.businessName || item?.firstName + ' ' + item?.lastName}
        </Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      <TouchableOpacity 
        style={followingMap[item?.userId] ? styles.followingButton : styles.followButton} 
        onPress={() => handleFollowToggle(item?.userId, followingMap[item?.userId])}>
        <Text style={followingMap[item?.userId] ? styles.followingText : styles.followText}>
          {followingMap[item?.userId] ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={item => item?._id?.toString()}
        renderItem={renderUser}
        onEndReached={fetchLikes}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color={Color.black} />
            </View>
          )
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No likes yet</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  initialsAvatar: {
    width: 50,
    height: 50,
    marginRight: 10,
    backgroundColor: Color.black,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 14,
    fontWeight: '400',
    color: Color.white,
    fontFamily: FontFamilies.medium,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '400',
  },
  username: {
    fontSize: 12,
    color: '#888',
  },
  followButton: {
    backgroundColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followText: {
    color: Color.white,
    fontSize: FontSizes.extraSmall,
    fontFamily: FontFamilies.medium,
  },
  followingButton: {
    backgroundColor: Color.secondarygrey,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingText: {
    color: Color.black,
    fontSize: FontSizes.extraSmall,
    fontFamily: FontFamilies.medium,
  },
  loader: {
    marginVertical: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#F00',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '400',
  },
});

export default LikesBottomSheet;
