import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomProgressBar from '../jobs/utils/customProgressBar';
import citydata from '../../datasets/citydata';
import {useNavigation, useRoute} from '@react-navigation/native';

const FindProfessionalsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [cities, setCities] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [initialCities, setInitialCities] = useState<any[]>([]);
  const {payload} = route.params || {};
  const [apiJson, setApiJson] = useState({
    selectBudget: '',
    selectTime: '',
    selectedState: '',
    selectedCity: '',
    selectedProject: '',
    selectedService: '',
  });
  useEffect(() => {
    setInitialCities(citydata.slice(0, 8));
    setCities(citydata); // Set city data
    if (payload) {
      setApiJson(payload);
      setSelectedCity(payload.selectedCity || null);
    }
  }, [payload]);

  const handleSearch = (text: any) => {
    setSearch(text);
  };

  const filteredCities = cities.filter(city => {
    return city.City.toLowerCase().includes(search.toLowerCase());
  });

  const citiesToShow = search ? filteredCities : initialCities;

  const handleNextPress = () => {
    if (selectedCity) {
      const updatedApiJson = {
        ...apiJson,
        selectedCity: selectedCity,
        selectedState: selectedState,
      };
      navigation.navigate('FindServices' as never, {payload: updatedApiJson});
    } else {
      Alert.alert('Please select Project Location.');
    }
  };

  return (
    <View style={styles.container}>
      <CustomProgressBar progress={0.0} />

      <Text style={styles.question}>Where is your project located?</Text>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#000" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Type your city name here"
          placeholderTextColor="#000"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={citiesToShow}
        keyExtractor={item => item.City.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              styles.cityContainer,
              selectedCity === item.City && styles.selectedCityContainer,
            ]}
            onPress={() => {
              setSelectedCity(item.City);
              setSelectedState(item.State);
            }}>
            <Icon
              name={
                selectedCity === item.City
                  ? 'radiobox-marked'
                  : 'radiobox-blank'
              }
              size={24}
              color={selectedCity === item.City ? '#B68E56' : '#A0A0A0'}
              style={styles.radioIcon}
            />
            <Text
              style={[
                styles.cityText,
                selectedCity === item.City && styles.selectedTextColor,
              ]}>
              {item.City},{item.State}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Community' as never)}>
          <Text style={[styles.buttonText, styles.backText]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            handleNextPress();
          }}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
    marginLeft: 10,
  },
  progressBar: {
    height: 5,
    backgroundColor: '#D3D3D3',
    marginVertical: 20,
  },
  question: {
    marginVertical: 20,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#DABC94',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 58,
    backgroundColor: '#DABC94',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  cityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#E8E8E8',
    marginVertical: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedCityContainer: {
    backgroundColor: '#DABC94',
  },
  selectedTextColor: {
    color: '#75644B',
    fontFamily: 'Gilroy-ExtraBold',
    fontWeight: 'bold',
  },
  cityText: {
    fontSize: 14,
    color: '#81919E',
    fontFamily: 'Gilroy-Regular',
  },
  radioIcon: {
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
    color: 'white',
  },
  backText: {
    color: 'black',
  },
  nextButton: {
    backgroundColor: '#000000',
    padding: 15,
    width: '45%',
    alignItems: 'center',
    borderRadius: 12,
  },
  backButton: {
    backgroundColor: '#D3D3D3',
    padding: 15,
    alignItems: 'center',
    borderRadius: 12,
    width: '45%',
  },
});

export default FindProfessionalsScreen;
