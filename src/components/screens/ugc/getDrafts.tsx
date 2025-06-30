import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {get, del, post} from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomAlertModal from '../../commons/customAlert';
import { Color } from '../../../styles/constants';
import {createVideoThumbnail} from 'react-native-compressor';
import Video from 'react-native-video';
import { useFocusEffect } from '@react-navigation/native';

type Draft = {
  _id: string;
  caption: string;
  contentUrl: string;
  // Add other fields as necessary
};

const GetDrafts = ({navigation}: any) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [token, setToken] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDrafts, setSelectedDrafts] = useState<any[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [draftModalVisible, setDraftModalVisible] = useState(false);

  useEffect(() => {
    fetchToken();
  }, []);

  // Add useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        setDrafts([]); // Clear existing drafts
        setPage(1); // Reset page number
        setHasMore(true); // Reset hasMore flag
        if (token) {
          await fetchDrafts(1, token);
        }
      };
      
      refreshData();
    }, [token])
  );

  useEffect(() => {
    console.log('Drafts state updated:', drafts);
  }, [drafts]);

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        setToken(savedToken);
        fetchDrafts(1, savedToken); // Initial fetch
      } else {
        console.error('No token found');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
    }
  }, []);



    const fetchDrafts = useCallback(
    async (page: any, token: any) => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        console.log('Fetching drafts with page:', page, 'and token:', token ? 'present' : 'missing');
        const postsData = await get(
          `ugc/get-draft-ugc?page=${page}&limit=50`,
          {},
          token,
        );
        console.log('Fetched postsData:', postsData);

        if (postsData.drafts && postsData.drafts.length > 0) {
          // console.log('Setting drafts state with:', postsData.drafts);
          setDrafts(prevDrafts => {
            // Only add new drafts that don't already exist
            const newDrafts = postsData.drafts.filter(
              (newDraft: Draft) => !prevDrafts.some(existingDraft => existingDraft._id === newDraft._id)
            );
            return [...prevDrafts, ...newDrafts];
          });
          setPage(page + 1);
        } else {
          console.log('No more drafts to fetch or empty response:', postsData);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching drafts:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore],
  );

  // Update the FlatList onEndReached handler
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchDrafts(page, token);
    }
  }, [loading, hasMore, page, token, fetchDrafts]);

  const handleCardPress = useCallback(
    (draft: any) => {
      if (selectionMode) {
        toggleSelectDraft(draft._id); // Toggle selection (add/remove)
      } else {
        if (draft.contentType === 'project') {
          navigation.navigate('UploadProjects', { data: draft });
        } else {
          navigation.navigate('UpdateDraftPage', { draft: draft, isShow: true });
        }
      }
    },
    [selectionMode],
  );

  // Toggle selection: add or remove draft from selectedDrafts array
  const toggleSelectDraft = (id: string) => {
    setSelectedDrafts(prevSelectedDrafts => {
      const newSelectedDrafts = prevSelectedDrafts.includes(id)
        ? prevSelectedDrafts.filter(draftId => draftId !== id)
        : [...prevSelectedDrafts, id];

      // If no items are selected, exit selection mode
      if (newSelectedDrafts.length === 0) {
        setSelectionMode(false); // Exit selection mode when all items are unselected
      }

      return newSelectedDrafts;
    });
  };

  const handleCardLongPress = (draft: any) => {
    if (!selectionMode) {
      setSelectionMode(true); // Enter selection mode on long press
    }
    toggleSelectDraft(draft._id); // Select or deselect the pressed draft
  };

  const handleDelete = () => {
    setDraftModalVisible(true);
  };

  const handleConfirmClick = async () => {
    setDraftModalVisible(false); // Hide the modal
    try {
      for (const draftId of selectedDrafts) {
        const res = await del(`ugc/delete-post/${draftId}`, ''); // Delete each draft
      }
      setDrafts(drafts.filter((draft: Draft) => !selectedDrafts.includes(draft._id)));
      setSelectedDrafts([]); // Reset selection
      setSelectionMode(false); // Exit selection mode
    } catch (error) {
      console.error('Error deleting drafts:', error);
    }
  };

  const handleCancelClick = () => {
    setDraftModalVisible(false); // Close the modal
  };

  const screenWidth = Dimensions.get('window').width;
  const itemMargin = 20;

  const calculateItemWidth = (itemsInRow: number) => {
    const totalMargin = 32; // Total horizontal padding
    const gapBetweenItems = 16; // Gap between items
    const availableWidth = screenWidth - totalMargin - (gapBetweenItems * (itemsInRow - 1));
    return availableWidth / itemsInRow;
  };

  const renderItem = ({item, index}: any) => {
    const itemsInRow = drafts.length <= 3 ? drafts.length : 3; // Changed to 3 columns
    const itemWidth = calculateItemWidth(itemsInRow);
    return (
      <DraftCard
        draft={item}
        onPress={() => handleCardPress(item)}
        onLongPress={() => handleCardLongPress(item)}
        isSelected={selectedDrafts.includes(item._id)}
        itemWidth={itemWidth}
      />
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.black} />
      </View>
    );
  };

  // console.log('Rendering FlatList with drafts:', drafts);

  return (
    <View style={styles.container}>
      {drafts.length === 0 ? (
        <View style={styles.noPostContainer}>
          <Image
            style={styles.noPostImage}
            source={require('../../.././assets/profile/noPostPlaceholder.png')}
          />
          <Text style={styles.noPostText}>No Drafts added yet</Text>
        </View>
      ) : (
        <FlatList
          data={drafts}
          renderItem={renderItem}
          keyExtractor={(item: any) => item._id.toString()}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectionMode && selectedDrafts.length > 0 && (
        <TouchableOpacity style={styles.nextButton} onPress={handleDelete}>
          <Icon name="trash" size={20} color="#ED4956" />
          <Text style={styles.nextButtonText}>Delete Selected</Text>
        </TouchableOpacity>
      )}

      <CustomAlertModal
        visible={draftModalVisible}
        title="Delete Draft"
        description="Are you sure you want to delete selected drafts?"
        buttonOneText="Delete"
        buttonTwoText="Cancel"
        onPressButton1={handleConfirmClick}
        onPressButton2={handleCancelClick}
      />
    </View>
  );
};

