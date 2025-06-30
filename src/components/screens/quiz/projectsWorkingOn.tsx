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

const ProjectsWorkingOn = () => {
  const route = useRoute();
  const {payload} = route.params || {};
  const navigation = useNavigation();
  const [selectedProject, setSelectedProject] = useState(null);

  const projectData = [
    'Residential',
    'Commercial',
    'Retail',
    'Hospitality',
    'Others',
  ];

  useEffect(() => {
    if (payload) {
      setSelectedProject(payload.selectedProject || null);
    }
  }, [payload]);

  const handleNextPress = () => {
    if (selectedProject) {
      const updatedApiJson = {
        ...payload,
        selectedProject: selectedProject,
      };
      navigation.navigate('PlanToStart', {payload: updatedApiJson});
    } else {
      Alert.alert('Please select Service.');
    }
  };
  const handleBack = () => {
    const updatedApiJson = {
      ...payload,
      selectedProject: selectedProject,
    };
    navigation.navigate('FindServices', {payload: updatedApiJson});
  };
  return (
    <View style={styles.container}>
      <CustomProgressBar progress={40.0} />

      <Text style={styles.question}>
        What type of projects are you working on?
      </Text>

      <View style={styles.projectsContainer}>
        {projectData.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.cityContainer,
              selectedProject === item && styles.selectedCityContainer,
            ]}
            onPress={() => setSelectedProject(item)}>
            <Icon
              name={
                selectedProject === item ? 'radiobox-marked' : 'radiobox-blank'
              }
              size={24}
              color={selectedProject === item ? '#B68E56' : '#A0A0A0'}
              style={styles.radioIcon}
            />
            <Text
              style={[
                styles.projectText,
                selectedProject === item && styles.selectedProjectText,
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

export default ProjectsWorkingOn;
