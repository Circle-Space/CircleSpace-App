import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Keyboard, Dimensions, Platform, Animated, PanResponder, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import SavedCollectionsGrid from './SavedCollectionsGrid';
import { get as getDataFromServer, post as postDataFromServer } from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontFamilies } from '../../../styles/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAG_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.5;

// Define interfaces for TypeScript
interface Post {
  _id?: string;
  id?: string;
  contentType?: string;
  title?: string;
  url?: string;
}

interface CollectionInfo {
  name: string;
  visibility: string;
  contentType?: string;
  collectionId?: string;
}

interface SavePayload {
  isNewCollection?: boolean;
  ugcId?: string;
  collectionInfo: CollectionInfo;
}

interface CreateCollectionParams {
  name: string;
  visibility: string;
}

interface CreateCollectionResponse {
  message?: string;
  status?: number;
  collectionId?: string;
  collection?: {
    _id: string;
  };
}

interface CreateCollectionResult {
  error?: string;
  success?: boolean;
}

interface Collection {
  id: string;
  name: string;
  visibility: string;
  thumbnails?: string[];
  images: string[];
}

interface CollectionsResponse {
  collections: Collection[];
  totalPages?: number;
  currentPage?: number;
}

interface BottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  post?: Post;
  saveToggle: (payload: SavePayload) => void;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({ isVisible, onClose, post, saveToggle }) => {
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Animation related refs and values
  const translateY = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);
  
  // Add panResponder for drag gestures - similar to LocationModal
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5; // Small threshold to start capturing
      },
      onPanResponderGrant: () => {
        // Access the current value safely
        lastGestureY.current = (translateY as any)._value || 0;
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow dragging in both directions with limits
        const newY = lastGestureY.current + gestureState.dy;
        // Limit to prevent dragging too far down or up
        // Only allow downward dragging (positive values)
        if (newY >= 0) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Check for closing threshold or high velocity
        if (gestureState.dy > DRAG_THRESHOLD || gestureState.vy > VELOCITY_THRESHOLD) {
          // Animation to close
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          // Spring back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShow = () => {
      setIsKeyboardOpen(true);
    };

    const keyboardDidHide = () => {
      setIsKeyboardOpen(false);
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardDidShow
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardDidHide
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Reset translate Y when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      translateY.setValue(0);
      fetchUserDetails();
    }
  }, [isVisible]);

  const fetchUserDetails = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const accountData = await AsyncStorage.getItem('user');
      
      if (accountData) {
        const userData = JSON.parse(accountData);
        const userId = userData?.['_id'];

        if (userId && savedToken) {
          setCurrentUser(userId);
          setToken(savedToken || '');
          getSaveCollectionsInfo(userId, savedToken || '', 1);
        } else {
          console.error('Failed to retrieve user details');
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getSaveCollectionsInfo = async (userId: string, token: string, page: number) => {
    try {
      // According to dataRequest.tsx, get expects endpoint, queryParams, token
      const data = await getDataFromServer('collections/user-collections', {}, token) as CollectionsResponse;
      console.log('data :: 42 :: ', data);
      
      // Convert API response to our Collection format
      const formattedCollections: Collection[] = data.collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        visibility: collection.visibility,
        images: collection.thumbnails || []
      }));
      
      setCollections(formattedCollections);
      console.log('collections :: 51 :: ', collections);
       
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching saved collections:', error);
    }
  };

  const loadMoreCollections = (page: number) => {
    getSaveCollectionsInfo(currentUser, token, page);
  };

  const onCreateCollection = async (name: CreateCollectionParams): Promise<CreateCollectionResult> => {
    console.log("onCreateCollection :: 142 :: ", post);
    setIsLoading(true);
    try {
      const payload = {
        name: name.name,
        visibility: name.visibility,
        description: "",
        itemId: post?._id,
        itemType: post?.contentType === "ugc" ? 'photo' : post?.contentType,
      };
      console.log("payloadcraete ", payload);

      // According to dataRequest.tsx, post expects endpoint and payload
      // The token is automatically fetched inside the function
      const response = await postDataFromServer('collections/create', payload) as CreateCollectionResponse;
      console.log('response :: 67 :: ', response);
      
      if (response && response.message === 'Collection created successfully') {
        // Create a special payload for saveToggle that indicates this was a new collection creation
        const savePayload: SavePayload = {
          isNewCollection: true,  // Flag to prevent additional API call
          collectionInfo: {
            name: name.name,
            visibility: name.visibility,
            contentType: post?.contentType,
            collectionId: response.collectionId || response.collection?._id
          }
        };
        
        // Call saveToggle to only update Redux state
        saveToggle(savePayload);
        
        // Refresh collections after creating new one
        getSaveCollectionsInfo(currentUser, token, 1);
        
        // Only close the modal on success
        onClose();
        return { success: true };
      } else if (response && response.message === "A collection with this name already exists") {
        // Return the error message to be displayed in the SavedCollectionsGrid component
        console.log('Collection already exists error');
        return { error: response.message };
      } else if (response && response.status === 400) {
        // Handle other validation errors
        return { error: response.message || 'Failed to create collection' };
      }
      
      // For other unexpected responses
      return { error: 'An unexpected error occurred' };
    } catch (error: any) {
      console.error('Error creating collection:', error);
      return { error: error.message || 'Failed to create collection' };
    } finally {
      setIsLoading(false);
    }
  };

  const onSaveToCollection = async (item: Collection) => {
    setIsLoading(true);
    console.log('onSaveToCollection :: 76 :: ', item);
    const itemType = post?.contentType === "ugc" || post?.contentType === "video" || post?.contentType === "photo" ? 'post' : post?.contentType;
    try {
      const payload: SavePayload = {
        ugcId: post?.id,
        collectionInfo: {
          name: item.name,
          visibility: item.visibility,
          contentType: post?.contentType,
          collectionId: item.id
        },
      };
      saveToggle(payload);
    } catch (error) {
      console.error('Error saving to collection:', error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      propagateSwipe={false}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
      useNativeDriver
      statusBarTranslucent
      onBackButtonPress={onClose}
    >
      <Animated.View 
        style={[
          styles.modalContent,
          {
            height: isKeyboardOpen ? '90%' : '50%',
            maxHeight: isKeyboardOpen ? '90%' : '50%',
            transform: [{ translateY }],
            paddingBottom: Math.max(insets.bottom + 10, Platform.OS === 'android' ? 30 : 20)
          }
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
          <View style={styles.dragRow}>
            <View style={styles.dragIndicator} />
          </View>
          
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Your Spaces</Text>
          </View>
        </View>

        <View style={styles.divider} />
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E1E1E" />
            <Text style={styles.loadingText}>Creating Space...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollViewContent}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <SavedCollectionsGrid
              collectionsData={collections}
              onCreateCollection={onCreateCollection}
              onLoadMoreCollections={loadMoreCollections}
              onSaveToCollection={onSaveToCollection}
            />
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  dragHandleArea: {
    width: '100%',
    zIndex: 10,
  },
  dragRow: {
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#CECECE',
    borderRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    color: '#1E1E1E',
    fontWeight: '600',
    fontFamily: FontFamilies.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 16,
  },
  scrollView: {
    flexGrow: 1,
    marginTop: 8,
  },
  scrollViewContent: {
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    color: '#1E1E1E',
    fontSize: 14,
    fontFamily: FontFamilies.medium,
  },
});

export default BottomSheetModal;
