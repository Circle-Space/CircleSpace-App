/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Clipboard,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import CustomMultiselectDropDown from '../../profile/businessProfile/customMultiselectDropdown';
import CustomTextInput from '../../profile/businessProfile/customTextInput';
import CustomProgressBar from '../utils/customProgressBar';
import CustomRichTextInput from '../../profile/businessProfile/customRichTextInput';
import { Color } from '../../../../styles/constants';

export default function AddJobDetailFormTwo({navigation, route}: any) {
  const [qualifications, setQualifications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [jobDescription, setJobDescription] = useState('');

  // States for holding error messages
  const [qualificationsError, setQualificationsError] = useState('');
  const [skillsError, setSkillsError] = useState('');
  const [jobDescriptionError, setJobDescriptionError] = useState('');

  const handlePaste = async () => {
    const text = await Clipboard.getString();
    setJobDescription(prev => prev + text);
  };

  // Function to validate form data
  const validateForm = () => {
    let isValid = true;

    // Validate qualifications
    if (qualifications.length === 0) {
      setQualificationsError('Qualifications are required');
      isValid = false;
    } else {
      setQualificationsError('');
    }

    // Validate skills
    if (skills.length === 0) {
      setSkillsError('Skills are required');
      isValid = false;
    } else {
      setSkillsError('');
    }

    // Validate job description
    if (!jobDescription.trim()) {
      setJobDescriptionError('Job description is required');
      isValid = false;
    } else {
      setJobDescriptionError('');
    }

    return isValid;
  };

  const {comingFromPreview} = route.params;

  // Function to handle form submission
  const handleNext = async () => {
    if (validateForm()) {
      const secondFormData = {
        ...formData,
        qualifications,
        skills,
        jobDescription,
      };
      navigation.navigate('addJobDetailFormThree', {
        formData: comingFromPreview || secondFormData,
        isEdit: isEdit,
        jobId: jobId,
      });
    }
  };

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardOpen(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const {formData, isEdit, jobId} = route.params;
  if (isEdit) {
    navigation.setOptions({title: 'Edit Job Post'});
  }
  // Map formData to fields
  // useEffect(() => {
  //   const filterNullValues = array =>
  //     array?.filter(item => item !== null && item !== undefined) || [];

  //   if (formData) {
  //     console.log("formdata 117 ::",formData);

  //     if (formData.jobData) {
  //       setQualifications(filterNullValues(formData?.jobData?.qualifications));
  //       setSkills(filterNullValues(formData?.jobData?.skills));
  //       setJobDescription(formData?.jobData?.description || '');
  //     } else {
  //       setQualifications(filterNullValues(formData?.qualifications));
  //       setSkills(filterNullValues(formData?.skills));
  //       setJobDescription(formData?.jobDescription || '');
  //     }
  //   } else if (comingFromPreview) {
  //     if (comingFromPreview.jobData) {
  //       setQualifications(
  //         filterNullValues(comingFromPreview?.jobData?.qualifications),
  //       );
  //       setSkills(filterNullValues(comingFromPreview?.jobData?.skills));
  //       setJobDescription(comingFromPreview?.jobData?.description || '');
  //     } else {
  //       setQualifications(filterNullValues(comingFromPreview?.qualifications));
  //       setSkills(filterNullValues(comingFromPreview?.skills));
  //       setJobDescription(comingFromPreview?.jobDescription || '');
  //     }
  //   }
  // }, [formData, comingFromPreview]);

  useEffect(() => {
    const filterNullValues = (array:any) =>
      array?.filter((item:any) => item !== null && item !== undefined) || [];
  
    if (formData) {
      // If formData has jobData, extract values from it
      if (formData.jobData) {
        setQualifications(
          filterNullValues(formData?.jobData?.qualifications || formData?.qualifications || [])
        );
        setSkills(
          filterNullValues(formData?.jobData?.skills || formData?.skills || [])
        );
        const description = formData?.jobData?.description || formData?.jobDescription || '';
        setJobDescription(description);  // Set description properly
      } else {
        // Fallback to top-level if jobData doesn't exist
        setQualifications(filterNullValues(formData?.qualifications || []));
        setSkills(filterNullValues(formData?.skills || []));
        const description = formData?.jobDescription || '';
        setJobDescription(description);  // Set fallback description properly
      }
    } else if (comingFromPreview) {
      // Fallback to comingFromPreview if no formData
      if (comingFromPreview.jobData) {
        setQualifications(
          filterNullValues(comingFromPreview?.jobData?.qualifications || comingFromPreview?.qualifications || [])
        );
        setSkills(
          filterNullValues(comingFromPreview?.jobData?.skills || comingFromPreview?.skills || [])
        );
        const description = comingFromPreview?.jobData?.description || comingFromPreview?.jobDescription || '';
        setJobDescription(description);  // Set description properly
      } else {
        // Fallback to top-level if jobData doesn't exist
        setQualifications(filterNullValues(comingFromPreview?.qualifications || []));
        setSkills(filterNullValues(comingFromPreview?.skills || []));
        const description = comingFromPreview?.jobDescription || '';
        setJobDescription(description);  // Set fallback description properly
      }
    }
  }, [formData, comingFromPreview]);

  
  
  const qualificationsData = [
    {
      key: 'HighSchoolDiploma',
      value: 'HighSchoolDiploma',
      label: 'High School Diploma',
    },
    {
      key: 'AssociateDegree',
      value: 'AssociateDegree',
      label: 'Associate Degree',
    },
    {
      key: 'BachelorsDegree',
      value: 'BachelorsDegree',
      label: "Bachelor's Degree",
    },
    {key: 'MastersDegree', value: 'MastersDegree', label: "Master's Degree"},
    {
      key: 'PostgraduateDiploma',
      value: 'PostgraduateDiploma',
      label: 'Postgraduate Diploma',
    },
    {
      key: 'MBA',
      value: 'MBA',
      label: 'MBA (Master of Business Administration)',
    },
  ];

  const skillsData = [
    {
      key: 'ProjectManagement',
      value: 'ProjectManagement',
      label: 'Project Management',
    },
    {key: 'RiskManagement', value: 'RiskManagement', label: 'Risk Management'},
    {
      key: 'BudgetManagement',
      value: 'BudgetManagement',
      label: 'Budget Management',
    },
    {key: 'InteriorDesign', value: 'InteriorDesign', label: 'Interior Design'},
    {key: 'SpacePlanning', value: 'SpacePlanning', label: 'Space Planning'},
    {
      key: 'FurnitureDesign',
      value: 'FurnitureDesign',
      label: 'Furniture Design',
    },
    {key: 'AutoCAD', value: 'AutoCAD', label: 'AutoCAD'},
    {key: 'Architecture', value: 'Architecture', label: 'Architecture'},
    {key: 'Revit', value: 'Revit', label: 'Revit'},
    {
      key: 'SustainableDesign',
      value: 'SustainableDesign',
      label: 'Sustainable Design',
    },
  ];

  const stripHtml = (html:any) => {
    return html.replace(/<\/?[^>]+(>|$)/g, ""); // Regular expression to strip HTML tags
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
          <CustomProgressBar progress={30.0} />
        </View>
        <View style={styles.container}>
          <Text style={styles.pageTitle}>Requirements</Text>

            {/* Qualifications Dropdown */}
            <CustomMultiselectDropDown
              label="Qualifications *"
              placeholder="Select qualifications"
              data={qualificationsData}
              selectedValues={qualifications}
              setSelectedValues={setQualifications}
              onFocus={() => setQualificationsError('')}
              dataType="object"
              required={true}
              error={qualificationsError}
            />
            {/* Skills Dropdown */}
            <CustomMultiselectDropDown
              label="Skills *"
              placeholder="Select skills"
              data={skillsData}
              selectedValues={skills}
              setSelectedValues={setSkills}
              onFocus={() => setSkillsError('')}
              dataType="object"
              required={true}
              error={skillsError}
            />

            {/* <CustomTextInput
              label="Job Description *"
              placeholder="Enter description"
              value={jobDescription}
              onChangeText={setJobDescription}
              iconName=""
              multiline={true}
              numberOfLines={5}
              isRichText={true}
            /> */}
            <CustomRichTextInput
              label="Job Description *"
              placeholder="Enter your job description here..."
              // value={jobDescription}
              value={stripHtml(jobDescription)}
              onChangeText={setJobDescription}
              readOnly={false}
              minHeight={200}
            />
          </View>
        
      
      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => navigation.goBack()}>
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
        </ScrollView>
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
