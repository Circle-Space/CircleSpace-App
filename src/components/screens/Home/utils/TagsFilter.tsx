import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getWithoutToken } from '../../../../services/dataRequest';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Color, FontFamilies } from '../../../../styles/constants';

const DEBOUNCE_DELAY = 500; // Debounce delay in ms

// API call to fetch paginated tags
const fetchTagsFromAPI = async (searchTerm: string, page: number) => {
  const url = `tags?search=${searchTerm}&page=${page}&limit=10`;
  const response = await getWithoutToken(url);
  console.log("response 15 ::",response);
  return response; // Assuming response is the full object containing tags array
};

const TagsFilter = ({ searchTerm }: { searchTerm: string }) => {
  const navigation = useNavigation(); // Initialize navigation
  const [tags, setTags] = useState<any[]>([]); // Tags state
  const [prevTags, setPrevTags] = useState<any[]>([]); // Previous results state
  const [loading, setLoading] = useState(false); // Loading state
  const [page, setPage] = useState(1); // Page number for pagination
  const [isEndReached, setIsEndReached] = useState(false); // End of data reached
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Initially, we start with an empty search term

  // Debounce logic: Update the search term after the user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim() === '') {
        // If searchTerm is cleared, restore previous results
        setTags(prevTags);
        console.log("Empty search term")
      } else {
        setDebouncedSearchTerm(searchTerm);
        setTags([]); // Clear tags for new search
        setPage(1); // Reset page number
        setIsEndReached(false); // Reset end of data
      }
    }, DEBOUNCE_DELAY);

    // Cleanup the timeout if the user types within the debounce delay
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
  useFocusEffect(
    useCallback(() => {
      const clearStorage = async () => {
        await AsyncStorage.removeItem('savedTagResultPage');
        await AsyncStorage.removeItem('savedScrollTagResults');
        await AsyncStorage.removeItem('tagResultsData');
      };
      clearStorage();
    }, []),
  );
  // Fetch more tags from API
  const fetchTags = async (pageNumber: number, currentSearchTerm: string) => {
    setLoading(true);
    try {
      const response = await fetchTagsFromAPI(currentSearchTerm, pageNumber);
      console.log("response 64 ::",response);
      
      const newTags = response.tags;

      // Check if newTags is an array
      if (Array.isArray(newTags)) {
        // Append new tags to existing state
        setTags(prevTags => {
          const allTags = [...prevTags, ...newTags];
          return allTags.filter((tag, index, self) =>
            index === self.findIndex(t => t._id === tag._id)
          );
        });
      } else {
        console.error('Error: The tags returned from the API is not an array', newTags);
      }

      // Save the previous results if search term was not empty
      if (currentSearchTerm.trim() !== '') {
        setPrevTags(prevTags => [...prevTags, ...newTags]);
      }

      // Check if more pages are available
      if (response.currentPage >= response.totalPages) {
        setIsEndReached(true); // No more pages to load
      }

      setTotalPages(response.totalPages); // Set total pages from the response
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tags whenever page or debouncedSearchTerm changes
  useEffect(() => {
    fetchTags(page, debouncedSearchTerm); // Fetch tags when page or search term changes
  }, [page, debouncedSearchTerm]);

  // Load more data when reaching the end of the list
  const handleLoadMore = () => {
    if (!loading && !isEndReached && page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const routeToTagResults = (item: any) => {
    // Navigate to a new screen based on the tag clicked
    navigation.navigate('TagResultScreenRewamped', { query : item.name });
  };
  // Render each tag item
  const renderTagItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.option} onPress={() => routeToTagResults(item)}>
      <View style={styles.iconWrapper}>
        <Icon name="pricetag-outline" size={16} color="#FFFFFF" style={styles.flippedIcon} />
      </View>
      <View>
        <Text style={styles.optionText}>{item.name}</Text>
        <Text style={styles.countText}>{item.timesUsed} post</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={tags}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          renderItem={renderTagItem}
          ListEmptyComponent={<Text style={styles.noResultsText}>No tags found</Text>}
          onEndReached={handleLoadMore} // Trigger load more when the user scrolls to the end
          onEndReachedThreshold={0.5} // Trigger when user is halfway through the current page
          ListFooterComponent={loading && page > 1 ? <ActivityIndicator size="small" color={Color.black} /> : null} // Show loading spinner at the bottom for subsequent pages
        />
      )}
    </View>
  );
};

export default TagsFilter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  iconWrapper: {
    height:30,
    width:30,
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 5.29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flippedIcon: {
    transform: [{ scaleX: -1 }],
  },
  optionText: {
    fontSize: 14,
    marginLeft: 10,
    fontFamily:FontFamilies.medium,
    fontWeight:'400',
    color:'#4A4A4A',
  },
  countText: {
    fontFamily: FontFamilies.regular,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 13.2,
    marginLeft: 10,
    color:'#1E1E1E',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
