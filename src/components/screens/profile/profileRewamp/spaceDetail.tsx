import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { del, get, post } from '../../../../services/dataRequest';
import { useFocusEffect } from '@react-navigation/native';
import { Color, FontFamilies } from '../../../../styles/constants';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostCard from '../../../../components/commons/cardComponents/postCard';
import ProjectCard from '../../../../components/commons/cardComponents/projectCard';
import VideoCard from '../../../../components/commons/cardComponents/videoCard';
import { setSaveStatus } from '../../../../redux/slices/saveSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { toggleLike as toggleLikeInLikeSlice } from '../../../../redux/slices/likeSlice';
import { toggleLike as toggleLikeInPostSlice } from '../../../../redux/slices/postSlice';
import { getInitials } from '../../../../utils/commonFunctions';

interface SpaceItem {
  totalItems: number;
  id: any;
  _id: string;
  name: string;
  visibility: string;
  thumbnails: string[];
  itemCount: number;
  description?: string;
  location?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  likes?: number;
  commentsCount?: number;
  owner?: {
    _id: string;
    profilePic?: string;
  };
  items: any[];
}

interface Profile {
  _id: string;
  profilePic?: string;
  username?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
}

interface SpaceDetailProps {
  route: {
    params: {
      item: SpaceItem;
      token?: string;
      profile?: Profile;
      isSelfProfile?: boolean;
    };
  };
  navigation: any;
}

