import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Switch,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontFamilies } from '../../../styles/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Match the Collection interface with the one in BottomSheetModal.tsx
interface Collection {
  id: string;
  name: string;
  visibility: string;
  images: string[];
  thumbnails?: string[];
}

interface CreateCollectionParams {
  name: string;
  visibility: string;
}

interface CreateCollectionResult {
  error?: string;
  success?: boolean;
}

interface SavedCollectionsGridProps {
  collectionsData: Collection[];
  onCreateCollection: (params: CreateCollectionParams) => Promise<CreateCollectionResult | undefined>;
  onLoadMoreCollections: (page: number) => void;
  onSaveToCollection: (collection: Collection) => void;
}

const SavedCollectionsGrid: React.FC<SavedCollectionsGridProps> = ({ 
  collectionsData, 
  onCreateCollection, 
  onLoadMoreCollections, 
  onSaveToCollection 
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [page, setPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [validationError, setValidationError] = useState('');
  const insets = useSafeAreaInsets();
  // console.log("collectionsData :: 160 :: ", isPublic);

  useEffect(() => {
    console.log('collectionsData in useEffect :: ', collectionsData);
    if (collectionsData && collectionsData.length > 0) {
      setPage(1); // Reset page to 1 when new data is fetched
      setCollections(collectionsData); // Set collections directly since data is already formatted
    } else {
      setCollections([]); // Ensure collections are cleared if no data is available
    }
  }, [collectionsData]);

  // Add effect to track isPublic changes
  useEffect(() => {
    console.log('isPublic state changed:', isPublic);
  }, [isPublic]);

  // Clear validation error when user starts typing a new name
  useEffect(() => {
    if (validationError) {
      setValidationError('');
    }
  }, [newCollectionName]);

  const loadCollections = (data: any, reset = false) => {
    console.log('loadCollections :: 33 :: ', data);
    // Ensure data is an array and contains valid items
    const formattedCollections = Array.isArray(data)
      ? data
          .filter(collection => collection && collection.id && collection.name)
          .map((collection) => ({
            id: collection.id,
            name: collection.name,
            visibility: collection.visibility || 'public',
            images: collection.images || []
          }))
      : [];

    console.log('formattedCollections :: 45 :: ', formattedCollections);
    setCollections((prevCollections) =>
      reset ? formattedCollections : [...prevCollections, ...formattedCollections]
    );
    setHasMore(page < (data.totalPages || 1));
    setPage(data.currentPage || 1);
  };

  const loadMoreCollections = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      onLoadMoreCollections(nextPage); // Trigger API call for the next page
    }
  };

  const openCreateSection = () => {
    setIsCreating(true);
    setValidationError(''); // Clear any previous errors
    setNewCollectionName('');
  };

  const closeCreateSection = () => {
    setIsCreating(false);
    setNewCollectionName('');
    setValidationError('');
  };

  const createCollection = async () => {
    if (newCollectionName.trim() === '') {
      setValidationError('Please enter a name for your space');
      return; // Do not create if the name is empty or contains only spaces
    }
    
    // Check if name already exists in current collections
    const nameExists = collections.some(
      collection => collection.name.toLowerCase() === newCollectionName.trim().toLowerCase()
    );
    
    if (nameExists) {
      setValidationError('A collection with this name already exists');
      return;
    }
    
    const result = await onCreateCollection({
      name: newCollectionName.trim(),
      visibility: isPublic ? 'private' : 'public',
    });
    
    // Check if there was an error returned from the create function
    if (result && result.error) {
      setValidationError(result.error);
      return; // Don't close the form if there was an error
    }
    
    // If we get here, the creation was successful
    closeCreateSection();
  };

  const handleSaveToCollection = (item: Collection) => {
    onSaveToCollection(item);
  };
  
  const renderCollectionItem = ({ item }: { item: Collection }) => {
    const imagesToShow = item.images ? item.images.slice(0, 4) : [];
  
    return (
      <TouchableOpacity
        style={styles.collectionItem}
        onPress={() => handleSaveToCollection(item)}
      >
        <View style={styles.imageGrid}>
          {imagesToShow.length > 0 ? (
            [...Array(4)].map((_, index) => (
              <View key={index} style={styles.imageWrapper}>
                {imagesToShow[index] ? (
                  <Image source={{ uri: imagesToShow[index] }} style={styles.image} />
                ) : (
                  <View style={styles.image} /> // empty view to maintain the grid structure
                )}
              </View>
            ))
          ) : (
            <View style={styles.placeholder}>
              <Icon name="image" size={20} color="#81919E" />
            </View>
          )}
        </View>
        <Text style={styles.collectionName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  // Calculate bottom spacing for better UX on Android devices with gesture navigation
  const getBottomSpacing = () => {
    if (Platform.OS === 'android') {
      // For Android devices, ensure minimum spacing even if insets are 0
      return Math.max(insets.bottom + 10, 20);
    }
    return Math.max(insets.bottom / 2, 10);
  };

  return (
    <View style={styles.container}>
      {isCreating ? (
        <View style={styles.createBoardContainer}>
          <Text style={styles.label}>Name Your Space</Text>
          <TextInput
            style={[styles.input, validationError ? styles.inputError : null]}
            placeholder="Add a title such as 'Interior' or 'Architecture'"
            placeholderTextColor={'#81919E'}
            value={newCollectionName}
            onChangeText={setNewCollectionName}
          />
          {validationError ? (
            <Text style={styles.errorText}>{validationError}</Text>
          ) : null}
          <Text style={styles.label}>Visibility</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Keep this private</Text>
            <Switch
              value={isPublic}
              onValueChange={(value) => {
                console.log('Switch value changed:', value);
                setIsPublic(value);
              }}
              trackColor={{ false: '#E0E0E0', true: '#1E1E1E' }}
              thumbColor={isPublic ? '#ffffff' : '#ffffff'}
              ios_backgroundColor="#E0E0E0"
              style={styles.switch}
            />
          </View>
          <Text style={styles.helperText}>If you don't want others to see this space, keep it secret.</Text>
          <TouchableOpacity
            style={[
              styles.createButton,
              { 
                backgroundColor: newCollectionName.trim() === '' ? '#A9A9A9' : '#1E1E1E',
                marginBottom: getBottomSpacing()
              },
            ]}
            onPress={createCollection}
            disabled={newCollectionName.trim() === ''}
          >
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      ) : collections.length > 0 ? (
        <>
          {/* <Text style={styles.subtitle}>Your Spaces</Text> */}
          <FlatList
            data={collections}
            renderItem={renderCollectionItem}
            keyExtractor={(item) => item.id}
            // ListFooterComponent={() =>
            //   hasMore && (
            //     <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreCollections}>
            //       <Text style={styles.loadMoreText}>Load More</Text>
            //     </TouchableOpacity>
            //   )
            // }
          />
          <TouchableOpacity 
            style={[
              styles.addButton,
              { marginBottom: getBottomSpacing() }
            ]} 
            onPress={openCreateSection}
          >
            <Text style={styles.addButtonText}>Create New Spaces</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You have nothing saved yet. Create your Spaces and start saving!</Text>
          <TouchableOpacity 
            style={[
              styles.addButton,
              { marginBottom: getBottomSpacing() }
            ]} 
            onPress={openCreateSection}
          >
            <Text style={styles.addButtonText}>Create Your Spaces</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: FontFamilies.regular,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    height:60,
    shadowRadius: 10,
    elevation: 2,
    width: '100%',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 37,
    height: 37,
    marginRight: 16,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '50%',
    height: '50%',
    padding: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  collectionName: {
    // fontSize: 16,
    color: '#333',
    // fontWeight: '600',
    flexShrink: 1,
    fontFamily: FontFamilies.semibold,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 17.15,
    textAlign: 'center',

  },
  addButton: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontFamily: FontFamilies.semibold,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 18.38,
    textAlign: 'center',

  },
  createBoardContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  label: {
    // fontSize: 14,
    // fontWeight: 'bold',
    marginVertical: 10,
    fontFamily: FontFamilies.medium,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 13.48,
    textAlign: 'left',
    color:'#81919E',

  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5, // Reduced to make room for error message
    backgroundColor: '#f7f7f7',
    color:'#1E1E1E'
  },
  inputError: {
    borderColor: '#ED4956', // Red border for error state
  },
  errorText: {
    color: '#ED4956',
    fontSize: 12,
    marginBottom: 15,
    marginTop: 2,
    fontFamily: FontFamilies.medium,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], // Optional: Scale the switch to match the design
  },
  // switchLabel: {
  //   fontSize: 14,
  //   color: '#333',
  // },
  helperText: {
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    color: '#999',
    marginBottom: 20,
  },
  createButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    // fontSize: 16,
    fontFamily: FontFamilies.semibold,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 18.38,
    textAlign: 'center',

  },
  loadMoreButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  subtitle : {
    color: '#333',
    fontSize: 11,
    padding: 15,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
  },
  loadMoreText: {
    color: '#333',
    fontSize: 12,
    fontFamily: FontFamilies.regular,
  },
});

export default SavedCollectionsGrid;
