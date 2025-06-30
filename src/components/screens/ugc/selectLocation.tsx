import React, {useState} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import citydata from '../../datasets/citydata';

const SelectLocation = ({route, navigation}: any) => {
  const [search, setSearch] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(citydata);

  const handleSearch = (text: string) => {
    setSearch(text);
    const lowercasedText = text.toLowerCase();
    setFilteredLocations(
      citydata.filter(
        location =>
          location?.City.toLowerCase().includes(lowercasedText) ||
          location?.State.toLowerCase().includes(lowercasedText),
      ),
    );
  };

  const handleSelect = (location: any) => {
    if (route.params?.onSelect) {
      route.params.onSelect(location);
    }
    navigation.goBack(); // Navigate back to the previous screen
  };

  const locationIcon = require('../../../assets/ugcs/location-pin.png');

  const renderItem = ({item}: any) => (
    <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)} activeOpacity={1}>
      <Image source={locationIcon} style={styles.icon} />
      <Text style={styles.itemText}>
        {item.City} , {item.State}
      </Text>
    </TouchableOpacity>
  );

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
            placeholder="Search for location"
            style={styles.searchInput}
          value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredLocations}
        renderItem={renderItem}
        keyExtractor={item => item?.City + item?.State}
        style={styles.list}
      />
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
    // marginRight: 10,
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
  },
  item: {
    padding: 15,
    paddingLeft: 0,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight:5,
    width: 20,
    height: 20,
  },
  itemText: {
    fontSize: 13,
    color: '#81919E',
    fontWeight: '400',
    fontFamily: 'Gilroy-Medium',
  },
});

export default SelectLocation;