const SpaceDetail = ({ route, navigation }: SpaceDetailProps) => {
  const { item, token, profile, isSelfProfile = false } = route.params || {};
  console.log("item :: 100 :: ", item);
  console.log("token :: 101 :: ", token);
  console.log("profile :: 102 :: ", profile);
  console.log("isSelfProfile :: 103 :: ", isSelfProfile);
  const [loading, setLoading] = useState(true);
  const [spaceData, setSpaceData] = useState<SpaceItem | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [isRendering, setIsRendering] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const dispatch = useDispatch();
  const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);

  // Get like states from Redux
  const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
  const likeCounts = useSelector((state: RootState) => state.like.likeCounts);

  const fetchSpaceData = async () => {
    try {
      if (!token) {
        console.error('Token is required to fetch space data');
        return;
      }
      setIsRendering(true);
      const response = await get(
        `collections/get/${item?._id}`,
        {},
        token,
      );
      console.log("response 98",response?.collection);
      if (response && response.collection) {
        setSpaceData(response?.collection);
        // Check if current user is the owner
        const account_ = await AsyncStorage.getItem('user');
        const currentUser = JSON.parse(account_ || '{}')._id;
        if (response?.collection?.owner?._id === currentUser) {
          setCanEdit(true);
        }
      }
    } catch (error) {
      console.error('Error fetching space data:', error);
    } finally {
      setLoading(false);
      // Add a small delay to ensure smooth rendering
      setTimeout(() => {
        setIsRendering(false);
      }, 500);
    }
  };

  useEffect(() => {
    fetchSpaceData();
  }, [item._id, token]);

  useFocusEffect(
    useCallback(() => {
      fetchSpaceData();
    }, [item._id, token])
  );

  const handleShare = async () => {
    try {
      const shareMessage = `Check out this saved collection: ${item?.name}`;
      // You can use a sharing library like react-native-share or any other method to share
      await Share.share({ message: shareMessage });
    } catch (error) {
      console.error('Error sharing saved collection:', error);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditSpaces', {
      data: spaceData,
      token,
      profile,
      isSelfProfile
    });
  };

  const handleLikePress = async (item: any) => {
    if (!item || !item._id) {
      console.error('Invalid item or missing ID');
      return;
    }

    // Check if the item is a project and use the specific handler
    if (item.itemType === 'project') {
      return handleProjectLike(item);
    }

    const itemId = item._id;

    try {
      console.log('Like pressed in SpaceDetail for post:', itemId);

      // Get current like state from Redux or item
      const isCurrentlyLiked = likedPosts[itemId] !== undefined
        ? likedPosts[itemId]
        : item.isLiked || false;

      const currentLikeCount = likeCounts[itemId] !== undefined
        ? likeCounts[itemId]
        : (item.likes || 0);

      console.log('Current like state:', isCurrentlyLiked);
      console.log('Current like count:', currentLikeCount);

      // Update Redux state (optimistic update)
      dispatch(toggleLikeInLikeSlice(itemId));

      // Update local state in space data
      setSpaceData(prevData => {
        if (!prevData) return null;

        return {
          ...prevData,
          items: prevData.items.map(spaceItem =>
            spaceItem._id === itemId
              ? {
                ...spaceItem,
                isLiked: !isCurrentlyLiked,
                likes: isCurrentlyLiked ? Math.max(0, (spaceItem.likes || 0) - 1) : (spaceItem.likes || 0) + 1
              }
              : spaceItem
          )
        };
      });

      // Use the specified endpoint for the API call
      console.log('Making API call to:', `ugc/toggle-like/${itemId}`);

      // Make API call
      const response = await post(`ugc/toggle-like/${itemId}`, {});
      console.log('API response:', response);

      if (!response || response.status !== 200) {
        console.log('API call failed, reverting state');

        // Revert Redux state on failure
        dispatch(toggleLikeInLikeSlice(itemId));

        // Revert local state
        setSpaceData(prevData => {
          if (!prevData) return null;

          return {
            ...prevData,
            items: prevData.items.map(spaceItem =>
              spaceItem._id === itemId
                ? {
                  ...spaceItem,
                  isLiked: isCurrentlyLiked,
                  likes: currentLikeCount
                }
                : spaceItem
            )
          };
        });

        throw new Error('Failed to update like status');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  // Dedicated function to handle project likes
  const handleProjectLike = async (project: any) => {
    if (!project || !project._id) {
      console.error('Invalid project or missing ID');
      return;
    }

    const projectId = project._id;

    try {
      console.log('Like pressed in SpaceDetail for project:', projectId);

      // Get current like state from Redux or item
      const isCurrentlyLiked = likedPosts[projectId] !== undefined
        ? likedPosts[projectId]
        : project.isLiked || false;

      const currentLikeCount = likeCounts[projectId] !== undefined
        ? likeCounts[projectId]
        : (project.likes || 0);

      console.log('Current project like state:', isCurrentlyLiked);
      console.log('Current project like count:', currentLikeCount);

      // Update Redux state (optimistic update)
      dispatch(toggleLikeInLikeSlice(projectId));
      // dispatch(toggleLikeInPostSlice(projectId));

      // Update local state in space data
      setSpaceData(prevData => {
        if (!prevData) return null;

        return {
          ...prevData,
          items: prevData.items.map(spaceItem =>
            spaceItem._id === projectId
              ? {
                ...spaceItem,
                isLiked: !isCurrentlyLiked,
                likes: isCurrentlyLiked ? Math.max(0, (spaceItem.likes || 0) - 1) : (spaceItem.likes || 0) + 1
              }
              : spaceItem
          )
        };
      });

      // Use the correct project endpoint for the API call
      console.log('Making API call to:', `project/toggle-like/?projectId=${projectId}`);

      // Make API call to project-specific endpoint
      const response = await post(`project/toggle-like/?projectId=${projectId}`, {});
      console.log('Project API response:', response);

      if (!response || response.status !== 200) {
        console.log('Project API call failed, reverting state');

        // Revert Redux state on failure
        dispatch(toggleLikeInLikeSlice(projectId));
        // dispatch(toggleLikeInPostSlice(projectId));

        // Revert local state
        setSpaceData(prevData => {
          if (!prevData) return null;

          return {
            ...prevData,
            items: prevData.items.map(spaceItem =>
              spaceItem._id === projectId
                ? {
                  ...spaceItem,
                  isLiked: isCurrentlyLiked,
                  likes: currentLikeCount
                }
                : spaceItem
            )
          };
        });

        throw new Error('Failed to update project like status');
      }
    } catch (error) {
      console.error('Error toggling project like:', error);
      Alert.alert('Error', 'Failed to update project like status');
    }
  };

  const handleImagePress = (imageUrl: string, item?: any) => {
    if (!spaceData) return;

    // Define filter differently based on item type
    let filterFunction;
    if (item?.itemType === 'project') {
      // For projects, just include the project item itself
      filterFunction = () => false; // We'll use [item] directly
    } else if (item?.itemType === 'video') {
      // For videos, just include the video item itself
      filterFunction = () => false; // We'll use [item] directly
    } else {
      // For photos, filter out projects AND videos
      filterFunction = (itm: any) => itm.itemType !== 'project' && itm.itemType !== 'video';
    }

    let images;
    
    // Make sure we always have an array for images
    if (item?.itemType === 'project' || item?.itemType === 'video') {
      // Make sure item.contentUrl is always treated as an array
      images = Array.isArray(item?.contentUrl) ? item?.contentUrl : [item?.contentUrl];
    } else {
      // For photos, filter as before
      images = spaceData?.items?.filter(filterFunction).map((img: { contentUrl: any }) => img.contentUrl);
    }

    // Ensure images is always an array
    if (!Array.isArray(images)) {
      images = [];
      console.warn('Images was not an array, defaulting to empty array');
    }

    const initialIndex = images.findIndex((img: string | string[]) => {
      if (typeof img === 'string') return img === imageUrl;
      if (Array.isArray(img)) return img.includes(imageUrl);
      return false;
    });

    console.log("item type:", item?.itemType, "images:", images);

    // Get all items that match the images, filtering out projects and videos when needed
    const allItems = item?.itemType === 'project' || item?.itemType === 'video'
      ? [item] // For projects or videos, we only have one item
      : spaceData?.items?.filter(filterFunction);
    
    // Create a structured array of items with all necessary details
    const items = (Array.isArray(images) ? images : []).map((img: string) => {
      // Find the corresponding item for this image
      const correspondingItem = allItems?.find((itm: any) => {
        if (typeof itm.contentUrl === 'string') {
          return itm.contentUrl === img;
        }
        if (Array.isArray(itm.contentUrl)) {
          return itm.contentUrl.includes(img);
        }
        return false;
      });
      
      return {
        imageUrl: img,
        id: correspondingItem?._id || item?._id || '',
        userDetails: {
          id: correspondingItem?.posterDetails?._id || item?.posterDetails?._id || '',
          name: correspondingItem?.posterDetails?.firstName || item?.posterDetails?.firstName || '',
          username: correspondingItem?.posterDetails?.username || item?.posterDetails?.username || '',
          location: spaceData?.location || '',
          profilePic: correspondingItem?.posterDetails?.profilePic || item?.posterDetails?.profilePic,
          isLiked: correspondingItem?.likedBy?.length > 0 || item?.isLiked || false,
          isSaved: false,
          likeCount: correspondingItem?.likedBy?.length || item?.likes || 0,
          commentCount: correspondingItem?.commentsCount || item?.commentsCount || 0,
          accountType: correspondingItem?.posterDetails?.accountType || item?.posterDetails?.accountType || '',
        },
        caption: correspondingItem?.caption || item?.caption || ''
      };
    });
    
    // Navigate based on item type
    if (item?.itemType === 'video') {
      // For videos, navigate to VideoFullScreenRewamped
      navigation.navigate('VideoFullScreenRewamped', {
        items,
        initialIndex: initialIndex >= 0 ? initialIndex : 0,
        type: item?.itemType || 'post',
        projectId: item?._id,
        token: token
      });
    } else if (item?.itemType === 'project') {
      // For projects, navigate to FullScreenImageView
      navigation.navigate('FullScreenImageView', {
        items,
        initialIndex: initialIndex >= 0 ? initialIndex : 0,
        type: item?.itemType || 'post',
        projectId: item?._id,
        token: token
      });
    } else {
      // For photos, navigate to FullScreenLayout
      // (but only with photo items, no projects or videos)
      navigation.navigate('FullScreenLayout', {
        items,
        initialIndex: initialIndex >= 0 ? initialIndex : 0,
        type: item?.itemType || 'post',
        projectId: item?._id,
        token: token
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;

    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your space?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await del(`collections/remove-item/${id}`);
              if (response.status === 200) {
                // Update Redux save status
                dispatch(setSaveStatus({ postId: id, isSaved: false }));
                // Update the space data by removing the unsaved item
                setSpaceData(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    items: prev.items.filter(item => item._id !== id),
                    totalItems: prev.totalItems - 1
                  };
                });
              }
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item from space. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSavePress = async (id: string, item?: any) => {
    if (!id) return;
    
    try {
      console.log('Save pressed for item:', id);
      
      // If this is a self profile, always use the delete function
      if (isSelfProfile) {
        handleDelete(id);
        return;
      }
      
      // Get current save state from Redux or item
      const isCurrentlySaved = savedPosts[id] !== undefined 
        ? savedPosts[id] 
        : (item?.isSaved || false);
      
      console.log('Current save state:', isCurrentlySaved);
      
      if (isCurrentlySaved) {
        // If already saved, perform unsave operation
        // Update Redux state immediately for better UX
        dispatch(setSaveStatus({ postId: id, isSaved: false }));
        
        // Make API call to remove from collection
        const response = await del(`collections/remove-item/${id}`);
        console.log("[SpaceDetail] Unsave response:", response);
        
        if (response.status !== 200) {
          // If API call fails, revert changes
          dispatch(setSaveStatus({ postId: id, isSaved: true }));
          throw new Error('Failed to remove from collection');
        }
      } else {
        // For direct saves without collection selection
        // Update Redux state immediately for better UX
        dispatch(setSaveStatus({ postId: id, isSaved: true }));
        
        // Determine the correct item type
        const itemType = item?.itemType || 'photo';
        
        // Use the correct endpoint based on item type
        let endpoint = 'collections/toggle-save';
        
        if (item?.itemType === 'project') {
          endpoint = 'collections/project/toggle-save';
        }
        
        // Make API call
        const response = await post(`${endpoint}/${id}`, {});
        console.log('API response:', response);
        
        if (response.status !== 200) {
          // If API call fails, revert changes
          dispatch(setSaveStatus({ postId: id, isSaved: false }));
          throw new Error('Failed to save item');
        }
      }
      
      // Update local state in space data
      setSpaceData(prevData => {
        if (!prevData) return null;
        
        return {
          ...prevData,
          items: prevData.items.map(spaceItem =>
            spaceItem._id === id
              ? {
                ...spaceItem,
                isSaved: !isCurrentlySaved
              }
              : spaceItem
          )
        };
      });
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to update save status');
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const isSaved = savedPosts[item._id] !== undefined ? savedPosts[item._id] : item.isSaved;
    const isLiked = likedPosts[item._id] !== undefined ? likedPosts[item._id] : item.isLiked;
    const likeCount = likeCounts[item._id] || item.likes || 0;
    console.log("item 431", item);
    console.log("item.itemType", item.itemType);
    if (item.itemType === 'project') {
      return (
        <ProjectCard
          key={item._id}
          title={item?.caption || ''}
          images={item?.contentUrl}
          style={styles.photoContainer}
          onPress={() => handleImagePress(item?.contentUrl, item)}
          showIcons={true}
          showTitle={false}
          showItemCount={true}
          itemCount={item?.contentUrl?.length || 0}
          isSaved={isSaved}
          isLiked={isLiked}
          id={item._id}
          onSavePress={(id) => handleSavePress(id, item)}
          onLikePress={() => handleLikePress(item)}
        />
      );
    } else if (item.itemType === 'video') {
      return (
        <VideoCard
          key={item._id}
          item={{
            _id: item._id,
            contentUrl: item.contentUrl,
            coverImage: item.coverImage
          }}
          style={styles.photoContainer}
          onPress={() => handleImagePress(item.contentUrl, item)}
          isLiked={isLiked}
          isSaved={isSaved}
          onLikePress={() => handleLikePress(item)}
          onSavePress={() => handleSavePress(item._id, item)}
          loading={loading}
        />
      );
    } else {
      // For PostCard, we need to include isSaved and isLiked in the item object
      return (
        <PostCard
          key={item._id}
          item={{
            ...item,
            _id: item._id,
            contentUrl: item.contentUrl,
            isSaved: isSaved,
            isLiked: isLiked
          }}
          style={styles.photoContainer}
          onPress={() => handleImagePress(item.contentUrl, item)}
          id={item._id}
          onSavePress={(id) => handleSavePress(id, item)}
          onLikePress={() => handleLikePress(item)}
        />
      );
    }
  }, [savedPosts, likedPosts, likeCounts, loading, handleImagePress, handleDelete, handleLikePress, handleSavePress, isSelfProfile]);

  const renderPhotos = () => {
    if (!spaceData?.items || spaceData.items.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts in this space yet</Text>
        </View>
      );
    }

    return spaceData.items.map((item: any, index: number) => {
      console.log("item 503",item);      
      // Check if the item is saved
      const isSaved = savedPosts[item._id] !== undefined ? savedPosts[item._id] : item.isSaved;

      // Check if the item is liked from Redux or item state
      const isLiked = likedPosts[item._id] !== undefined ? likedPosts[item._id] : item.isLiked;
      if (item.itemType === 'project') {
        return (
          <ProjectCard
            key={item._id}
            title={item?.caption || ''}
            images={item?.contentUrl}
            style={styles.photoContainer}
            onPress={() => handleImagePress(item?.contentUrl, item)}
            showIcons={true}
            showTitle={false}
            showItemCount={true}
            itemCount={item?.contentUrl?.length || 0}
            isSaved={isSaved}
            isLiked={isLiked}
            id={item._id}
            onSavePress={(id) => handleSavePress(id, item)}
            onLikePress={() => handleLikePress(item)}
          />
        );
      }
      else if (item.itemType === 'video') {
        return (
          <VideoCard
            key={item._id}
            item={{
              _id: item._id,
              contentUrl: item.contentUrl,
              coverImage: item.coverImage
            }}
            style={styles.photoContainer}
            onPress={() => handleImagePress(item.contentUrl, item)}
            isLiked={isLiked}
            isSaved={isSaved}
            onLikePress={() => handleLikePress(item)}
            onSavePress={() => handleSavePress(item._id, item)}
            loading={loading}
          />
        );
      }
      else {
        // For PostCard, we need to include isSaved and isLiked in the item object
        // since it expects them in the item prop, not as separate props
        return (
          <PostCard
            key={item._id}
            item={{
              ...item,
              _id: item._id,
              contentUrl: item.contentUrl,
              isSaved: isSaved,
              isLiked: isLiked
            }}
            style={styles.photoContainer}
            onPress={() => handleImagePress(item.contentUrl, item)}
            id={item._id}
            onSavePress={(id) => handleSavePress(id, item)}
            onLikePress={() => handleLikePress(item)}
          />
        );
      }
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.black} />
          <Text style={styles.loadingText}>Loading space...</Text>
        </View>
      );
    }

    if (!spaceData) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Failed to load space data</Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.containerHeader}>
          <View style={styles.titleContainer}>
            {profile?.profilePic ? (
              <Image
                source={{ uri: profile.profilePic }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>
                  {getInitials(
                    profile?.username
                  )}
                </Text>
              </View>
            )}
            <Text style={styles.title}>
              {spaceData?.name || 'Space'}
            </Text>
            <View style={styles.subtitleContainer}>
              <Image
                source={spaceData?.visibility === 'private'
                  ? require('../../../../assets/icons/lockIcon.png')
                  : require('../../../../assets/icons/unlock.png')}
                style={styles.icon2}
              />
              <Text style={styles.subtitle}>
                {(spaceData.visibility || 'public').charAt(0).toUpperCase() + (spaceData.visibility || 'public').slice(1)}
              </Text>
            </View>
            <Text style={styles.countText}>
              {spaceData?.totalItems || 0} {spaceData?.totalItems === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.photoGrid}>
          {renderPhotos()}
        </ScrollView>
      </>
    );
  };

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);


  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {isRendering ? (
        <View style={styles.fullScreenLoader}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color={Color.black} />
            <Text style={styles.loadingText}>Loading space...</Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
              <View style={styles.iconWrapper}>
                <Image
                  source={require('../../../../assets/header/backIcon.png')}
                  style={styles.icon}
                />
              </View>
            </TouchableOpacity>

            {/* <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconWrapper} onPress={handleShare}>
                <Image source={require('../../../../assets/icons/shareIcon.png')} style={styles.icon} />
              </TouchableOpacity> */}

              {canEdit && (
                <TouchableOpacity style={styles.iconWrapper} onPress={handleEdit}>
                  <Image source={require('../../../../assets/icons/editIcon.png')} style={styles.icon} />
                </TouchableOpacity>
              )}
            </View>
          {/* </View> */}

          {renderContent()}
        </>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    ...Platform.select({
      ios: {
        paddingTop: 60,
      },
      android: {
        paddingTop: 10,
      },
    }),
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomColor: Color.black,
    borderBottomWidth: 0.17,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 12,
    marginLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A6A6A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  containerHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
  },
  titleContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  title: {
    fontFamily: FontFamilies.semibold,
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  icon2: {
    width: 12,
    height: 12,
    marginRight: 5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    fontWeight: '400',
    color: '#81919E',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  photoContainer: {
    width: (Dimensions.get('window').width - 40) / 2,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: Dimensions.get('window').width * 0.5,
    borderRadius: 12,
  },
  imageCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    height: 22,
    width: 38,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
    right: 10,
    zIndex: 1,
    borderRadius: 16,
  },
  imageCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: Dimensions.get('window').width * 0.5,
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
  },
  playIcon: {
    width: 40,
    height: 40,
    tintColor: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#81919E',
    fontFamily: FontFamilies.regular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#81919E',
    fontFamily: FontFamilies.regular,
  },
  countText: {
    marginTop: 4,
    fontSize: 14,
    color: '#81919E',
    fontFamily: FontFamilies.regular,
  },
  fullScreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontFamily: FontFamilies.semibold,
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1E1E',
    marginLeft: 10,
  },
  initialsAvatar: {
    width: 36,
    height: 36,
    borderRadius: 25,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  initialsText: {
    color: Color.white,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  deleteIcon: {
    tintColor: '#FF3B30',
  },
});

export default SpaceDetail;