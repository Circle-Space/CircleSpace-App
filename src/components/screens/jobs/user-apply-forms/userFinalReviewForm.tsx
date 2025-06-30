import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {Appbar, Divider, List, TextInput} from 'react-native-paper';
import CustomProgressBar from '../utils/customProgressBar';
import {ScrollView} from 'react-native-gesture-handler';
import {get, post} from '../../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTextInput from '../../profile/businessProfile/customTextInput';
import CustomAlertModal from '../../../commons/customAlert';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../../styles/constants';

const UserFinalReviewForm = ({route}: any) => {
  const {formData, jobId} = route.params;
  const navigation = useNavigation();
  const [token, setToken] = useState('');
  console.log('job Data 32 :', formData);
  useEffect(() => {
    fetchToken();
  }, []);
  const [isTokenFetched, setIsTokenFetched] = useState(false);
  const [storedUserData, setStoredUserData] = useState();
  // console.log('32 coming data : ', comingFromPreview);
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('user');
        setStoredUserData(JSON.parse(userData!));
        if (savedToken !== null) {
          setToken(savedToken);
        } else {
          setToken('No token found');
        }
        setIsTokenFetched(true);
      } catch (error) {
        console.error('Failed to fetch token:', error);
        setToken('Error fetching token');
        setIsTokenFetched(true);
      }
    };
    fetchToken();
  }, []);
  const fetchToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken !== null) {
        setToken(savedToken);
      } else {
        setToken('No token found');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setToken('Error fetching token');
    }
  };

  const routeToApplyJob = (index: any, formData: any) => {
    const comingFromPreview = formData;
    if (index === 1) {
      navigation.navigate('contactInfoForm' as never, {
        comingFromPreview,
        jobId,
      });
    } else {
      navigation.navigate('ProfessionalDetailForm' as never, {
        comingFromPreview,
        jobId,
      });
    }
  };

  const applyJob = async () => {
    try {
      const response = await post('user/update-jobprofiledata', formData);
      if (response.status === 200) {
        const jobTitle = response?.jobProfile?.applicantData?.jobTitle;
        const statusResponse = await get(`jobs/apply-job/${jobId}`, '', token);
        if (statusResponse.status === 200) {
          // Handle status update success
          navigation.navigate('ApplySuccessScreen' as never, {
            jobTitle,
          });
        } else {
          console.error('Failed to update status:', statusResponse.error);
        }
      } else {
        Alert.alert(response.error);
        console.error('Failed to save job post:', response.error);
      }
    } catch (error) {
      console.error('Error saving job post:', error);
    }
  };

  const openLink = (title: any, link: any) => {
    if (link) {
      navigation.navigate('PDFViewer', {
        title: title,
        url: link,
      });
    } else {
      Alert.alert('No File found');
    }
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const handleModalConfirm = async () => {
    setModalVisible(false);
    navigation.navigate('Home' as never);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action icon="close" onPress={() => setModalVisible(true)} />
        <Appbar.Content
          title={`Apply for ${formData?.jobTitle}`}
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <View style={{paddingHorizontal: 15, marginTop: 10}}>
        <CustomProgressBar progress={100.0} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.reviewTitle}>Review your application</Text>
        <Text style={styles.reviewSubtitle}>
          The employers will also receive a copy of your profile
        </Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.heading}>Contact Information</Text>
          <TouchableOpacity onPress={() => routeToApplyJob(1, formData)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.profileContainer}>
            {/* Profile Image */}
            <Image
              source={{
                uri:
                  formData?.profilePic ||
                  'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
              }}
              style={styles.profileImage}
            />

            {/* Text Container */}
            <View style={styles.textContainer}>
              {/* Name */}
              <Text style={styles.nameText}>{formData?.name}</Text>

              {/* Description */}
              {formData?.bio && (
                <Text style={styles.descriptionText}>{formData?.bio}</Text>
              )}
            </View>
          </View>
        </View>

        <CustomTextInput
          label="Email ID"
          placeholder="Enter your email"
          value={formData.email}
          iconName="email-outline"
          readOnly={true}
          autoCapitalize="none"
        />

        <CustomTextInput
          label="Contact No."
          placeholder="Enter your contact number"
          value={formData.phone}
          iconName="phone-outline"
          readOnly={true}
          autoCapitalize="none"
        />
        {formData.resume && (
          <View style={styles.sectionHeader}>
            <Text style={styles.heading}>Resume</Text>
            <TouchableOpacity onPress={() => routeToApplyJob(2, formData)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
        {formData.resume && (
          <View style={styles.cardContainer}>
            <View style={[styles.profileContainer, styles.cardContain]}>
              {/* Profile Image */}
              <Image
                source={require('../../../../assets/jobs/apply/pdfBlackIcon.png')}
                style={styles.resumeIcon}
              />
              {/* Text Container */}
              <View style={styles.resumeTextContainer}>
                {/* Name */}
                <Text style={styles.nameText}>Resume</Text>
                {/* Description */}
                {/* {formData?.bio && (
                  <Text style={styles.descriptionText}>{formData?.bio}</Text>
                )} */}
              </View>
              <TouchableOpacity
                onPress={() => {
                  openLink('Resume', formData.resume);
                }}>
                <Image
                  source={require('../../../../assets/jobs/apply/viewBlackIcon.png')}
                  style={styles.resumeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {formData.portfolio && (
          <View style={styles.sectionHeader}>
            <Text style={styles.heading}>Portfolio</Text>
            <TouchableOpacity onPress={() => routeToApplyJob(2, formData)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
        {formData.portfolio && (
          <View style={styles.cardContainer}>
            <View style={[styles.profileContainer, styles.cardContain]}>
              {/* Profile Image */}
              <Image
                source={require('../../../../assets/jobs/apply/pdfIcon.png')}
                style={styles.profileImage}
              />
              {/* Text Container */}
              <View style={styles.textContainer}>
                {/* Name */}
                <Text style={styles.nameText}>Portfolio</Text>

                {/* Description */}
                {/* {formData?.bio && (
                  <Text style={styles.descriptionText}>{formData?.bio}</Text>
                )} */}
              </View>
              <TouchableOpacity
                onPress={() => {
                  openLink('Portfolio', formData.portfolio);
                }}>
                <Image
                  source={require('../../../../assets/jobs/apply/viewIcon.png')}
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.formFields}>
          <CustomTextInput
            label="Portfolio Link"
            placeholder="Enter your portfolio link"
            value={formData.portfolioLink}
            iconName="link"
            readOnly={true}
            autoCapitalize="none"
          />
          <CustomTextInput
            label="Work Experience"
            placeholder="Enter your work experience"
            value={formData.experience}
            iconName="briefcase-outline"
            readOnly={true}
            autoCapitalize="none"
          />
          <CustomTextInput
            label="Notice Period"
            placeholder="Enter your notice period"
            value={formData.noticePeriod}
            iconName="calendar-outline"
            readOnly={true}
            autoCapitalize="none"
          />
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.bottomButton, styles.bottomApply]}
          onPress={applyJob}>
          <Text style={[styles.buttonText, styles.buttonActiveText]}>
            Submit
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 16,
    color: '#1E1E1E',
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: '400',
    textAlign: 'center',
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    marginVertical: 8,
    fontFamily: 'Gilroy-SemiBold',
    marginBottom: 10,
  },
  reviewSubtitle: {
    fontSize: 12,
    fontFamily: 'Gilroy-Regular',
    color: '#4A4A4A',
    fontWeight: '400',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  heading: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1E1E1E',
    fontFamily: 'Gilroy-SemiBold',
  },
  noText: {
    fontSize: FontSizes.medium,
    fontWeight: '400',
    color: Color.black,
    fontFamily: FontFamilies.regular,
  },
  editText: {
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.medium,
    color: Color.black,
    fontWeight: '400',
  },
  professionalField: {
    backgroundColor: '#FFF5EE',
    padding: 10,
    borderRadius: 12,
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  subItemText: {
    fontSize: 12,
    color: '#7B7B7B',
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
    backgroundColor: '#FFF',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomButton: {
    height: 52,
    width: '100%',
    backgroundColor: '#D9D9D9',
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
  // prof card
  contactcardContainer: {
    backgroundColor: Color.black, // Light background color
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:20,
  },
   cardContainer: {
    backgroundColor: Color.black, // Light background color
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:20,
  },
  formFields: {
    marginTop: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContain: {
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 15,
  },
  resumeIcon: {
    backgroundColor:Color.white,
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 5,
  },
  resumeTextContainer: {
    flex: 1,
    borderRightWidth: 1,
    borderLeftWidth:1,
    borderColor:Color.white,
    marginHorizontal:10,
    paddingHorizontal:10,
    height:25,
    alignItems:'flex-start', 
    justifyContent:'center',
  },
  
  textContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '400',
    color: Color.white,
    fontFamily: FontFamilies.semibold,
  },
  descriptionText: {
    fontSize: 12,
    fontWeight: '400',
    color: Color.white,
    fontFamily: FontFamilies.regular,
    lineHeight:LineHeights.small,
  },
  contacttextContainer: {
    flex: 1,
  },
  contactnameText: {
    fontSize: FontSizes.medium,
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: 'Gilroy-SemiBold',
  },
  contactdescriptionText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#ffffff',
    fontFamily: 'Gilroy-Regular',
    lineHeight:14.4,
  },
});

export default UserFinalReviewForm;