const DraftCard = ({
  draft,
  onPress,
  onLongPress,
  isSelected,
  itemWidth,
}: any) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  
  // Function to get thumbnail URL
  const getThumbnailUrl = async (draft: any) => {
    // For projects, use the first contentUrl from the array
    const contentUrl = draft.contentType === 'project' 
      ? Array.isArray(draft.contentUrl) 
        ? draft.contentUrl[0] 
        : draft.contentUrl
      : draft.contentUrl;

    if (contentUrl?.endsWith('.mp4')) {
      setIsVideo(true);
      if (draft.thumbnailUrl) {
        return draft.thumbnailUrl;
      }
      try {
        const thumb = await createVideoThumbnail(contentUrl);
        setThumbnail(thumb?.path);
        return thumb?.path;
      } catch (error) {
        return contentUrl.replace('.mp4', '.jpg');
      }
    }
    // For image files (.jpg, .png)
    setIsVideo(false);
    return contentUrl;
  };

  useEffect(() => {
    if (draft.contentUrl) {
      getThumbnailUrl(draft);
    }
  }, [draft]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        {width: itemWidth},
        isSelected && styles.selectedCard,
      ]}>
      <View style={styles.cardContent}>
        <ImageBackground
          source={{uri: thumbnail || (draft.contentType === 'project' ? (Array.isArray(draft.contentUrl) ? draft.contentUrl[0] : draft.contentUrl) : draft.contentUrl)}}
          style={styles.image}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          {isVideo && (
            <View style={styles.videoIndicator}>
              <Icon name="play-circle" size={30} color="#FFFFFF" />
            </View>
          )}
          {draft.contentType === 'project' && (
            <View style={styles.imageCount}>
              <Text style={styles.imageCountText}>1/{Array.isArray(draft.contentUrl) ? draft.contentUrl.length : 1}</Text>
            </View>
          )}
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  list: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#ED4956',
  },
  cardContent: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 12,
  },
  postTitle: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#1E1E1E',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 20,
  },
  noPostContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  noPostImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  noPostText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFFCC',
    borderRadius: 12,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#A6A6A640',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 6,
  },

  nextButtonText: {
    color: '#ED4956',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  videoIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    zIndex: 1,
  },
  imageCount: {
    position: 'absolute',
    // bottom: 8,
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCountText: {
    color: Color.black,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default GetDrafts;
