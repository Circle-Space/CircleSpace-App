/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import cityData from '../../../datasets/citydata';
import {TextInput} from 'react-native-paper';
import CustomSingleSelectDropDown from '../../profile/businessProfile/customSingleselectDropdown';
import CustomMultiselectDropDown from '../../profile/businessProfile/customMultiselectDropdown';
import CustomTextInput from '../../profile/businessProfile/customTextInput';
import CustomProgressBar from '../utils/customProgressBar';
import CustomAlertModal from '../../../commons/customAlert';
import CustomSingleSelect from './CustomSingleSelect';
import { values } from 'lodash';
import { Color } from '../../../../styles/constants';

export default function AddJobDetailFormOne({navigation, route}: any) {
  const {comingFromPreview, isEdit, jobId} = route.params;
  if (isEdit) {
    navigation.setOptions({title: 'Edit Job Post'});
  }
  // Initialize states
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState([]);
  const [workplace, setWorkplace] = useState('');
  const [jobType, setJobType] = useState('');

  // States for holding error messages
  const [jobTitleError, setJobTitleError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [workplaceError, setWorkplaceError] = useState('');
  const [jobTypeError, setJobTypeError] = useState('');

  // UseEffect to bind data from comingFromPreview if it exists
  useEffect(() => {
    console.log('coming from preview ::', comingFromPreview);
    if (comingFromPreview) {
      if (comingFromPreview.jobData) {
        setJobTitle(comingFromPreview.jobData?.title || '');
        setLocation(comingFromPreview.jobData?.location || []);
        setWorkplace({
          value: comingFromPreview.jobData?.workplace[0] || '',
        });
        setJobType({
          value: comingFromPreview.jobData?.jobType[0] || '',
        });
      } else {
        // Bind data from comingFromPreview to respective fields
        setJobTitle(comingFromPreview?.jobTitle || '');
        setLocation(comingFromPreview?.location || []);
        setWorkplace({
          value: comingFromPreview?.workplace || '',
        });
        setJobType({
          value: comingFromPreview?.jobType || '',
        });
      }
    }
  }, [comingFromPreview]);

  // Function to validate form data
  const validateForm = () => {
    let isValid = true;

    // Validate job title
    if (!jobTitle.trim()) {
      setJobTitleError('Job title is required');
      isValid = false;
    } else {
      setJobTitleError('');
    }

    // Validate location
    if (location.length === 0) {
      setLocationError('Location is required');
      isValid = false;
    } else {
      setLocationError('');
    }

    // Validate workplace
    if (!workplace) {
      setWorkplaceError('Workplace is required');
      isValid = false;
    } else {
      setWorkplaceError('');
    }

    // Validate job type
    if (!jobType) {
      setJobTypeError('Job type is required');
      isValid = false;
    } else {
      setJobTypeError('');
    }

    return isValid;
  };

  // Function to handle form submission
  // const handleNext = () => {
  //   if (validateForm()) {
  //     const formData = {
  //       jobTitle,
  //       location: location.map((loc: any) => loc.City), // Extract only city names
  //       workplace: workplace.value, // Pass only the value for workplace
  //       jobType: jobType.value, // Pass only the value for jobType
  //     };

  //     navigation.navigate('addJobDetailFormTwo', {
  //       formData: comingFromPreview || formData,
  //       isEdit: isEdit,
  //       jobId: jobId,
  //     });
  //   }
  // };
  const handleNext = () => {
    if (validateForm()) {
      // Prepare formData only with updated fields
      const formData = {
        ...(jobTitle && { jobTitle }), // Only add jobTitle if it's valid
        ...(location.length > 0 && location.some(loc => loc && loc.City) && { 
          location: location.map((loc: any) => loc.City || loc) // Only map if location has valid values
        }),
        ...(workplace?.value && { workplace: workplace.value }), // Only add workplace if valid
        ...(jobType?.value && { jobType: jobType.value }), // Only add jobType if valid
      };
  
      // Merge with comingFromPreview while keeping original values if unchanged
      const updatedFormData = {
        ...comingFromPreview,
        jobData: {
          ...comingFromPreview?.jobData,
          ...(formData.jobTitle && { title: formData.jobTitle }), // Only overwrite title if changed
          ...(formData.location && { location: formData.location }), // Only overwrite location if changed
          ...(formData.workplace && { workplace: [formData.workplace] }), // Only overwrite workplace if changed
          ...(formData.jobType && { jobType: [formData.jobType] }), // Only overwrite jobType if changed
        },
      };
  
      console.log('Updated Form Data: ', updatedFormData); // Verify final formData structure
      navigation.navigate('addJobDetailFormTwo', {
        formData: updatedFormData,
        isEdit: isEdit,
        jobId: jobId,
      });
    }
  };
  

  const workplaceData = [
    {value: 'On-Site', key: 'On-Site'},
    {value: 'Remote', key: 'Remote'},
    {value: 'Hybrid', key: 'Hybrid'},
  ];

  const jobTypeData = [
    {value: 'Full-Time', key: 'Full-Time'},
    {value: 'Part-Time', key: 'Part-Time'},
    {value: 'Contract', key: 'Contract'},
  ];

  const handleBack = () => {
    navigation.goBack();
  };
  const [isModalVisible, setModalVisible] = useState(false);

  const handleModalConfirm = () => {
    setModalVisible(false);
    handleBack();
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={styles.main}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={{paddingHorizontal: 15, marginTop: 20}}>
          <CustomProgressBar progress={0.0} />
        </View>
        <View style={styles.container}>
          <Text style={styles.pageTitle}>Details</Text>
          {/* Job Title Input */}
          <CustomTextInput
            label="Job Title *"
            placeholder="Enter job title"
            value={jobTitle}
            onChangeText={setJobTitle}
            iconName="account-outline"
            error={jobTitleError}
            onFocus={() => setJobTitleError('')}
          />
          {/* Location Multi-select Dropdown */}
          <CustomMultiselectDropDown
            label="Location *"
            placeholder="Select location"
            data={cityData}
            selectedValues={location}
            setSelectedValues={setLocation}
            onFocus={() => setLocationError('')}
            dataType="object"
            required={() => true}
            error={locationError}
          />
          {/* Workplace Single-select Dropdown */}
          {/* <CustomSingleSelectDropDown
            label="Workplace Mode*"
            placeholder="Select workplace type"
            data={workplaceData}
            selectedValue={workplace}
            setSelectedValue={setWorkplace}
            onFocus={() => setWorkplaceError('')}
            required={() => true}
            error={workplaceError}
          /> */}
          {/* Job Type Single-select Dropdown */}
          {/* <CustomSingleSelectDropDown
            label="Job Type *"
            placeholder="Select job type"
            data={jobTypeData}
            selectedValue={jobType}
            setSelectedValue={setJobType}
            onFocus={() => setJobTypeError('')}
            required={() => true}
            error={jobTypeError}
          /> */}
          <CustomSingleSelect
            label="Workplace Mode *"
            placeholder="Select workplace type"
            data={[
              { label: "On-Site", value: "On-Site" },
              { label: "Hybrid", value: "Hybrid" },
              { label: "Remote", value: "Remote" },
            ]}
            selectedValue={workplace}
            setSelectedValue={setWorkplace}
            onFocus={() => setWorkplaceError("")}
            required={() => true}
            error={workplaceError}
          />
          
          <CustomSingleSelect
            label="Job Type *"
            placeholder="Select job type"
            data={[
              { label: "Full-Time", value: "Full-Time" },
              { label: "Part-Time", value: "Part-Time" },
            ]}
            selectedValue={jobType}
            setSelectedValue={setJobType}
            onFocus={() => setJobTypeError("")}
            error={jobTypeError}
          />

        </View>
      </ScrollView>
      <View>
        
        {/* Navigation Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bottomButton, styles.bottomApply]}
            onPress={handleNext}>
            <Text style={[styles.buttonText, styles.buttonActiveText]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
        {isModalVisible && (
          <CustomAlertModal
            visible={isModalVisible}
            title="Discard Changes"
            description="The changes will not be saved. Are you sure you want to discard these changes?"
            buttonOneText="Discard"
            buttonTwoText="Cancel"
            onPressButton1={handleModalConfirm}
            onPressButton2={handleModalCancel}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 75,
  },
  container: {
    marginTop: 10,
    padding: 15,
  },
  pageTitle: {
    color: '#1E1E1E',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Gilroy-SemiBold',
    marginBottom: 20,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    padding: 10,
    paddingHorizontal: 20,
    height: 106,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    width: '100%',
    justifyContent: 'center',
    gap:20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.04)',
        shadowOffset: {width: 0, height: -6},
        shadowOpacity: 3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  bottomButton: {
    height: 52,
    // width: 171,
    width:'47%',
    backgroundColor: Color.white,
    borderWidth:1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  bottomApply: {
    backgroundColor: 'rgba(44, 44, 44, 1)',
  },
  buttonText: {
    fontWeight: '400',
    fontSize: 15,
    fontFamily: 'Gilroy-SemiBold',
    color: '#000000',
  },
  buttonActiveText: {
    color: '#FFFFFF',
  },
});
