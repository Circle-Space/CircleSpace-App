import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {get} from '../../../../services/dataRequest'; // Update the path as per your file structure
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getInitials} from '../../../../utils/commonFunctions';
import { Color } from '../../../../styles/constants';

const SelectPeople = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [searchText, setSearchText] = useState('');
  const [selectedPeople, setSelectedPeople] = useState(
    route.params?.selectedPeople || [],
  );
  const [peopleList, setPeopleList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');

  const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/40'; // Default image URL

  useEffect(() => {
    fetchToken();
    fetchDefaultUsers();
  }, [token]);

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        setToken(savedToken);
      } else {
        console.error('Token not found');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
    }
  }, []);

  const fetchDefaultUsers = async () => {
    setIsLoading(true);
    try {
      const data = await get(`search/users?page=1&limit=50`, {}, token);
      setPeopleList(data.users || []);
    } catch (error) {
      console.error('Error fetching default users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async text => {
    setSearchText(text);
    setIsLoading(true);
    try {
      if (text.trim() !== '') {
        const data = await get(
          `search/users?query=${text}&page=1&limit=50`,
          {},
          token,
        );
        setPeopleList(data.users || []);
      } else {
        setPeopleList([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = person => {
    if (selectedPeople.some(p => p._id === person._id)) {
      setSelectedPeople(prev => prev.filter(p => p._id !== person._id));
    } else {
      setSelectedPeople(prev => [...prev, person]);
    }
  };

  const isSelected = person => selectedPeople.some(p => p._id === person._id);
  const searchIcon = require('../../../../assets/icons/searchIcon.png');
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Image source={searchIcon} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#B9B9BB"
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loader */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#1E1E1E" style={styles.loader} />
      ) : (
        <FlatList
          data={peopleList}
          keyExtractor={item => item?._id?.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.personItem,
                isSelected(item) && styles.selectedPerson,
              ]}
              onPress={() => toggleSelection(item)}>
              {item?.profilePic ? (
                <Image
                  source={{
                    uri: item?.profilePic, // Use default if profilePic is not found
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.initialsAvatar}>
                  <Text style={styles.initialsText}>
                    {getInitials(
                      item?.username
                    )}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.personName}>
                  {item?.firstName} {item?.lastName}
                </Text>
                <Text style={styles.personUsername}>{item?.username}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{marginLeft: 20}}>No matching results found</Text>
          }
          contentContainerStyle={{paddingBottom: 80}} // Adds padding to prevent overlap with the button
        />
      )}

      {/* Done Button */}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => {
          navigation.navigate('filesUpload', {
            selectedPeople: selectedPeople,
          });
        }}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    margin: 15,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  backButton: {
    fontSize: 18,
    color: '#1E1E1E',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E1E1E',
    height: '100%',
  },
  clearButton: {
    fontSize: 18,
    color: '#B9B9BB',
    marginLeft: 10,
  },
  loader: {
    marginTop: 20,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  selectedPerson: {
    backgroundColor: '#DDEFFF',
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  personName: {
    fontSize: 13,
    fontFamily: 'Gilroy-Medium',
    fontWeight: '400',
    color: '#1E1E1E',
  },
  personUsername: {
    fontSize: 13,
    fontFamily: 'Gilroy-Medium',
    fontWeight: '400',
    color: '#B9B9BB',
  },
  doneButton: {
    height: 52,
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontWeight: '400',
    fontFamily: 'Gilroy-SemiBold',
    fontSize: 15,
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
});

export default SelectPeople;
