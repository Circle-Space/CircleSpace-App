import MultiSlider from '@ptomasroos/react-native-multi-slider';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Text} from 'react-native';
import {post} from '../../../../services/dataRequest';
import {useNavigation} from '@react-navigation/native';
import CustomAlertModal from '../../../commons/customAlert';
import CustomTextInput from '../../profile/businessProfile/customTextInput';
import CustomSingleSelect from './CustomSingleSelect';
import CustomProgressBar from '../utils/customProgressBar';
import CustomRichTextInput from '../../profile/businessProfile/customRichTextInput';
import RichTextViewer from '../../profile/businessProfile/richTextViewer';
import jobBriefcase from '../../../../assets/jobs/jobBriefcase.png';
import { Color, FontFamilies, FontSizes } from '../../../../styles/constants';
import {Chip} from 'react-native-paper';

const FinalJobFormPreview = ({route}: any) => {
  const {formData, isEdit, jobId} = route.params;
  const [combinedFormData, setCombinedFormData] = useState<any>({
    jobTitle: '',
    location: [],
    workplace: '',
    jobType: '',
    qualifications: [],
    skills: [],
    jobDescription: '',
    salaryRange: [0, 0],
    experienceRange: [0, 0],
  });

  const [salaryRange, setSalaryRange] = useState<number[]>([0, 0]);
  const [experienceRange, setExperienceRange] = useState<number[]>([0, 0]);

  // useEffect(() => {
  //   const fetchJobData = async () => {
  //     console.log("form dataa ::",formData);

  //     try {
  //       const combinedData = {
  //         jobTitle: formData?.jobTitle || formData.jobData?.title || '',
  //         location: formData?.location || formData.jobData?.location || [],
  //         workplace:
  //           formData?.workplace || formData.jobData?.workplace?.[0] || '',
  //         jobType:
  //           formData?.jobType || formData.jobData?.jobType?.[0] || '',
  //         qualifications: formData?.qualifications || [],
  //         skills: formData?.skills || [],
  //         jobDescription:
  //           formData?.jobDescription || formData.jobData?.description || '',
  //         salaryRange: formData?.salaryRange || [0, 0],
  //         experienceRange: formData?.experienceRange || [0, 0],
  //       };

  //       setSalaryRange(combinedData.salaryRange);
  //       setExperienceRange(combinedData.experienceRange);
  //       setCombinedFormData(combinedData);
  //     } catch (error) {
  //       console.error('Failed to fetch token:', error);
  //     }
  //   };
  //   fetchJobData();
  // }, [formData]);

  useEffect(() => {
    const fetchJobData = async () => {
      console.log('form dataa ::', formData);

      try {
        // Prioritize jobData values and fallback to top-level formData values
        const combinedData = {
          jobTitle: formData?.jobData?.title || formData?.jobTitle || '',
          location: formData?.jobData?.location || formData?.location || [],
          workplace:
            formData?.jobData?.workplace?.[0] || formData?.workplace || '',
          jobType: formData?.jobData?.jobType?.[0] || formData?.jobType || '',
          qualifications:
            formData?.jobData?.qualifications || formData?.qualifications || [],
          skills: formData?.jobData?.skills || formData?.skills || [],
          jobDescription:
            formData?.jobData?.description || formData?.jobDescription || '',
          salaryRange: formData?.jobData?.salaryRange ||
            formData?.salaryRange || [0, 0],
          experienceRange: formData?.jobData?.expRange ||
            formData?.experienceRange || [0, 0],
        };

        // Set salary and experience range in their respective states
        setSalaryRange(combinedData.salaryRange);
        setExperienceRange(combinedData.experienceRange);

        // Set the combined form data
        setCombinedFormData(combinedData);
      } catch (error) {
        console.error('Failed to fetch job data:', error);
      }
    };

    fetchJobData();
  }, [formData]);

  const handleSalaryRangeChange = (values: any) => {
    setSalaryRange(values);
  };

  const handleExperienceRangeChange = (values: any) => {
    setExperienceRange(values);
  };

  const navigation = useNavigation();
  const [jobPostModalVisible, setJobPostModalVisible] = useState(false);
  const [jobPostStatus, setJobPostStatus] = useState('');
  const handleJobPost = () => {
    setJobPostModalVisible(true); // Show confirmation modal
  };
  const [isProcessing, setIsProcessing] = useState(false);
  if (isEdit) {
    navigation.setOptions({title: 'Edit Job Post'});
  }
  const handleJobPostConfirm = async () => {
    if (isProcessing) return; // Prevent multiple clicks
    setIsProcessing(true); // Set processing to true
    try {
      const payload = {
        ...combinedFormData,
        jobStatus: jobPostStatus,
        workplace: combinedFormData.workplace,
        location: combinedFormData.location,
        qualifications: combinedFormData.qualifications.map(
          (qual: any) => qual.value,
        ),
        skills: combinedFormData.skills.map((skill: any) => skill.value),
        salaryRange:
          combinedFormData.salaryRange == salaryRange
            ? combinedFormData.salaryRange
            : salaryRange,
        experienceRange:
          combinedFormData.experienceRange == experienceRange
            ? combinedFormData.experienceRange
            : experienceRange,
      };
      const response = await post('jobs/create-job', payload);
      if (response.status === 200) {
        setJobPostModalVisible(false);
        navigation.navigate('Home' as never);
      } else {
        Alert.alert(response.error);
        setJobPostModalVisible(false);
        console.error('Failed to save job post:', response.error);
      }
    } catch (error) {
      console.error('Error saving job post:', error);
    } finally {
      setIsProcessing(false); // Reset processing flag
    }
  };

  const handleJobEditConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const mapToValues = (arr: any[]) =>
        arr.map((item: any) => (typeof item === 'string' ? item : item.value));

      const payload = {
        ...combinedFormData,
        jobStatus: jobPostStatus,
        workplace: combinedFormData.workplace,
        location: combinedFormData.location,
        // If qualifications/skills are already strings, keep them; otherwise, map to 'value'
        qualifications: mapToValues(combinedFormData.qualifications),
        skills: mapToValues(combinedFormData.skills),
        salaryRange:
          combinedFormData.salaryRange == salaryRange
            ? combinedFormData.salaryRange
            : salaryRange,
        experienceRange:
          combinedFormData.experienceRange == experienceRange
            ? combinedFormData.experienceRange
            : experienceRange,
      };
      // Uncomment this when you're ready to send the request
      const response = await post(`jobs/edit-job/${jobId}`, payload);
      if (response.status === 200) {
        setJobPostModalVisible(false);
        navigation.navigate('Jobs' as never);
      } else {
        Alert.alert(response.error);
        setJobPostModalVisible(false);
        console.error('Failed to save job post:', response.error);
      }
    } catch (error) {
      console.error('Error saving job post:', error);
    } finally {
      setIsProcessing(false); // Reset processing flag
    }
  };

  const handleJobPostCancel = () => {
    setJobPostModalVisible(false);
  };

  const routeToEdit = (pageId: string) => {
    const routes: {[key: string]: string} = {
      '1': 'AddJobDetailFormOne',
      '2': 'addJobDetailFormTwo',
      '3': 'addJobDetailFormThree',
    };
    navigation.navigate(routes[pageId] as never, {
      comingFromPreview: combinedFormData,
    });
  };

  const formatLocation = (locations: any[]) => {
    return locations.join(', ');
  };

  const formatQualifications = (qualifications: any[]) => {
    return qualifications
      .map(qual =>
        typeof qual === 'object' && qual?.label ? qual.label : qual,
      )
      .join(', ');
  };

  const formatSkills = (skills: any[]) => {
    return skills
      .map(skill =>
        typeof skill === 'object' && skill?.label ? skill.label : skill,
      )
      .join(', ');
  };

