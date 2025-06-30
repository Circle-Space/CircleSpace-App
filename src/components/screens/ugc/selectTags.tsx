import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import {get} from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getInitials} from '../../../utils/commonFunctions';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the FontAwesome icon set
import { Color } from '../../../styles/constants';

const SelectTags = ({route, navigation}: any) => {
  const [search, setSearch] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [selectedTags, setSelectedTags] = useState(
    route.params?.selectedTags || [],
  );

  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        setToken(savedToken);
      } else {
        setToken('No token found');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setToken('Error fetching token');
    }
  }, []);

  const handleSearch = async (text: string) => {
    setSearch(text);
    console.log('text :: 44 ::', text);
    setLoading(true);
    try {
      if (text != '') {
        const data = await get(
          `search/users?query=${text}&page=1&limit=50`, // Dynamically add search term and pagination
          {},
          token,
        );
        setFilteredTags(data.users);
      } else {
        setFilteredTags([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user: any) => {
    const alreadySelected = selectedTags.some(tag => tag._id === user._id);
    if (alreadySelected) {
      // If already selected, deselect
      setSelectedTags(selectedTags.filter(tag => tag._id !== user._id));
    } else {
      // Else, select the tag
      setSelectedTags([...selectedTags, user]);
    }
  };

  const isSelected = (user: any) =>
    selectedTags.some(tag => tag._id === user._id);

  // Combine selected tags and unselected tags
  const sortedTags = [
    ...selectedTags,
    ...filteredTags.filter(tag => !isSelected(tag)), // Non-selected tags
  ];

  const renderItem = ({item}: any) => (
    <View style={styles.followerItem}>
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        style={styles.followerContent}>
        {item?.profilePic ? (
          <Image source={{uri: item?.profilePic}} style={styles.avatar} />
        ) : (
          <View style={styles.initialsAvatar}>
            <Text style={styles.initialsText}>
              {getInitials(item?.username)}
            </Text>
          </View>
        )}
        <View style={styles.followerInfo}>
          <Text style={styles.name}>
            {item?.businessName || `${item?.firstName} ${item?.lastName}`}
          </Text>
          <Text style={styles.username}>{item.username}</Text>
        </View>
      </TouchableOpacity>

      {/* Check Icon on the right when selected */}
      {isSelected(item) && (
        <Icon name="check" size={14} color="#000" style={styles.checkIcon} />
      )}
    </View>
  );

  const handleDone = () => {
    if (route.params?.onSelect) {
      route.params.onSelect(selectedTags); // Pass selected tags back to the previous screen
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrapper}>
          <Image
            source={require('../../../assets/icons/searchIcon.png')} // Path to your search icon
            style={styles.searchIcon}
          />
          <TextInput
            placeholderTextColor="#9E9E9E"
            placeholder="Search user"
            style={styles.searchInput}
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={sortedTags} // Display sorted tags (selected on top)
          renderItem={renderItem}
          keyExtractor={item => item?._id}
          style={styles.list}
          contentContainerStyle={{paddingBottom: 80}} // Add padding to the bottom of the list
        />
      )}

      {/* Done button for multi-select */}
      {selectedTags.length > 0 && (
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>
            Done ({selectedTags.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#A1A1A1',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#81919E',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Gilroy-Medium',
  },
  list: {
    flex: 1,
    marginTop: 15,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Added to align check icon to the right
    marginBottom: 20,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  followerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Ensures the content and check icon don't overlap
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 25,
    marginRight: 15,
  },
  initialsAvatar: {
    width: 36,
    height: 36,
    borderRadius: 25,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  initialsText: {
    color: Color.white,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Gilroy-Regular',
  },
  followerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '400',
    color: '#1E1E1E',
  },
  username: {
    marginTop: 4,
    fontSize: 11,
    color: '#B9B9BB',
    fontWeight: '400',
  },
  checkIcon: {
    marginRight: 10, // Add some space between the icon and the edge
  },
  doneButton: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    bottom: 25,
    left: 15,
    right: 15,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: '400',
  },
});

export default SelectTags;
