import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  BackHandler,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AWS from 'aws-sdk';
import {post} from '../../services/dataRequest';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import ImagePicker, {launchImageLibrary, MediaType, PhotoQuality} from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import CustomTextInput from './profile/businessProfile/customTextInput';
import {Divider} from 'react-native-paper';
import CustomTagInput from '../commons/customTagInput';
import UserTaggingInput from './profile/businessProfile/userTagggingInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {types, pick} from 'react-native-document-picker';
import Video from 'react-native-video';
import {createVideoThumbnail} from 'react-native-compressor';
import {flip, isEmpty} from 'lodash';
import { Color, FontFamilies } from '../../styles/constants';
import LocationModal from '../commons/LocationModal';
import MentionModal from '../commons/MentionModal';
import CustomAlertModal from '../commons/customAlert';
import { setActiveTab } from '../../redux/slices/profileTabSlice';
import { useDispatch } from 'react-redux';
import { getLoggedInUserId, getUserInfo } from '../../utils/commonFunctions';
import { compressImage } from '../../utils/imageCompressor';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';

const ImageUploadPage = ({handleTabClick}: any) => {
  const dispatch = useDispatch();
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [caption, setCaption] = useState('');
  const [filePath, setFilePath] = useState('');
  const [serverFile, setServerFile] = useState('');
  const [fileType, setFileType] = useState('');
  const [location, setLocation] = useState('');
  const [peopleTag, setPeopleTag] = useState<any[]>([]);

  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [token, setToken] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<any[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const S3_BUCKET = 'csappproduction-storage';
  const REGION = 'ap-south-1';
  const ACCESS_KEY = 'AKIAU6GDZYODGHPEKSGW';
  const SECRET_KEY = '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';
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  
  // Token setup
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          setToken(savedToken);
        } else {
          console.error('No token found');
        }
      } catch (error) {
        console.error('Failed to fetch token:', error);
      }
      const userId = await getLoggedInUserId();
      setLoggedInUserId(userId);
    };
    fetchToken();
  }, []);

  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
  });

  const s3 = new AWS.S3();

  const handleMentionedUsersToChange = (users: any[]) => {
    setMentionedUsers(users);
  };

  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const pickImage = useCallback(() => {
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
    const options: any = {
      mediaType: 'mixed' as MediaType,
      includeBase64: false,
      videoQuality: 'high',
      quality: 1,
      presentationStyle: 'fullScreen',
      selectionLimit: 1,
      includeExtra: true,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        navigation.goBack();
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset: any = response.assets[0];
        console.log("asset", asset);
        
        // Check if the selected file is a video
        const isVideo = asset.type === 'video' || asset.mimeType?.includes('video/');
        
        if (asset?.fileSize > MAX_FILE_SIZE) {
          Alert.alert(
            'File too large',
            `The file "${
              asset?.name ?? asset?.fileName
            }" exceeds the 100MB limit. Please choose a smaller file.`,
            [
              {text: 'Cancel', onPress: () => navigation.goBack()},
              {text: 'OK', onPress: () => navigation.goBack()},
            ],
            {cancelable: false},
          );
          return null;
        }
        else {
          setFileName(asset.fileName || '');
          setImage(asset.uri);
          setFilePath(asset.uri);
          setFileType(isVideo ? 'video' : (asset.type || ''));
          
          // If it's a video, ensure we have the correct URI format
          if (isVideo) {
            // For iOS, we need to ensure the URI is properly formatted
            if (Platform.OS === 'ios') {
              const videoUri = asset.uri.replace('file://', '');
              setFilePath(videoUri);
            }
          }
        }
      }
    });
  }, [navigation]);

  useEffect(() => {
    pickImage();
  }, []);

  useEffect(() => {
    if (image && !originalImage) {
      setOriginalImage(image);
    }
  }, [image]);

  const uploadFiles = async () => {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      if(isVideo){
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        const blob = await response.blob();
  
        const params = {
          Bucket: S3_BUCKET,
          Key: `ugc/${loggedInUserId}/${fileName}`,
          Body: blob,
          ContentType: fileType,
          ACL: 'public-read',
        };
  
        const data = await s3.upload(params).promise();
        setServerFile(data.Location);
        return data.Location;
      }else {
        const compressedImage = await compressImage(filePath);
        const compressedResponse = await fetch(compressedImage.uri);
        const blob = await compressedResponse.blob();
  
        // return
        const params = {
          Bucket: S3_BUCKET,
          Key: `ugc/${loggedInUserId}/${fileName}`,
          Body: blob,
          ContentType: fileType,
          ACL: 'public-read',
        };
  
        const data = await s3.upload(params).promise();
        setServerFile(data.Location);
        return data.Location;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      // Re-throw the error so it can be caught by the caller
      throw new Error('Failed to upload file to server');
    }
  };

  const sendDataToServer = async (fileUrl: any, isDraft = false) => {
    setIsLoading(true);
    const payload = {
      contentUrl: fileUrl,
      caption,
      contentType: fileType.includes('video') || isVideo ? 'video' : 'photo',
      flags: {
        draft: isDraft,
        deleted: false,
        archive: false,
      },
      location,
      tags: tags,
      taggedUsers: getSelectedUserIds(),
      mentionedUsers: mentionedUsers.map((user: any) => user?.userId) || [],
    };
    console.log("payload :: 270 ::", payload);

    try {
      const response = await post('ugc/create-ugc', payload);
      console.log("response", response);
      console.log("PayLoad Draft:::", payload);
      if (response.status === 201) {
      // First dispatch the action
      dispatch(setActiveTab('posts')); 
      // Then navigate
      navigation.navigate('BottomBar' as never, {
        screen: 'ProfileRewamp',
      } as never);
        return true; // Add this to indicate successful post
      } else {
        Alert.alert('Failed to send data to server');
        return false; // Add this to indicate failed post
      }
    } catch (error) {
      console.error('Error sending data to server:', error);
      Alert.alert('Error sending data to server');
      return false; // Add this to indicate failed post
    } finally {
      setIsLoading(false);
    }
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors: any = {caption: '', location: ''};

    if (!caption.trim()) {
      newErrors.caption = 'Caption is required';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handlePost = async () => {
    if (isProcessing) return; // Prevent multiple clicks
    if (!validateFields()) {
      return; // Stop submission if validation fails
    }

    setIsProcessing(true);
    
    try {
      if (!image) {
        throw new Error('No image selected');
      }
      
      // Explicitly use try-catch around each async operation
      let contentUrl;
      try {
        contentUrl = await uploadFiles();
        if (!contentUrl) throw new Error('Failed to get file URL');
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        Alert.alert('Upload Failed', 'Could not upload your file. Please try again.');
        setIsProcessing(false);
        return;
      }

      try {
        const success = await sendDataToServer(contentUrl, false);
        console.log("success :: 375 ::", success);
        if (success) {
          resetForm();
        } else {
          Alert.alert('Post Failed', 'Your post could not be created. Please try again.');
        }
      } catch (sendError) {
        console.error('Server communication failed:', sendError);
        Alert.alert('Communication Error', 'Could not send data to server. Please try again.');
      }
    } catch (error) {
      console.error('Error in post flow:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false); // Reset processing flag no matter what
    }
  };

  const handleDraft = async () => {

    // setShowBackAlert(false);
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      if (!image) {
        throw new Error('No image selected');
      }
      
      // Similar structured approach to handlePost
      let contentUrl;
      try {
        contentUrl = await uploadFiles();
        if (!contentUrl) throw new Error('Failed to get file URL');
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        Alert.alert('Upload Failed', 'Could not upload your file. Please try again.');
        setIsProcessing(false);
        return;
      }
      
      try {
        const success = await sendDataToServer(contentUrl, true);
        if (success) {
          resetForm();
          Alert.alert('Draft Saved', 'Your draft has been saved.');
        } else {
          Alert.alert('Draft Save Failed', 'Your draft could not be saved. Please try again.');
        }
      } catch (sendError) {
        console.error('Server communication failed:', sendError);
        Alert.alert('Communication Error', 'Could not save draft to server. Please try again.');
      }
    } catch (error) {
      console.error('Error in draft flow:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false); // Reset processing flag no matter what
    }
  };

  const handleChangeImage = async () => {
    try {
      if (!image) {
        Alert.alert('Error', 'No image found to edit');
        return;
      }

      // Use the original image for cropping if available
      const sourcePath = originalImage || image;

      const croppedImage = await ImageCropPicker.openCropper({
        path: sourcePath,
        width: 800,
        height: 800,
        cropping: true,
        mediaType: 'photo',
        forceJpg: true,
        compressImageQuality: 0.9,
        includeExif: false,
      });

      if (croppedImage) {
        if (Platform.OS === 'ios') {
          const timestamp = new Date().getTime();
          const uniqueFileName = `image_${timestamp}.jpg`;
          
          if (croppedImage.size > 500000) {
            const processedImage = await ImageCropPicker.openCropper({
              path: croppedImage.path,
              width: 800,
              height: 800,
              cropping: false,
              mediaType: 'photo',
              forceJpg: true,
              compressImageQuality: 0.8,
            });
            
            setFileName(uniqueFileName);
            setImage(processedImage.path);
            setFilePath(processedImage.path);
            setFileType('image');
            
            console.log("Using processed image:", processedImage.path);
            console.log("Size:", processedImage.size);
          } else {
            setFileName(uniqueFileName);
            setImage(croppedImage.path);
            setFilePath(croppedImage.path);
            setFileType('image');
            
            console.log("Using standard cropped image:", croppedImage.path);
            console.log("Size:", croppedImage.size);
          }
        } else {
          setFileName(croppedImage.filename || 'cropped_image.jpg');
          setImage(croppedImage.path);
          setFilePath(croppedImage.path);
          setFileType('image');
        }
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Error cropping image:', error);
        Alert.alert('Error', 'Failed to crop image. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setImage(null);
    setCaption('');
    setLocation('');
    setPeopleTag([]);
    setTags([]);
    setOriginalImage(null);
    setFilePath('');
    setFileName('');
    setFileType('');
    setMentionedUsers([]);
    setServerFile('');
  };

  const [showBackAlert, setShowBackAlert] = useState(false);

  const handleBackPress = () => {
    if (image) {
      setShowBackAlert(true);
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (image) {
        setShowBackAlert(true);
        return true;
      }
      handleBackPress();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [image]);

  const locationIcon = require('../../assets/ugcs/location-pin.png');
  const arrowRightIcon = require('../../assets/settings/arrowRightIcon.png');
  const tagIcon = require('../../assets/ugcs/tagIcon.png');
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);

  const showLocationModal = () => {
    setIsLocationModalVisible(true);
  };
  const [isMentionModalVisible, setIsMentionModalVisible] = useState(false);

  const showMentionModal = () => {
    setIsMentionModalVisible(true);
  };

  const handleLocationSelect = (selectedLocation: any) => {
    setLocation(`${selectedLocation.City}, ${selectedLocation.State}`);
  };
  const handleMentionSelect = (selectedUsers: any) => {
    console.log("selectedUsers :: 535 ::", selectedUsers);
    setPeopleTag(selectedUsers);
  };

  const [errors, setErrors] = useState({
    caption: '',
    description: '',
    location: '',
  });

  const handleFieldFocus = (field: string) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [field]: '', // Clear the error for the focused field
    }));
  };

  const routeToTags = () => {
    navigation.navigate('SelectTags' as never, {
      selectedTags: peopleTag, // Pass currently selected tags
      onSelect: (newSelectedUsers: any) => {
        // Merge newly selected users with existing ones, avoiding duplicates
        const mergedTags = [...peopleTag, ...newSelectedUsers].reduce(
          (acc, user) => {
            if (!acc.some((tag: any) => tag._id === user._id)) {
              acc.push(user); // Only add users that haven't been added yet
            }
            return acc;
          },
          [] as any[],
        );
        setPeopleTag(mergedTags); // Update peopleTags with merged tags
      },
    } as never);
  };

  const getSelectedUserIds = () => {
    return peopleTag.map(tag => tag._id); // Extract `_id` for post request
  };

  const removeTag = (userId: string) => {
    setPeopleTag(peopleTag.filter(tag => tag._id !== userId));
    console.log("peopleTag :: 577 ::", peopleTag);
  };
  console.log(image, fileType);
  const [duration, setDuration] = useState(0);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  const checkIfVideoByExtension = (fileUri: string) => {
    const videoExtensions = ['mp4', 'mkv', 'avi', 'mov']; // Add other video extensions as needed
    const extension = fileUri?.split('.').pop();
    return videoExtensions.includes(extension?.toLowerCase() || '');
  };

  const isVideo = checkIfVideoByExtension(filePath);
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const handleGetThumb = async () => {
    const thumb = await createVideoThumbnail(filePath);
    setThumbnail(thumb?.path);
  };
  useEffect(() => {
    handleGetThumb();
  }, [filePath]);

  useEffect(() => {
    console.log("peopleTag updated ::", peopleTag);
    // Any other code that needs to run after peopleTag changes
  }, [peopleTag]);

  // Add keyboard event listeners like in editPostRewamped
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const isKeyboradOpen = useKeyboardVisible();
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}>
          <Icon name="chevron-back" size={22} color="#181818" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <View style={styles.placeholder} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.main}
        keyboardVerticalOffset={30}>
        <View style={styles.contentContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContainer, { paddingBottom: isKeyboardVisible ? 90 : 170 }]}
            keyboardShouldPersistTaps="handled">
            {isProcessing ? (
              <Modal
                transparent={true}
                animationType="fade"
                visible={isProcessing}
                onRequestClose={() => {}}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <ActivityIndicator size="large" color={Color.black} />
                  </View>
                </View>
              </Modal>
            ) : (
              <View style={{flex: 1}}>
                <View style={{flex: 1,alignItems: 'center',justifyContent: 'center'}}>
                {image ? (
                  <View style={styles.imageContainer}>
                    {isVideo ? (
                      <Video
                        onLoad={(data: any) => {
                          setDuration(data.duration);
                        }}
                        style={{
                          ...styles.imagePreview,
                          maxWidth: '100%',
                          borderRadius: 100,
                        }}
                        paused={false}
                        controls={true}
                        source={{uri: filePath}}
                        muted={true}
                      />
                    ) : (
                      <Image
                        source={{uri: isVideo ? thumbnail : image}}
                        style={
                          isVideo
                            ? {
                                ...styles.imagePreview,
                                width: 228,
                                height: 228,
                                borderRadius: 22,
                              }
                            : styles.imagePreview
                        }
                        resizeMode="contain"
                      />
                    )}
                    {isVideo ? null : (
                      <TouchableOpacity
                        style={styles.editIcon}
                        onPress={handleChangeImage}>
                        <Image
                          source={require('../../assets/ugcs/editPostIcon.png')}
                          style={{height: 36, width: 36}}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                 
                ) : (
                 null
                )}
                 </View>
                {image && (
                   <View style={{flex: 1}}>
                    <UserTaggingInput
                      label={'Description'}
                      placeholder={
                        isVideo
                          ? 'Add a description and tell everyone what your post is about'
                          : 'Write a description...'
                      }
                      value={caption}
                      multiline={true}
                      defaultOneLine={false}
                      numberOfLines={4}
                      error={errors.caption}
                      onFocus={() => handleFieldFocus('caption')}
                      onChangeText={(text: any) => setCaption(text)}
                      token={token}
                      onTagUserChange={handleMentionedUsersToChange}
                      // style={{
                      //   minHeight: 120,
                      //   textAlignVertical: 'top',
                      //   paddingTop: 12,
                      // }}
                    />

                    <Divider />
                    {location ? (
                      <TouchableOpacity
                        style={styles.Tab}
                        onPress={showLocationModal}>
                        <View style={styles.optionButton}>
                          <Image source={locationIcon} style={styles.icon} />
                          <Text style={styles.optionText}>{location}</Text>
                        </View>
                        <Image source={arrowRightIcon} style={styles.icon} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.Tab}
                        onPress={showLocationModal}>
                        <View style={styles.optionButton}>
                          <Text style={styles.optionText}>Location</Text>
                        </View>
                        <Image source={arrowRightIcon} style={styles.icon} />
                      </TouchableOpacity>
                    )}
                    <Divider />

                    <View>
                      <TouchableOpacity style={styles.Tab} onPress={showMentionModal}>
                        <View style={styles.optionButton}>
                          <Text style={styles.optionText}>Mention</Text>
                        </View>
                        <Image source={arrowRightIcon} style={styles.icon} />
                      </TouchableOpacity>

                      {peopleTag && peopleTag.length > 0 && (
                        <View style={styles.taggedUsersContainer}>
                          <FlatList
                            data={peopleTag}
                            renderItem={({item}: any) => (
                              <View style={styles.chip}>
                                <Text style={styles.chipText}>
                                    {item.username}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => removeTag(item._id)}>
                                  <Icon
                                    name="close"
                                    size={14}
                                    color="#000"
                                    style={styles.removeIcon}
                                  />
                                </TouchableOpacity>
                              </View>
                            )}
                            horizontal
                            keyExtractor={item => item._id}
                            showsHorizontalScrollIndicator={false}
                          />
                        </View>
                      )}
                    </View>
                    <Divider />
                    <CustomTagInput
                      label={isVideo ? 'Add Tags' : 'Tags'}
                      placeholder={
                        'Add hashtags related to your post here'
                      }
                      value={tags as any}
                      onChangeTags={(updatedTags: any) => setTags(updatedTags)}
                      iconName="tag"
                      error=""
                      onFocus={() => {}}
                    />
                    </View>
                )}
              </View>
            )}
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.pickButton}
              onPress={handlePost}
              disabled={!image}>
              <Text style={styles.pickButtonText}>
                {isVideo ? 'Post' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <LocationModal
          visible={isLocationModalVisible}
          onClose={() => setIsLocationModalVisible(false)}
          onSelect={handleLocationSelect}
        />
        <MentionModal
          visible={isMentionModalVisible}
          onClose={() => setIsMentionModalVisible(false)}
          selectedUsers={peopleTag}
          onSelect={handleMentionSelect}
        />
        <CustomAlertModal
          visible={showBackAlert}
          title="Save Draft?"
          description="Would you like to save this as a draft or discard it?"
          buttonOneText="Save as Draft"
          onPressButton1={handleDraft}
          buttonTwoText="Discard"
          onPressButton2={() => {
            setShowBackAlert(false);
            navigation.goBack();
          }}
          onClose={() => {
            setShowBackAlert(false);
          }}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: Platform.OS === 'ios' ? 30 : 16,
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
  main: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    padding: 15,
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 80,
    padding: 20,
  },
  imageContainer: {
    position: "relative",
    alignItems: 'center',
    width: '70%',
    aspectRatio: 1,
    backgroundColor: Color.white,
    borderRadius: 22,
    marginVertical: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth:1,
    
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  editIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#000',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  noImageText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 15 : 10,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F3F3F3',
  },
  pickButton: {
    backgroundColor: '#1E1E1E',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    width: '100%',
  },
  pickButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: FontFamilies.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    // backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5, // Android shadow
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#000',
    lineHeight: 20,
    fontFamily: FontFamilies.regular,
    textAlign: 'center',
  },
  Tab: {
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    justifyContent: 'space-between',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
  },
  icon: {
    marginRight: 10,
    height: 20,
    width: 20,
  },
  optionText: {
    fontSize: 15,
    fontFamily: FontFamilies.semibold,
    color: '#1E1E1E',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  selectedLocationText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FontFamilies.semibold,
  },
  selectedLocation: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taggedUsersContainer: {
    marginBottom: 15,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 20,
    margin: 8,
  },
  chipText: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    color: '#333',
  },
  removeIcon: {
    marginLeft: 5,
    marginBottom: 2,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    fontFamily: FontFamilies.regular,
  },
  label: {
    fontSize: 16,
    fontFamily: FontFamilies.semibold,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  textAreaContainer: {
    marginBottom: 24,
  },
});

export default ImageUploadPage;