// Function to handle removal of a chip
const handleRemoveItem = (itemToRemove: any) => {
};

// Function to get display value of qualification
const getItemDisplayValue = (item: any) => {
  return typeof item === 'string' ? item : item.name || item.label || JSON.stringify(item);
};


  return (
    <View>
      <ScrollView style={{marginBottom: 50}}>
        <View style={styles.container}>
          <View style={{marginTop: 0, marginBottom: 40}}>
            <CustomProgressBar progress={100.0} />
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Details</Text>
            <TouchableOpacity onPress={() => routeToEdit('1')}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
          <CustomTextInput
            label="Job Title"
            placeholder="Job Title"
            value={combinedFormData.jobTitle}
            readOnly={true}
            style={styles.input}
            // iconName="briefcase-outline"
            iconImage={jobBriefcase}
          />
          <CustomTextInput
            label="Location"
            placeholder="Selected Location"
            // value={formatLocation(combinedFormData.location)}
            readOnly={true}
            numberOfLines={2}
            style={styles.input}
            // iconName="map-marker-outline"
          />
          {combinedFormData.location.length > 0 && (
            <View style={styles.chipContainer}>
              {combinedFormData.location.map((item, index) => (
                <Chip
                  textStyle={{ fontSize: FontSizes.small, color: Color.white }}
                  key={index}
                  style={styles.chip}
                  selectedColor="white"
                  onClose={() => handleRemoveItem(item)}
                >
                  {getItemDisplayValue(item)}
                </Chip>
              ))}
            </View>
          )}
          <CustomTextInput
            label="Workplace"
            placeholder="Workplace"
            value={combinedFormData.workplace}
            readOnly={true}
            style={styles.input}
            iconName="office-building-outline"
          />         

          <CustomTextInput
            label="Job Type"
            placeholder="Job Type"
            value={combinedFormData.jobType}
            readOnly={true}
            style={styles.input}
            iconName="briefcase-check-outline"
          />
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <TouchableOpacity onPress={() => routeToEdit('2')}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
          {/* <CustomTextInput
            label="Qualifications"
            placeholder="Qualifications"
            value={formatQualifications(combinedFormData.qualifications)}
            readOnly={true}
            numberOfLines={2}
            style={styles.input}
            iconName="school-outline"
          /> */}
            <>
          {/* Qualifications Input Field */}
          <CustomTextInput
            label="Qualifications"
            placeholder=" Selected Qualifications"
            // value={selectedValues.join(', ')} // Join values for display
            readOnly={true}
            numberOfLines={2}
            style={styles.input}
            // iconName="school-outline"
          />

          {/* Display Selected Qualifications as Chips */}
          {combinedFormData.qualifications.length > 0 && (
            <View style={styles.chipContainer}>
              {combinedFormData.qualifications.map((item, index) => (
                <Chip
                  textStyle={{ fontSize: FontSizes.small, color: Color.white }}
                  key={index}
                  style={styles.chip}
                  selectedColor="white"
                  onClose={() => handleRemoveItem(item)}
                >
                  {getItemDisplayValue(item)}
                </Chip>
              ))}
            </View>
          )}
        </>
          <CustomTextInput
            label="Skills"
            placeholder="Skills"
            // value={formatSkills(combinedFormData.skills)}
            readOnly={true}
            numberOfLines={2}
            style={styles.input}
            iconName="star-outline"
          />
          {combinedFormData.skills.length > 0 && (
            <View style={styles.chipContainer}>
              {combinedFormData.skills.map((item, index) => (
                <Chip
                  textStyle={{ fontSize: FontSizes.small, color: Color.white }}
                  key={index}
                  style={styles.chip}
                  selectedColor="white"
                  onClose={() => handleRemoveItem(item)}
                >
                  {getItemDisplayValue(item)}
                </Chip>
              ))}
            </View>
          )}
          {/* <RichTextViewer htmlContent={combinedFormData.jobDescription} /> */}
          <RichTextViewer
            htmlContent={combinedFormData.jobDescription}
            label="Job Description"
            iconName="file-document-outline"
            iconSize={16}
            iconColor="#000"
          />
          {/* <CustomRichTextInput
            label="Job Description"
            placeholder="Job Description"
            value={combinedFormData.jobDescription}
            readOnly={true}
            hideToolBar={true}
            minHeight={50}
            numberOfLines={4}
            iconName="file-document-outline"
          /> */}
          {/* <CustomTextInput
            label="Job Description"
            placeholder="Job Description"
            value={combinedFormData.jobDescription}
            readOnly={true}
            numberOfLines={4}
            style={[styles.input, { height: 100 }]}
            iconName="file-document-outline"
          /> */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Compensation</Text>
            <TouchableOpacity onPress={() => routeToEdit('3')}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.label}>Salary Range</Text>
            <MultiSlider
              values={salaryRange}
              onValuesChange={handleSalaryRangeChange}
              min={0}
              max={25}
              step={1}
              allowOverlap={false}
              snapped
              sliderLength={Dimensions.get('window').width * 0.83}
              containerStyle={{width: '100%', alignSelf: 'center'}}
              selectedStyle={{
                backgroundColor: '#1E1E1E',
              }}
              unselectedStyle={{
                backgroundColor: '#EDEDED',
              }}
              trackStyle={{
                height: 5,
              }}
              markerStyle={{
                backgroundColor: '#FFFFFF',
                height: 20,
                borderColor: '#1E1E1E',
                borderWidth: 5,
                width: 20,
              }}
            />
            <Text style={styles.sliderValue}>
              {salaryRange[0]}L - {salaryRange[1]}L
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.label}>Experience</Text>
            <MultiSlider
              values={experienceRange}
              onValuesChange={handleExperienceRangeChange}
              min={0}
              max={10}
              step={1}
              allowOverlap={false}
              snapped
              sliderLength={Dimensions.get('window').width * 0.83}
              containerStyle={{width: '100%', alignSelf: 'center'}}
              selectedStyle={{
                backgroundColor: '#1E1E1E',
              }}
              unselectedStyle={{
                backgroundColor: '#EDEDED',
              }}
              trackStyle={{
                height: 5,
              }}
              markerStyle={{
                backgroundColor: '#FFFFFF',
                height: 20,
                borderColor: '#1E1E1E',
                borderWidth: 5,
                width: 20,
              }}
            />
            <Text style={styles.sliderValue}>
              {experienceRange[0]} years - {experienceRange[1]} years
            </Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => {
            setJobPostStatus('draft');
            handleJobPost();
          }}>
          <Text style={styles.buttonText}>Save as Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, styles.bottomApply]}
          onPress={() => {
            setJobPostStatus('live');
            handleJobPost();
          }}>
          <Text style={[styles.buttonText, styles.buttonActiveText]}>Post</Text>
        </TouchableOpacity>
      </View>
      <CustomAlertModal
        visible={jobPostModalVisible}
        title="Job Post"
        description={
          jobPostStatus === 'draft'
            ? 'Are you sure you want to save this job post as a draft?'
            : jobPostStatus === 'live'
            ? 'Are you sure you want to publish this job post and make it live?'
            : `Are you sure you want to ${jobPostStatus.toLocaleUpperCase()}?`
        }
        buttonOneText={
          jobPostStatus === 'draft'
            ? 'Save as Draft'
            : jobPostStatus === 'live'
            ? 'Publish'
            : jobPostStatus.toLocaleUpperCase()
        }
        buttonTwoText="Cancel"
        onPressButton1={isEdit ? handleJobEditConfirm : handleJobPostConfirm}
        onPressButton2={handleJobPostCancel}
      />
    </View>
  );
};

