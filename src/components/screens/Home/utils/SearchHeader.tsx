import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import { FontFamilies } from '../../../../styles/constants';
const SearchHeader = ({searchTerm, setSearchTerm, activeTab, setActiveTab}:any) => {
  const navigation = useNavigation();
  return (
    <View>
      {/* Back Button and Search Bar */}
      <View style={styles.headerContainer}>
        <View style={styles.searchInputWrapper}>
          {/* <Image
            source={require('../../../../assets/icons/searchIcon.png')} // Path to search icon
            style={styles.searchIcon}
          /> */}
          <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Image
            source={require('../../../../assets/header/backIcon.png')} // Path to search icon
            style={styles.backIcon}
          />
        </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            placeholder={`Search ${activeTab === 'People' ? 'names' : 'tags'}`}
            onChangeText={setSearchTerm}
            autoComplete="off"
            autoCorrect={false}
            placeholderTextColor="#888"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchTerm('')}
              style={styles.clearButton}>
             <Image
            source={require('../../../../assets/header/cancelIcon.png')} // Path to search icon
            style={styles.backIcon}
          />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Custom Tab Bar */}
      <View style={styles.tabContainer}>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'People' && styles.activeTab]}
          onPress={() => setActiveTab('People')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'People' && styles.activeTabText,
            ]}>
            People
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Tags' && styles.activeTab]}
          onPress={() => setActiveTab('Tags')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Tags' && styles.activeTabText,
            ]}>
            Tags
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 4,
  },
  backButton: {
    borderRadius: 10,
    justifyContent: 'center',
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 4},
    // shadowOpacity: 0.25,
    // shadowRadius: 8,
    // elevation: 10,
    paddingLeft:10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    // paddingHorizontal: 10,
    height: 44,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#828282',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#1E1E1E',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#F2F2F2',
  },
  activeTab: {
    borderBottomColor: '#121212',
  },
  tabText: {
  fontFamily: FontFamilies.medium,
    fontSize: 14,
    color:'#81919E',
  },
  activeTabText: {
    color: '#121212',
    fontWeight: 'bold',
    fontFamily: FontFamilies.medium,
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
});
