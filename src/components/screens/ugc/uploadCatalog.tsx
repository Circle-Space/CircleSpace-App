import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Modal,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {useNavigation} from '@react-navigation/native';
import CustomTextInput from '../profile/businessProfile/customTextInput';
import AWS from 'aws-sdk';
import {post} from '../../../services/dataRequest';
import { Color, FontFamilies } from '../../../styles/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAlertModal from '../../commons/customAlert';
import { setActiveTab } from '../../../redux/slices/profileTabSlice';
import { useDispatch } from 'react-redux';
const {width} = Dimensions.get('window');

const UploadCatalog = () => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({
    title: '',
    description: '',
  });
  const navigation = useNavigation();
  const [showBackAlert, setShowBackAlert] = useState(false);

  useEffect(() => {
    selectFile();
    const backAction = () => {
      setShowBackAlert(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });
      if (result) {
        setFile(result[0]);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        navigation.goBack();
      } else {
        throw err;
      }
    }
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = {title: '', description: ''};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    // if (!description.trim()) {
    //   newErrors.description = 'Description is required';
    //   isValid = false;
    // }
    setErrors(newErrors);
    return isValid;
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const goToDetails = async () => {
    if (isProcessing) return; // Prevent multiple clicks
    if (!validateFields()) {
      return; // Stop submission if validation fails
    }
    setIsProcessing(true); // Set processing flag to true
    try {
      const uploadedFile = await uploadFileToS3(file);
      const payload = {
        title: title,
        description: description,
        contentUrl: uploadedFile,
      };
      const response = await post('catalog/create-catalog', payload);
      if (response.status === 200) {
        dispatch(setActiveTab('catalog'));
        navigation.navigate('BottomBar', {
          screen: 'ProfileRewamp',
      });
      } else {
        const errorData = await response.json();
        console.error('Error Response:', errorData);
        Alert.alert('Error', errorData.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while uploading.');
    } finally {
      setIsProcessing(false); // Reset processing flag
    }
  };

  const s3 = new AWS.S3();

  const S3_BUCKET = 'csappproduction-storage';
  const REGION = 'ap-south-1';
  const ACCESS_KEY = 'AKIAU6GDZYODGHPEKSGW';
  const SECRET_KEY = '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';

  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
  });

  const uploadFileToS3 = async (obj: any) => {
    try {
      const response = await fetch(obj?.fileCopyUri);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      const blob = await response.blob();

      const params = {
        Bucket: S3_BUCKET,
        Key: `catalog/${obj?.name}`,
        Body: blob,
        ContentType: obj?.type,
        ACL: 'public-read',
      };
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleFieldFocus = (field: string) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [field]: '',
    }));
  };

  const defaultPdfImage = require('../../../assets/ugcs/pdf-default.png');

  const handleBackPress = () => {
    setShowBackAlert(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}>
          <Icon name="chevron-back" size={22} color="#181818" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Catalog</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        {isProcessing ? (
          <Modal
            transparent={true}
            animationType="fade"
            visible={isProcessing}
            onRequestClose={() => {}}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ActivityIndicator size="large" color={Color.black} />
                <Text style={styles.processingText}>
                  Your Catalog is being uploaded. Please wait a moment...
                </Text>
              </View>
            </View>
          </Modal>
        ) : (
          <>
            <View style={styles.imageScrollContainer}>
              {file && (
                <View style={styles.singlePdfContainer}>
                  <Image
                    source={defaultPdfImage}
                    style={styles.singlePdfImage}
                  />
                  <Text style={styles.pdfName}>{file?.name}</Text>
                </View>
              )}
            </View>
            <View style={styles.formContainer}>
              <CustomTextInput
                label="Title"
                placeholder="Enter Title"
                value={title}
                onChangeText={setTitle}
                defaultOneLine={true}
                multiline={false}
                iconName=""
                error={errors.title}
                onFocus={() => handleFieldFocus('title')}
                placeholderTextColor={''}
              />
              {/* <CustomTextInput
                  label="Description"
                  placeholder="Enter Description"
                  value={description}
                  onChangeText={setDescription}
                  iconName=""
                  multiline={true}
                  numberOfLines={3}
                  error={errors.description}
                  onFocus={() => handleFieldFocus('description')} placeholderTextColor={''}              /> */}
            </View>
          </>
        )}
        <TouchableOpacity style={styles.nextButton} onPress={goToDetails}>
          <Text style={styles.nextButtonText}>Share</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlertModal
        visible={showBackAlert}
        title="Save Catalog?"
        description="Would you like to save this as a Catalog or discard it?"
        buttonOneText="Continue"
        onPressButton1={ () => {
          setShowBackAlert(false);
        }}
        buttonTwoText="Discard"
        onPressButton2={() => {
          setShowBackAlert(false);
          navigation.goBack();
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  imageScrollContainer: {
    marginVertical: 20,
  },
  singlePdfContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.8,
    alignSelf: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  singlePdfImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  pdfName: {
    marginTop: 5,
    color: 'black',
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 10,
    paddingBottom: 60,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 0,
    width: '100%',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily:FontFamilies.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#000',
    lineHeight: 20,
    fontFamily: FontFamilies.regular,
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 16,
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
    marginTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    padding: 4,
    paddingRight: 10,
    justifyContent: 'center',
    marginLeft: Platform.OS === 'android' ? -8 : 0,
  },
  headerTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
    color: '#1E1E1E',
  },
  placeholder: {
    width: 40,
  },
});

export default UploadCatalog;
