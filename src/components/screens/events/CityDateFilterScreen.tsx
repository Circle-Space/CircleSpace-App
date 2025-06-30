import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import {get} from '../../../services/dataRequest'; // Your API request function
import Icon from 'react-native-vector-icons/Ionicons'; // Import icon library
import cityData from '../../datasets/citydata';
import { FontFamilies } from '../../../styles/constants';

// City tab - fetches and displays the list of cities
const CityFilter = ({onCitySelect, searchTerm}) => {
  const [cities, setCities] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch city data from API
    const fetchCities = async () => {
      try {
        // const data = await get('events/get-cities'); // Adjust the API endpoint as necessary
        // setCities(data.cities || cityData);
        setCities(cityData);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  const filteredCities = cities.filter((city) =>
    city.City.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" />;
  }

  return (
    <FlatList
      data={filteredCities}
      keyExtractor={(item) => item.id}
      renderItem={({item}) => (
        <TouchableOpacity style={styles.option} onPress={() => onCitySelect(item)}>
          <View style={styles.iconWrapper}>
            <Icon name="location-outline" size={10} color="#000" />
          </View>
          <Text style={styles.optionText}>{item.City}, {item.State}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={() => (
        <Text style={styles.noResultsText}>No cities found</Text>
      )}
    />
  );
};

// Date tab - shows predefined date options
const DateFilter = ({onDateSelect, searchTerm}) => {
  const dateOptions = [
    {label: 'Next Week', value: 'next_week'},
    {label: 'Next 15 Days', value: 'next_15_days'},
    {label: 'Next Month', value: 'next_month'},
    {label: 'Next 3 Months', value: 'next_3_months'},
  ];

  const filteredDates = dateOptions.filter((date) =>
    date.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <FlatList
      data={filteredDates}
      keyExtractor={(item) => item.value}
      renderItem={({item}) => (
        <TouchableOpacity style={styles.option} onPress={() => onDateSelect(item)}>
          <View style={styles.iconWrapper}>
            <Icon name="calendar-outline" size={10} color="#000" />
          </View>

          <Text style={styles.optionText}>{item.label}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={() => (
        <Text style={styles.noResultsText}>No date options found</Text>
      )}
    />
  );
};

const CityDateFilterScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('City');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCitySelect = (city) => {
    navigation.navigate('Events', { selectedCity: city });
  };

  const handleDateSelect = (date) => {
    navigation.navigate('Events', { selectedDate: date });
  };


  return (
    <View style={styles.container}>
      {/* Back Button and Search Bar in the same line */}
      <View style={styles.headerContainer}>
      <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-back" size={22} color="#181818" />
          </TouchableOpacity>
        <View style={styles.searchInputWrapper}>
          <Image
            source={require('../../../assets/icons/searchIcon.png')} // Path to your search icon
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            placeholder={`Search ${activeTab === 'City' ? 'City' : 'Date'}`}
            onChangeText={setSearchTerm}
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {/* Custom Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'City' && styles.activeTab]}
          onPress={() => setActiveTab('City')}>
          <Text style={[styles.tabText, activeTab === 'City' && styles.activeTabText]}>
            City
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Date' && styles.activeTab]}
          onPress={() => setActiveTab('Date')}>
          <Text style={[styles.tabText, activeTab === 'Date' && styles.activeTabText]}>
            Date
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'City' ? (
          <CityFilter onCitySelect={handleCitySelect} searchTerm={searchTerm} />
        ) : (
          <DateFilter onDateSelect={handleDateSelect} searchTerm={searchTerm} />
        )}
      </View>
    </View>
  );
};

export default CityDateFilterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap : 4
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#828282',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#81919E',
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
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#121212',
  },
  tabText: {
    fontFamily : FontFamilies.medium,
    fontSize : 14
  },
  activeTabText: {
    color: '#81919E',
    fontWeight: 'bold',
    fontFamily : FontFamilies.medium,
    fontSize : 14,
  },
  tabContent: {
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
    backgroundColor: '#FCEDE3',
    borderRadius: 50,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
