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

import {useNavigation, useRoute} from '@react-navigation/native';
import {post} from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AreaOfProject = () => {
  const navigation = useNavigation();
  const [selectedArea, setSelectedArea] = useState(null);
  const [token, setToken] = useState('');
  const route = useRoute();
  const {payload} = route.params || {};
  const estimatedBudget = [
    '1 - 500 sq. ft',
    '501 - 1000 sq. ft',
    '1001 - 2000 sq. ft',
    '2001+ sq. ft',
  ];
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
  const getData = async () => {
    if (payload) {
      const selectedBudget = payload.selectBudget.split(' - ');
      const minBudget = selectedBudget[0].replace('₹', '').trim();
      const maxBudget = selectedBudget[1].replace('₹', '').trim();
      const data = {
        location: payload.selectedState,
        minBudget: minBudget,
        maxBudget: maxBudget,
        service: payload.selectedService,
        category: payload.selectedProject,
        typeOfProject: payload.selectedProject,
        areaOfProject: selectedArea,
        timeline: payload.selectTime,
        city: payload.selectedCity,
      };
      const apiResponse = await post('quiz/get-results', data);
      navigation.navigate("FindingUsers", { leadId: apiResponse?.lead?._id });
    } else {
      Alert.alert('No payload data available.');
    }
  };

  useEffect(() => {
    if (payload) {
      setSelectedArea(payload.selectedArea || null);
    }
  }, [payload]);

  const handleBack = () => {
    const data = {...payload, selectedArea};
    navigation.navigate('EstimatedBudget', {payload: data});
  };
  return (
    <View style={styles.container}>
      <CustomProgressBar progress={100.0} />

      <Text style={styles.question}>What is the area of the project?</Text>

      <View style={styles.projectsContainer}>
        {estimatedBudget.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.cityContainer,
              selectedArea === item && styles.selectedCityContainer,
            ]}
            onPress={() => setSelectedArea(item)}>
            <Icon
              name={
                selectedArea === item ? 'radiobox-marked' : 'radiobox-blank'
              }
              size={24}
              color={selectedArea === item ? '#B68E56' : '#A0A0A0'}
              style={styles.radioIcon}
            />
            <Text
              style={[
                styles.projectText,
                selectedArea === item && styles.selectedProjectText,
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
          onPress={() => {
            getData();
          }}>
          <Text style={styles.buttonText}>Submit</Text>
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
    fontFamily: 'Gilroy-ExtraBold',
    fontWeight: 'bold',
  },
  projectsContainer: {
    flex: 1,
  },
  cityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedCityContainer: {
    backgroundColor: '#DABC94',
  },
  projectText: {
    fontSize: 14,
    fontFamily: 'Gilroy-Regular',
    color: '#81919E',
  },
  selectedProjectText: {
    color: '#75644B',
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
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

export default AreaOfProject;
