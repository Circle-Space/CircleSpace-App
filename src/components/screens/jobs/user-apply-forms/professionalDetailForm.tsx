import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Appbar, TextInput} from 'react-native-paper';
import CustomProgressBar from '../utils/customProgressBar';
import DocumentPicker from 'react-native-document-picker';
import {get} from '../../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AWS, {S3} from 'aws-sdk';
import CustomTextInput from '../../profile/businessProfile/customTextInput';
import {ScrollView} from 'react-native-gesture-handler';
import { Color, FontFamilies, FontSizes, LetterSpacings, LineHeights } from '../../../../styles/constants';

const ProfessionalDetailForm = ({route}: any) => {
  const {formData, jobId} = route.params;
  console.log('form data :', formData);
  const navigation = useNavigation();

  const [portfolioLink, setPortfolioLink] = useState('');
  const [experience, setExperience] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [resume, setResume] = useState<any>(null);
  const [portfolio, setPortfolio] = useState(null);
  const [errors, setErrors] = useState({
    resume: '',
    portfolioLink: '',
    experience: '',
    noticePeriod: '',
  });

  const [token, setToken] = useState('');
  const [isTokenFetched, setIsTokenFetched] = useState(false);
  const [storedUserData, setStoredUserData] = useState();

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

  useEffect(() => {
    if (isTokenFetched) {
      const fetchData = async () => {
        try {
          const data = await get(`user/get-jobprofiledata`, {}, token);
          if (data.status == 200) {
            console.log('data 67 : ', data?.jobProfile);
            setPortfolio(
              data?.jobProfile?.applicantData?.portfolio ??
                formData.portfolio ??
                '',
            );
            setresumeUrl(
              data?.jobProfile?.applicantData?.resume ?? formData?.resume ?? '',
            );
            setPortfolioLink(
              data?.jobProfile?.applicantData?.portfolioLink ??
                formData.portfolioLink ??
                '',
            );
            setExperience(
              data?.jobProfile?.applicantData?.experience ??
                formData?.experience ??
                '',
            );
            setNoticePeriod(
              data?.jobProfile?.applicantData?.noticePeriod ??
                formData?.noticePeriod ??
                '',
            );
          } else {
            Alert.alert('Error', data.message || 'Failed to fetch data');
          }
        } catch (error) {
          Alert.alert('Error', 'An error occurred while fetching data');
        }
      };
      fetchData();
    }
  }, [isTokenFetched, token]);

  const validateFields = () => {
    let valid = true;
    let errorsCopy = {...errors};

    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const numberRegex = /^\d+$/;

    // Check if resume is uploaded
    if (!resumeUrl) {
      errorsCopy.resume = 'Resume is required';
      valid = false;
    }

    if (portfolioLink && !urlRegex.test(portfolioLink)) {
      errorsCopy.portfolioLink = 'Invalid URL';
      valid = false;
    } else {
      errorsCopy.portfolioLink = '';
    }

    if (!experience) {
      errorsCopy.experience = 'Experience is required';
      valid = false;
    } else if (!numberRegex.test(experience)) {
      errorsCopy.experience = 'Invalid Experience';
      valid = false;
    } else {
      errorsCopy.experience = '';
    }

    if (!noticePeriod) {
      errorsCopy.noticePeriod = 'Notice period is required';
      valid = false;
    } else if (!numberRegex.test(noticePeriod)) {
      errorsCopy.noticePeriod = 'Invalid Notice period';
      valid = false;
    } else {
      errorsCopy.noticePeriod = '';
    }

    setErrors(errorsCopy);
    return valid;
  };

  const onReviewClicked = () => {
    if (validateFields()) {
      const updatedFormData = {
        ...formData,
        portfolioLink,
        experience,
        noticePeriod,
        resume: resumeUrl,
        portfolio: portfolioUrl,
      };
      navigation.navigate('UserFinalReviewForm', {
        formData: updatedFormData,
        jobId: jobId,
      });
    }
  };

  const [resumeUrl, setresumeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [portfolioName, setPortfolioName] = useState('');

  const handleDocumentPicker = async (
    type: 'resume' | 'portfolio',
    submitAction: boolean,
  ) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.doc, DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });

      for (const r of res) {
        const filePath = r.fileCopyUri;
        const fileName = r.name;
        const fileData = await fetchFileData(filePath!);
        if (!fileData) throw new Error('Failed to fetch file data');
        if (submitAction) {
          if (type === 'resume') {
            const bucketName = 'resumes';
            const fileUrl = await uploadFileToS3(
              bucketName,
              fileName,
              fileData,
            );
            console.log('186 : file url :', fileUrl);
            setresumeUrl(fileUrl);
            setResumeName(fileName!);
            // Handle setting file URL to state or sending it to server
          } else if (type === 'portfolio') {
            const bucketName = 'portfolio';
            const fileUrl = await uploadFileToS3(
              bucketName,
              fileName,
              fileData,
            );
            setPortfolioUrl(fileUrl);
            setPortfolioName(fileName!);
            // Handle setting file URL to state or sending it to server
          }
        } else {
          type == 'resume'
            ? setResumeName(fileName)
            : setPortfolioName(fileName);
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Unknown error:', err);
        Alert.alert('Error', 'Failed to pick the file. Please try again.');
      }
    }
  };

  const S3_BUCKET = 'csappproduction-storage';
  const REGION = 'ap-south-1';
  const ACCESS_KEY = 'AKIAU6GDZYODLC5QOLPX';
  const SECRET_KEY = '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';

  // AWS configuration
  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
  });

  const s3 = new AWS.S3();

  const fetchFileData = async (filePath: string) => {
    try {
      const response = await fetch(filePath);
      if (!response.ok)
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      return await response.blob();
    } catch (error) {
      console.error('Error fetching file data:', error);
      Alert.alert('Error', 'Failed to fetch the file data. Please try again.');
      return null;
    }
  };

  const uploadFileToS3 = async (
    bucketName: string,
    fileName: string,
    fileData: Blob,
  ) => {
    const params = {
      Bucket: S3_BUCKET,
      Key: `${bucketName}/${fileName}`,
      Body: fileData,
      ContentType: fileData.type,
      ACL: 'public-read',
    };

    try {
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      Alert.alert('Error', 'Failed to upload the file. Please try again.');
      throw error;
    }
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.main}>
      <Appbar.Header>
        <Appbar.Content
          titleStyle={styles.appHeader}
          title={`Apply for ${formData?.jobTitle}`}
        />
      </Appbar.Header>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
      <View style={{paddingHorizontal: 15, marginTop: 10}}>
        <CustomProgressBar progress={50.0} />
      </View>
        <View style={styles.scrollContent}>
          <Text style={styles.heading}>Professional Details</Text>
          {/* resume */}
          <View style={styles.fileViewCard}>
            <Text style={styles.labelText}>Resume *</Text>
            {/* Upload Card */}
            <TouchableOpacity
              style={styles.uploadCard}
              onPress={() => {
                handleDocumentPicker('resume', true);
              }}>
              <Image
                source={require('../../../../assets/jobs/uploadIcon.png')} // Replace with your icon URL or local asset
                style={styles.uploadIcon}
              />
              {/* Description Text */}
              <Text style={styles.descriptionText}>
                {resumeUrl
                  ? resumeName
                    ? resumeName
                    : 'Resume.pdf'
                  : 'Choose or browse file'}
              </Text>

              {/* Upload Button */}
              {!resumeUrl ? (
                <View style={styles.resumeUploadButton}>
                  <Text style={styles.uploadButtonText}>Upload Resume</Text>
                </View>
              ) : (
                <View style={styles.resumeUploadButton}>
                  <Text style={styles.uploadButtonText}>Change Resume</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {errors.resume && (
            <Text style={styles.resumeError}>{errors.resume}</Text>
          )}
          <Text style={styles.resumeHint}>
            (Upload your most recent resume*)
          </Text>
          {/* portfolio */}
          <View style={styles.fileViewCard}>
            <Text style={styles.labelText}>Portfolio</Text>
            <TouchableOpacity
              style={styles.uploadCard}
              onPress={() => {
                handleDocumentPicker('portfolio', true);
              }}>
              {/* Upload Icon */}
              <TouchableOpacity
                onPress={() => handleDocumentPicker('portfolio', false)}>
                <Image
                  source={require('../../../../assets/jobs/addIcon.png')} // Replace with your icon URL or local asset
                  style={styles.uploadIcon}
                />
              </TouchableOpacity>

              {/* Description Text */}
              <Text style={styles.descriptionText}>
                {portfolioUrl
                  ? portfolioName
                    ? portfolioName
                    : 'Portfolio.pdf'
                  : 'Choose or browse file'}
              </Text>
              {/* Upload Button */}
              {!portfolioUrl ? (
                <View style={styles.resumeUploadButton}>
                  <Text style={styles.uploadButtonText}>Upload Portfolio</Text>
                </View>
              ) : (
                <View style={styles.resumeUploadButton}>
                  <Text style={styles.uploadButtonText}>Change Portfolio</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={{marginVertical: 20}}>
            <CustomTextInput
              label="Portfolio Link"
              placeholder="Enter your portfolio link"
              value={portfolioLink}
              onChangeText={(text: any) => setPortfolioLink(text)}
              error={errors.portfolioLink}
              onFocus={() => setErrors({...errors, portfolioLink: ''})}
              iconName="link" // Assuming an icon for the portfolio link
              autoCapitalize="none"
            />

            <CustomTextInput
              label="Experience (in Years) *"
              placeholder="Enter your experience (in Years)"
              value={experience}
              onChangeText={(text: any) => setExperience(text)}
              error={errors.experience}
              onFocus={() => setErrors({...errors, experience: ''})}
              iconName="briefcase" // Assuming an icon for experience
              autoCapitalize="none"
            />

            <CustomTextInput
              label="Notice Period (in Days) *"
              placeholder="Enter your notice period (in Days)"
              value={noticePeriod}
              onChangeText={(text: any) => setNoticePeriod(text)}
              error={errors.noticePeriod}
              onFocus={() => setErrors({...errors, noticePeriod: ''})}
              iconName="calendar" // Assuming an icon for notice period
              autoCapitalize="none"
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, styles.bottomApply]}
          onPress={onReviewClicked}>
          <Text style={[styles.buttonText, styles.buttonActiveText]}>
            Review
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 75,
  },
  appHeader: {
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  scrollContent: {
    padding: 16,
  },
  heading: {
    fontSize: FontSizes.medium,
    letterSpacing:LetterSpacings.wide,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    marginVertical: 8,
    color: Color.black,
  },
  label: {
    fontSize: FontSizes.medium,
    marginVertical: 5,
  },
  input: {
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Gilroy-Regular',
    color: '#ED4956',
  },
  uploadButton: {
    height: 40,
    marginVertical: 10,
    borderColor: '#7B7B7B',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
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
    justifyContent: 'center',
    alignItems: 'center',
    gap:12,
  },
  bottomButton: {
    height: 52,
    width: '50%',
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
    fontSize: FontSizes.large,
    fontFamily: FontFamilies.semibold,
    letterSpacing:LetterSpacings.wide,
    color: Color.black,
  },
  buttonActiveText: {
    color: Color.white,
  },
  // resume
  labelText: {
    fontSize: FontSizes.small,
    fontWeight: '400',
    color: Color.black,
    fontFamily: FontFamilies.medium,
    letterSpacing:LetterSpacings.wide,
    marginBottom: 15,
  },
  uploadCard: {
    paddingVertical: 15,
    backgroundColor: Color.black,
    borderRadius: 12,
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  uploadIcon: {
    width: 50,
    height: 50,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: FontSizes.small,
    letterSpacing:LetterSpacings.wide,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
    color:Color.white,
    marginBottom: 12,
  },
  resumeUploadButton: {
    width: '90%',
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#FCE2BD',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: Color.black,
    fontSize: FontSizes.medium,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    letterSpacing:LetterSpacings.wide,
  },
  fileViewCard: {
    marginVertical: 10,
  },
  resumeHint: {
    color: Color.grey,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    fontSize: FontSizes.small,
    lineHeight: LineHeights.small,
    marginBottom: 10,
  },
  resumeError: {
    color: '#ED4956',
    fontFamily: 'Gilroy-Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 13.2,
    marginBottom: 10,
  },
});

export default ProfessionalDetailForm;
