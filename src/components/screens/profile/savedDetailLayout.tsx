import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { get, del, post } from '../../../services/dataRequest';
import { Divider } from 'react-native-paper';
import CustomAlertModal from '../../commons/customAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditBoardModal from './editBoardModal';
import { useFocusEffect } from '@react-navigation/native';
import BackButton from '../../commons/customBackHandler';
import { Color, FontFamilies } from '../../../styles/constants';
import { Share } from 'react-native';
import Toast from 'react-native-toast-message';
import Video from 'react-native-video';

interface SavedData {
  id: string;
  collectionName: string;
  visibility: string;
  posts: Array<{
    _id: string;
    contentUrl: string | string[];
    contentType: string;
  }>;
  boardOwner: string;
  postsCount: number;
  description: string;
}

const SavedDetailedLayout = ({ route, navigation }: any) => {
  const { data, token, profile, isSelfProfile=false } = route.params || {};
  const [savedData, setSavedData] = useState<SavedData>({} as SavedData);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const getSavedData = async () => {
    try {
      const response = await get(
        `collections/get/${data?.id}`,
        {},
        token,
      );
      console.log('response 46 :::savedDetailLayout', response);
      console.log('items :: ', response.collection.items);
      console.log("isSelfProfile",isSelfProfile);      
      if (response && response.collection) {
        // Transform the response to match the expected SavedData interface
        const transformedData = {
          id: response.collection.id,
          collectionName: response.collection.name,
          visibility: response.collection.visibility || 'public',
          posts: response.collection.items || [],
          boardOwner: response.collection.owner._id,
          postsCount: response.collection.totalItems || 0,
          description: response.collection.description
        };
        setSavedData(transformedData);
        const account_ = await AsyncStorage.getItem('user');
        const currentUser = JSON.parse(account_ || '{}')._id;
        if (response.collection.owner._id === currentUser) {
          setCanEdit(true);
        }
      }
    } catch (error) {
      console.error('Error fetching saved data:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    getSavedData();
  }, []);

  // Fetch fresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getSavedData();
    }, [])
  );

  const handleUnsavePost = async (postId: string) => {
    try {
      const response = await del(`collections/remove-item/${postId}`);
      console.log('response :: 85 :: ', response);

      if (response && response.message === 'Item removed from all collections successfully') {
        setSavedData((prevState: SavedData) => ({
          ...prevState,
          posts: prevState.posts.filter((post) => post._id !== postId)
        }));
        // Toast.show({
        //   type: 'info',
        //   text1: 'Post Unsaved',
        //   visibilityTime: 1000,
        //   position: 'bottom',
        // });
      } else {
        throw new Error('Failed to unsave the post');
      }
    } catch (error) {
      console.error('Error unsaving post:', error);
      // Toast.show({
      //   type: 'error',
      //   text1: 'Failed to unsave post',
      //   visibilityTime: 2000,
      //   position: 'bottom',
      // });
    }
  };

  const renderPhotos = () => {
    return savedData?.posts?.map((post: any) => {
      // For project items, use the thumbnailUrl or first contentUrl
      const imageUrl = post.thumbnailUrl || (Array.isArray(post.contentUrl) ? post.contentUrl[0] : post.contentUrl);
      console.log("imageUrl :: 105 :: ", imageUrl);
      const isProject = post.itemType === 'project';
      const imageCount = isProject && Array.isArray(post.contentUrl) ? post.contentUrl.length : 0;
      const isVideo = imageUrl?.toLowerCase().endsWith('.mp4') || imageUrl?.toLowerCase().endsWith('.mov');
      
      return (
        <TouchableOpacity
          key={post._id}
          style={styles.photoContainer}
          onPress={() => navigateToSinglePost(post)}>
          {isVideo ? (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: imageUrl }}
                style={styles.photo}
                paused={true}
                resizeMode="cover"
                repeat={false}
              />
              <View style={styles.playIconContainer}>
              <Icon name="play-circle" size={40} color="white" />
              </View>
            </View>
          ) : (
            <Image source={{ uri: imageUrl }} style={styles.photo} />
          )}
          {isProject && imageCount > 0 && (
            <View style={styles.imageCount}>
              <Text style={styles.imageCountText}>1/{imageCount}</Text>
            </View>
          )}
          {
            isSelfProfile && (
              <TouchableOpacity
                style={styles.unsaveButton}
                onPress={() => handleUnsavePost(post._id)}>
                <Image
                  source={require('../../../assets/postcard/saveFillIcons.png')}
                  style={styles.unsaveIcon}
                />
              </TouchableOpacity>
            )
          }
        </TouchableOpacity>
      );
    });
  };

  const navigateToSinglePost = async (post: any) => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (!savedToken) return;

      if (post.itemType === 'project') {
        const response = await get(`project/get-project/${post._id}`, undefined, savedToken);
        if (response?.status === 200 && response?.project) {
          navigation.navigate('ProjectDetail', {
            feed: response.project,
            accountType: response.project?.accountType,
            loggedInUserId: profile?._id,
            token: savedToken,
            pageName: 'saved'
          });
        }
      } else {
        const response = await get(`ugc/get-specific-ugc/${post._id}`, undefined, savedToken);
        console.log("response :: 200 :: ", response);
        if (response?.ugcs?.length > 0) {
          navigation.navigate('PostDetail', {
            feed: response.ugcs[0],
            accountType: response.ugcs[0]?.accountType,
            loggedInUserId: profile?._id,
            token: savedToken,
            pageName: 'saved',
            userDetails: {
              username: response.ugcs[0]?.posterDetails?.username || '',
              location: response.ugcs[0]?.location || '',
              profilePic: response.ugcs[0]?.posterDetails?.profilePic,
            }
          });
        }
      }
    } catch (error) {
      console.error('Error navigating:', error);
    }
  };

  const routeToProfile = async () => {
    try {
      const account_ = await AsyncStorage.getItem('user');
      const currentUser = JSON.parse(account_ || '{}')._id;
      navigation.navigate('Profile', { id: currentUser });
    } catch (error) {
      console.error('Error routing to profile:', error);
    }
  };

  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  const handleClose = () => {
    setDeleteMenuVisible(false);
  };

  const handleConfirmDelete = async () => {
    setMenuVisible(false);
    const id = savedData?.id;
    const res = await del(`ugc/delete-saved-collection`, id);
    if (res) {
      setDeleteMenuVisible(false);
      routeToProfile();
    } else {
      Alert.alert('Something went wrong');
      setDeleteMenuVisible(false);
    }
  };

  const handleMenuOptionSelect = (option: string) => {
    setMenuVisible(false);
    switch (option) {
      case 'delete':
        setDeleteMenuVisible(true);
        break;
      case 'edit':
        setEditModalVisible(true);
        break;
      case 'share':
        handleShareSavedCollection();
        break;
      case 'copy':
        console.log('Copy link selected');
        break;
      default:
        break;
    }
  };

  const handleSaveChanges = async (updatedData: {
    collectionName: string;
    visibility: string;
  }) => {
    console.log(
      'Save changes',
      updatedData.collectionName,
      updatedData.visibility,
    );
    setSavedData(prevState => ({
      ...prevState,
      collectionName: updatedData.collectionName,
      visibility: updatedData.visibility,
    }));
    const payload = {
      collectionId: savedData.id,
      newName: updatedData.collectionName,
      newVisibility: updatedData.visibility, // or "public"
    };
    const res = await post('ugc/update-saved-collection', payload);
    console.log('Save changes', res);
    console.log(payload);
    setEditModalVisible(false);
  };

  const handleShareSavedCollection = async () => {
    try {
      const shareMessage = `Check out this saved collection: ${savedData.collectionName}`;
      // You can use a sharing library like react-native-share or any other method to share
      await Share.share({ message: shareMessage });
    } catch (error) {
      console.error('Error sharing saved collection:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.header}>
        {/* Left Icon */}
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { id: profile._id,tab: 'Saved' })}>
          {/* <BackButton /> */}
          <View style={styles.iconWrapper}>
          <Image
            source={require('../../../assets/header/backIcon.png')}
            style={styles.icon}
          />
        </View>
        </TouchableOpacity>

        {/* Right Icons */}
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconWrapper} onPress={handleShareSavedCollection}>
            <Image source={require('../../../assets/icons/shareIcon.png')} style={styles.icon} />
          </TouchableOpacity>

          {canEdit && (
            <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.navigate('EditSpaces', { data: savedData })}>
              <Image source={require('../../../assets/icons/editIcon.png')} style={styles.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.containerHeader}>
        <View style={styles.titleContainer}>
          {/* Display the profile picture above the title */}
          {profile?.profilePic && (
            <Image
              source={{ uri: profile.profilePic }}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.title}>
            {savedData?.collectionName || 'Saved Collection'}
          </Text>
          <View style={styles.subtitleContainer}>
            <Image
              source={savedData.visibility === 'private'
                ? require('../../../assets/icons/lockIcon.png')
                : require('../../../assets/icons/unlock.png')}
              style={styles.icon2}
            />
            <Text style={styles.subtitle}>
              {(savedData.visibility || 'public').charAt(0).toUpperCase() + (savedData.visibility || 'public').slice(1)}
            </Text>
          </View>
          {/* <Text style={styles.title}>by  {savedData.}</Text> */}
          {/* <Text style={styles.subtitle}>{savedData?.postsCount} Photos</Text> */}
        </View>
        {/* <TouchableOpacity onPress={handleMenuToggle} style={styles.menuButton}>
          <Icon name="more-vert" size={24} color="#000" />
        </TouchableOpacity> */}
      </View>

      {menuVisible && (
        <View style={styles.menu}>
          {/* Render Delete and Edit options only if canEdit is true */}
          {canEdit && (
            <>
              <TouchableOpacity
                onPress={() => handleMenuOptionSelect('delete')}
                style={styles.menuItem}>
                <Text style={[styles.menuItemText, styles.deleteText]}>
                  Delete Board
                </Text>
              </TouchableOpacity>
              <Divider />
              <TouchableOpacity
                onPress={() => handleMenuOptionSelect('edit')}
                style={styles.menuItem}>
                <Text style={styles.menuItemText}>Edit</Text>
              </TouchableOpacity>
              <Divider />
            </>
          )}

          {/* Always render Share, Copy link, and Cancel options */}
          <TouchableOpacity
            onPress={() => handleMenuOptionSelect('share')}
            style={styles.menuItem}>
            <Text style={styles.menuItemText}>Share to</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            onPress={() => handleMenuOptionSelect('copy')}
            style={styles.menuItem}>
            <Text style={styles.menuItemText}>Copy link</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            onPress={() => handleMenuOptionSelect('cancel')}
            style={styles.menuItem}>
            <Text style={styles.menuItemText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.photoGrid}>
        {renderPhotos()}
      </ScrollView>

      {/* Edit Modal */}
      <EditBoardModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        savedData={savedData} // Pass savedData to prefill the modal
        onSaveChanges={handleSaveChanges}
      />

      <CustomAlertModal
        visible={deleteMenuVisible}
        title="Delete Board"
        description="You can't recover your board afterward. Are you sure you want to delete this board?"
        buttonOneText="Delete"
        buttonTwoText="Cancel"
        onPressButton1={handleConfirmDelete}
        onPressButton2={handleClose}
      />
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
    width: 40, // Increase size for better shadow visibility
    height: 40,
    borderRadius: 12,
    marginLeft: 0,
    // backgroundColor: '#FFFFFF', // Ensure background is visible
    justifyContent: 'center',
    alignItems: 'center',

    // iOS Shadow
    shadowColor: '#A6A6A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,

    // Android Shadow
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
    width: 50, // Adjust size as needed
    height: 50, // Adjust size as needed
    borderRadius: 25, // Make it circular
    marginBottom: 10, // Space between image and title
  },
  title: {
    fontFamily: FontFamilies.semibold,
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', // Align icon and text vertically
  },
  icon2: {
    width: 12, // Adjust size as needed
    height: 12, // Adjust size as needed
    marginRight: 5, // Space between icon and text
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    fontWeight: '400',
    color: '#81919E',
  },
  menuButton: {
    padding: 10,
  },
  menu: {
    position: 'absolute',
    right: 15,
    top: 60,
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
    width: 200,
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 13,
    color: '#000',
    fontFamily: FontFamilies.medium,
  },
  deleteText: {
    color: '#ED4956',
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto', // Push icons to the right
  },
  headerIcon: {
    width: 24, // Adjust size as needed
    height: 24, // Adjust size as needed
    marginLeft: 10, // Space between icons
  },
  unsaveButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 7,
    borderRadius: 20,
  },
  unsaveIcon: {
    height: 14,
    width: 14,
    tintColor: 'black',
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
});

export default SavedDetailedLayout;
