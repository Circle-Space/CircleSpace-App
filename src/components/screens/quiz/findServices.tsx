import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomProgressBar from '../jobs/utils/customProgressBar';
import servicesdata from '../../datasets/servicesdata';
import {useNavigation, useRoute} from '@react-navigation/native';

const FindServices = () => {
  const route = useRoute();
  const {payload} = route.params;
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [initialService, setInitialService] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    setInitialService(servicesdata.slice(0, 15));
    setServices(servicesdata); // Set city data
    if (payload) {
      setSelectedService(payload.selectedService || null);
    }
  }, [payload]);

  const handleSearch = (text: any) => {
    setSearch(text);
  };

  const filteredServices = services.filter(service => {
    return service.toLowerCase().includes(search.toLowerCase());
  });

  const servicesToShow = search ? filteredServices : initialService;

  const handleNextPress = () => {
    if (selectedService) {
      const updatedApiJson = {
        ...payload,
        selectedService: selectedService,
      };

      navigation.navigate('ProjectsWorkingOn', {payload: updatedApiJson});
    } else {
      Alert.alert('Please select Service.');
    }
  };

  const handleBack = () => {
    const updatedApiJson = {
      ...payload,
      selectedService: selectedService,
    };
    navigation.navigate('FindProfessionals', {payload: updatedApiJson});
  };
  return (
    <View style={styles.container}>
      <CustomProgressBar progress={20.0} />

      <Text style={styles.question}>What services are you looking for?</Text>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#000" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by service name"
          placeholderTextColor="#000"
          value={search}
          onChangeText={handleSearch}
        />
      </View>
      <View style={styles.servicesContainer}>
        {servicesToShow.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.serviceContainer,
              selectedService === item && styles.selectedServiceContainer,
            ]}
            onPress={() => setSelectedService(item)}>
            <Icon
              name={
                selectedService === item ? 'radiobox-marked' : 'radiobox-blank'
              }
              size={24}
              color={selectedService === item ? '#B68E56' : '#A0A0A0'}
              style={styles.radioIcon}
            />
            <Text
              style={[
                styles.serviceText,
                selectedService === item && styles.selectedServiceText,
              ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => handleBack()}>
          <Text style={[styles.buttonText, styles.backText]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => handleNextPress()}>
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
  question: {
    marginVertical: 20,
    fontSize: 16,
    fontFamily: 'Gilroy-ExtraBold',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#DABC94',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 55,
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
  servicesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  serviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#E8E8E8',
    margin: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedServiceContainer: {
    backgroundColor: '#DABC94',
  },
  selectedServiceText: {
    color: '#75644B',
    fontFamily: 'Gilroy-ExtraBold',
    fontWeight: 'bold',
  },
  serviceText: {
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
    fontFamily: 'Gilroy-ExtraBold',
    fontWeight: 'bold',
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

export default FindServices;