// Styles for FinalJobFormPreview
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'Gilroy-SemiBold',
  },
  editButton: {
    fontSize: 13,
    fontFamily: 'Gilroy-Medium',
    color: '#3897F0',
    fontWeight: '400',
  },
  label: {
    color: 'rgba(30, 30, 30, 1)',
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 15,
    fontFamily: 'Gilroy-Regular',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  chipContainer: {
    borderColor: Color.black,
    padding: 5,
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#1E1E1E',
    margin: 4,
    height:38,
    justifyContent:'center',
  },
  sliderContainer: {
    marginBottom: 20,
    borderWidth: 0.2,
    borderColor: 'rgba(123, 123, 123, 1)',
    padding: 10,
    borderRadius: 12,
  },
  sliderValue: {
    borderColor: 'rgba(123, 123, 123, 1)',
    fontWeight: 'bold',
    fontFamily: 'Gilroy-SemiBold',
    color: 'black',
    borderWidth: 0.2,
    borderRadius: 12,
    padding: 10,
    textAlign: 'center',
    marginBottom: 10,
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
    // backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth:1,
  },
  bottomApply: {
    backgroundColor: 'rgba(44, 44, 44, 1)',
  },
  buttonText: {
    fontWeight: '400',
    fontSize: FontSizes.medium2,
    fontFamily: FontFamilies.semibold,
    color: '#000000',
  },
  buttonActiveText: {
    color: '#FFFFFF',
  },
});

export {FinalJobFormPreview};
