/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  FlatList,
  TouchableWithoutFeedback,
  BackHandler,
  Keyboard,
} from 'react-native';
import { NavigationHelpersContext, useNavigation, useRoute } from '@react-navigation/native';
import CustomTextInput from '../profile/businessProfile/customTextInput';
import { Divider } from 'react-native-paper';
import AWS from 'aws-sdk';
import { post, del } from '../../../services/dataRequest';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomTagInput from '../../commons/customTagInput';
import Icon from 'react-native-vector-icons/Ionicons';
import UserTaggingInput from '../profile/businessProfile/userTagggingInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pick, types } from 'react-native-document-picker';
import { Color, FontFamilies } from '../../../styles/constants';
import LocationModal from '../../commons/LocationModal';
import MentionModal from '../../commons/MentionModal';
import CustomAlertModal from '../../commons/customAlert';
import { setActiveTab } from '../../../redux/slices/profileTabSlice';
import { useDispatch } from 'react-redux';
import ImageCropPicker from 'react-native-image-crop-picker';
import { compressImage } from '../../../utils/imageCompressor';
import { getLoggedInUserId } from '../../../utils/commonFunctions';
import { updateCompletePost } from '../../../redux/slices/postSlice';
const { width } = Dimensions.get('window');
const cardWidth = width * 0.4; // 40% of screen width
const cardHeight = width * 0.4; // Maintain aspect ratio

const UploadProjects = () => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');
  const [peopleTag, setPeopleTag] = useState([]);
  const [token, setToken] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  // const [showMentionModal, setShowMentionModal] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [showBackAlert, setShowBackAlert] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    description: '',
    buttonOneText: '',
    buttonTwoText: '',
    buttonThreeText: '',
    onPressButton1: () => {},
    onPressButton2: () => {},
    onPressButton3: () => {},
  });

  const showLocationModal = () => {
    setIsLocationModalVisible(true);
  };

  const handleLocationSelect = (selectedLocation: any) => {
    setLocation(`${selectedLocation.City}, ${selectedLocation.State}`);
  };

  const [isMentionModalVisible, setIsMentionModalVisible] = useState(false);

  const handleShowMentionModal = () => {
    setIsMentionModalVisible(true);
  };

  const handleMentionSelect = (selectedUsers: any) => {
    setPeopleTag(selectedUsers);
  };

  const route = useRoute();
  const [isEditMode, setIsEditMode] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    location: '',
  });
  const navigation = useNavigation();

  useEffect(() => {
    // selectFiles();
    if (route.params?.data) {
      navigation.setOptions({ title: 'Edit Project' });
      console.log('route.params?.data', route.params?.data);
      // If a project is passed in for editing
      const project = route?.params?.data;
      setIsEditMode(true);
      setIsDraft(project.flags.draft);
      setProjectId(project._id);
      setTitle(project?.projectTitle || '');
      setDescription(project.description || '');
      setTags(project.tags || '');
      setLink(project.link || '');
      setLocation(project.location || '');
      setPeopleTag(project.taggedUsersDetails || []);
      setFiles(
        project.contentUrl ? project.contentUrl.map(url => ({ uri: url })) : [],
      );
    } else {
      // If no project is passed in, assume it's a new project
      selectFiles();
    }
  }, [route.params]);

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

  // Add keyboard event listeners to prevent flickering
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

  // const selectFiles = async () => {
  //   try {
  //     const results = await DocumentPicker.pick({
  //       type: [DocumentPicker.types.images],
  //       allowMultiSelection: true,
  //       copyTo: 'cachesDirectory',
  //     });
  //     if (results) {
  //       setFiles(results);
  //     }
  //   } catch (err) {
  //     if (DocumentPicker.isCancel(err)) {
  //       navigation.goBack();
  //       console.log('User cancelled the picker');
  //     } else {
  //       throw err;
  //     }
  //   }
  // };

  // // Automatically open file picker when component mounts
  // useEffect(() => {
  //   selectFiles();
  // }, []);

  // old logic

  // const selectFiles = async () => {
  //   const options = {
  //     mediaType: 'mixed',
  //     selectionLimit: 10, // 0 for multiple selections
  //     includeBase64: false, // Set to true if you need base64 data
  //   }
  //   console.log("from data upload")
  //   try {
  //     if (Platform.OS === 'ios') {
  //       pick({
  //         allowMultiSelection: false,
  //         type: [types.images, types.video],
  //       })
  //         .then(res => {
  //           const allFilesAreVideoImage = res.every(
  //             (file: any) => file.hasRequestedType,
  //           );
  //           if (!allFilesAreVideoImage) {
  //             const selectedFiles: any = res?.map(asset => ({
  //               uri: asset.uri,
  //               type: asset.type,
  //               name: asset.name,
  //               size: asset.size,
  //             }));
  //             setFiles(selectedFiles);
  //           }
  //         })
  //         .catch(e => {
  //           console.log('err', e);
  //         });
  //     } else {
  //       launchImageLibrary(options, response => {
  //         if (response.didCancel) {
  //           navigation.goBack();
  //         } else if (response.errorCode) {
  //           Alert.alert('Error', response.errorMessage);
  //         } else if (response.assets) {
  //           // Map over response assets to create a consistent format
  //           const selectedFiles: any = response.assets.map(asset => ({
  //             uri: asset.uri,
  //             type: asset.type,
  //             name: asset.fileName,
  //             size: asset.fileSize,
  //           }));
  //           setFiles(selectedFiles);
  //         }
  //       });
  //     }
  //   } catch (err) {
  //     Alert.alert('Error', 'An unknown error occurred. Please try again.');
  //   }
  // };

  // new minimum 2 files logic

  // const selectFiles = async () => {
  //   const options = {
  //     mediaType: 'mixed',
  //     selectionLimit: 10, // Max selection limit
  //     includeBase64: false,
  //   };
  //   try {
  //     if (Platform.OS === 'ios') {
  //       pick({
  //         allowMultiSelection: true,
  //         type: [types.images],
  //       })
  //         .then(res => {
  //           const allFilesAreVideoImage = res.every(
  //             (file: any) => file.hasRequestedType,
  //           );
  //           if (!allFilesAreVideoImage) {
  //             const selectedFiles = res.map(asset => ({
  //               uri: asset.uri,
  //               type: asset.type,
  //               name: asset.name,
  //               size: asset.size,
  //             }));
  //             if (selectedFiles.length >= 2) {
  //               setFiles(selectedFiles);
  //             } else {
  //               Alert.alert(
  //                 'Selection Error',
  //                 'Please select at least 2 files.',
  //                 [
  //                   {text: 'OK', onPress: selectFiles}, // Reopen file picker
  //                 ],
  //               );
  //             }
  //           }
  //         })
  //         .catch(e => {
  //           console.log('err', e);
  //         });
  //     } else {
  //       launchImageLibrary(options, response => {
  //         if (response.didCancel) {
  //           navigation.goBack();
  //         } else if (response.errorCode) {
  //           Alert.alert('Error', response.errorMessage);
  //         } else if (response.assets) {
  //           const selectedFiles = response.assets.map(asset => ({
  //             uri: asset.uri,
  //             type: asset.type,
  //             name: asset.fileName,
  //             size: asset.fileSize,
  //           }));
  //           if (selectedFiles.length >= 2) {
  //             setFiles(selectedFiles);
  //           } else {
  //             Alert.alert(
  //               'Selection Error',
  //               'Please select at least 2 files.',
  //               [
  //                 {text: 'OK', onPress: selectFiles}, // Reopen file picker
  //               ],
  //             );
  //           }
  //         }
  //       });
  //     }
  //   } catch (err) {
  //     Alert.alert('Error', 'An unknown error occurred. Please try again.');
  //   }
  // };

  // new logic for project
  const selectFiles = async () => {
    const options: any = {
      mediaType: 'photo',
      selectionLimit: 10,
      includeBase64: false,
      selectedAssets: files.map(file => ({
        uri: file.uri,
        type: file.type,
        fileName: file.name,
        fileSize: file.size
      }))
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode) {
        showCustomAlert({
          title: 'Error',
          description: response.errorMessage,
          buttonOneText: 'OK',
          onPressButton1: hideCustomAlert,
        });
      } else if (response.assets) {
        const selectedFiles = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
          size: asset.fileSize,
        }));

        // If we already have files, merge with new selections
        if (files.length > 0) {
          const mergedFiles = [...files, ...selectedFiles];
          if (mergedFiles.length >= 2) {
            setFiles(mergedFiles);
          } else {
            showCustomAlert({
              title: 'Error',
              description: 'Please select at least 2 files.',
              buttonOneText: 'OK',
              buttonTwoText: 'Cancel',
              onPressButton1: () => {
                hideCustomAlert();
                selectFiles();
              },
              onPressButton2: hideCustomAlert
            });
          }
        } else {
          // If no existing files, require at least 2 new selections
          if (selectedFiles.length >= 2) {
            setFiles(selectedFiles);
          } else {
             showCustomAlert({
              title: 'Error',
              description: 'Please select at least 2 files.',
              buttonOneText: 'OK',
              buttonTwoText: 'Cancel',
              onPressButton1: () => {
                hideCustomAlert();
                selectFiles();
              },
              onPressButton2: hideCustomAlert
            });
          }
        }
      }
    });
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = { title: '', description: '', location: '' };
            // If removing would result in less than 2 images, prompt to add more
            if (files.length < 2) {
              showCustomAlert({
                title: 'Add More Images',
                description: 'You need at least 2 images. Would you like to add more?',
                buttonOneText: 'Add More',
                buttonTwoText: 'Cancel',
                onPressButton1: () => {
                  hideCustomAlert();
                  selectFiles();
                },
                onPressButton2: hideCustomAlert
              });
            }

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    if (title.trim().length > 30) {
      newErrors.title = 'Title should not exceed 30 characters';
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

  const goToDetails = async (isDraft: boolean = false) => {
   if (isProcessing) return; // Prevent multiple clicks
    
    // Only validate fields if NOT saving as draft
    if (!isDraft && !validateFields()) {
      return; // Stop submission if validation fails
    }
    
    setIsProcessing(true); // Set processing flag to true
    try {
      const uploadedFiles = await Promise.all(
        files.map(async (file: any) => {
          // If the file already has an S3 URL, return the existing URL
          if (file.uri.startsWith('https://')) {
            return file.uri;
          } else {
            // Otherwise, upload the file to S3
            return await uploadFileToS3(file);
          }
        }),
      );
      
      // Set default title with timestamp if title is empty
      const projectTitle = title.trim() || `Untitled_${new Date().getTime()}`;
      
      const payload: any = {
        projectTitle: projectTitle,
        description: description,
        caption: projectTitle,
        location: location,
        link: link,
        contentUrl: uploadedFiles,
        taggedUsers: getSelectedUserIds(),
        mentionedUsers: mentionedUsers.map((user: any) => user?.userId) || [],
        flags: {
          draft: isDraft,
          deleted: false,
          archive: false,
        },
      };
      console.log('payload', payload);

      if (
        Array.isArray(tags) &&
        tags.length > 0 &&
        tags.some(tag => tag.trim() !== '')
      ) {
        payload.tags = tags.filter(tag => tag.trim() !== ''); // Filter out any empty or whitespace-only tags
      }
      let response;
      if (isEditMode) {
        payload['projectId'] = projectId;
        // Update existing project
        response = await post(`project/update-project`, payload);
        console.log('response upp', response);
      } else {
        // Create new project
        response = await post('project/create-project', payload);
        console.log('response', response);
      }
      if (response.status === 200) {
        if (isEditMode && response.project) {
          // Create updated project data by merging original draft with updated fields
          const updatedProject = {
            ...route.params?.data, // Original project data
            projectTitle: projectTitle,
            description: description,
            caption: projectTitle,
            contentUrl: uploadedFiles,
            tags: Array.isArray(tags) ? tags.filter(tag => tag.trim() !== '') : [],
            location: location,
            taggedUsers: getSelectedUserIds(),
            taggedUsersDetails: peopleTag,
            mentionedUsers: mentionedUsers.map((user: any) => user?.userId) || [],
            mentionedUsersDetails: mentionedUsers,
            // Add timestamp to indicate the update
            updatedAt: new Date().toISOString()
          };
                
          // Dispatch to Redux to update all instances of this project
          dispatch(updateCompletePost({
            postId: projectId,
            postData: updatedProject
          }));
          showCustomAlert({
            title: 'Success',
            description: 'Project updated successfully',
            buttonOneText: 'OK',
            onPressButton1: () => {
              hideCustomAlert();
              navigation.goBack();
            },
          });
        }
        
        if (isDraft) {
          showCustomAlert({
            title: 'Success',
            description: 'Project saved as draft successfully',
            buttonOneText: 'OK',
            onPressButton1: () => {
              hideCustomAlert();
              navigation.goBack();
            },
          });
        } else {
          dispatch(setActiveTab('projects'));
         navigation.goBack();
        }
      } else {
        const errorData = await response.json();
        showCustomAlert({
          title: 'Error',
          description: errorData.message || 'Something went wrong.',
          buttonOneText: 'OK',
          onPressButton1: hideCustomAlert,
        });
      }
    } catch (error) {
      showCustomAlert({
        title: 'Error',
        description: 'An error occurred while uploading.',
        buttonOneText: 'OK',
        onPressButton1: hideCustomAlert,
      });
    } finally {
      console.log('isProcessing', isProcessing);
      setIsProcessing(false); // Reset processing flag
    }
  };

  const routeToLocation = () => {
    navigation.navigate('SelectLocation', {
      onSelect: (selectedLocation: any) => {
        setLocation(`${selectedLocation.City}, ${selectedLocation.State}`);
      },
    });
  };

  const locationIcon = require('../../../assets/ugcs/location-pin.png');
  const arrowRightIcon = require('../../../assets/settings/arrowRightIcon.png'); // Adjust the path as needed

  const S3_BUCKET = 'csappproduction-storage';
  const REGION = 'ap-south-1';
  const ACCESS_KEY = 'AKIAU6GDZYODGHPEKSGW';
  const SECRET_KEY = '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';

  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
  });

  const s3 = new AWS.S3();

  

  // file upload
  const uploadFileToS3 = async (obj: any) => {
    try {
      const response = await fetch(obj?.fileCopyUri ?? obj?.uri);
      const compressedImage = await compressImage(obj?.fileCopyUri ?? obj?.uri);
      const compressedResponse = await fetch(compressedImage.uri);
      const blob = await compressedResponse.blob();
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      // const blob = await response.blob();

      const params = {
        Bucket: S3_BUCKET,
        Key: `projects/${loggedInUserId}/${obj?.name || Date.now()}`,
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
      [field]: '', // Clear the error for the focused field
    }));
  };

  const handleEditImage = async (index: any) => {
    try {
      const currentImage = files[index];
      if (!currentImage?.uri) {
        showCustomAlert({
          title: 'Error',
          description: 'No image found to edit',
          buttonOneText: 'OK',
          onPressButton1: hideCustomAlert
        });
        return;
      }

      const image = await ImageCropPicker.openCropper({
        path: currentImage.uri,
        width: 800,
        height: 800,
        cropping: true,
        includeBase64: false,
      });

      if (image && image.path) {
        // Replace only the URI in the clicked image's object
        const updatedFiles: any = [...files];
        const updatedImageObject = {
          ...updatedFiles[index],
          uri: image.path,
          type: image.mime,
          name: image.filename || `image_${Date.now()}.jpg`,
          size: image.size,
        };
        updatedFiles[index] = updatedImageObject;
        setFiles(updatedFiles);
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Error cropping image:', error);
        showCustomAlert({
          title: 'Error',
          description: 'Failed to crop image. Please try again.',
          buttonOneText: 'OK',
          onPressButton1: hideCustomAlert
        });
      }
    }
  };

  const tagIcon = require('../../../assets/ugcs/tagIcon.png');

  const routeToTags = () => {
    navigation.navigate('SelectTags', {
      selectedTags: peopleTag, // Pass currently selected tags
      onSelect: (newSelectedUsers: any) => {
        // Merge newly selected users with existing ones, avoiding duplicates
        const mergedTags = [...peopleTag, ...newSelectedUsers].reduce(
          (acc, user) => {
            if (!acc.some(tag => tag._id === user._id)) {
              acc.push(user); // Only add users that haven't been added yet
            }
            return acc;
          },
          [],
        );
        setPeopleTag(mergedTags); // Update peopleTags with merged tags
      },
    });
  };

  const getSelectedUserIds = () => {
    return peopleTag.map(tag => tag._id); // Extract `_id` for post request
  };

  const removeTag = userId => {
    setPeopleTag(peopleTag.filter(tag => tag._id !== userId));
  };

  const handleMentionedUsersToChange = users => {
    setMentionedUsers(users);
  };

  const showMentionModal = () => {
    setShowMentionModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteModalVisible(false);
    try {
      const res = await del(`project/delete-project?projectId=${projectId}`, '');
      if (res) {
        navigation.navigate('BottomBar', {
          screen: 'ProfileRewamp',
      });
      } else {
        showCustomAlert({
          title: 'Error',
          description: 'Something went wrong',
          buttonOneText: 'OK',
          onPressButton1: hideCustomAlert,
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      showCustomAlert({
        title: 'Error',
        description: 'Failed to delete project',
        buttonOneText: 'OK',
        onPressButton1: hideCustomAlert,
      });
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalVisible(true);
  };

  const handleBackPress = () => {
    if (files.length > 0) {
      setShowBackAlert(true);
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (files.length > 0) {
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
  }, [files]);

  const handleRemoveImage = (index: number) => {
    showCustomAlert({
      title: 'Remove Image',
      description: 'Are you sure you want to remove this image?',
      buttonOneText: 'Remove',
      buttonTwoText: 'Cancel',
      onPressButton1: () => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
        hideCustomAlert();
      },
      onPressButton2: hideCustomAlert,
    });
  };

  const showCustomAlert = (config: any) => {
    setCustomAlert({
      ...config,
      visible: true,
    });
  };

  const hideCustomAlert = () => {
    setCustomAlert(prev => ({ ...prev, visible: false }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}>
          <Icon name="chevron-back" size={22} color="#181818" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Project' : 'New Project'}</Text>
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
            {isProcessing && (
              <Modal
                transparent={true}
                animationType="fade"
                visible={isProcessing}
                onRequestClose={() => {}}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <ActivityIndicator size="large" color={Color.black} />
                    <Text style={styles.processingText}>
                      {isEditMode ? 'Saving changes...' : 'Your project is being uploaded. Please wait a moment...'}
                    </Text>
                  </View>
                </View>
              </Modal>
            )}
            <View style={styles.imageScrollContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScroll}
                contentContainerStyle={{ paddingLeft: 0 }}
              >
                {files.map((file, index) => (
                  <View key={index} style={[styles.imageContainer, { marginRight: 15 }]}>
                    <Image
                      source={{ uri: file.uri }}
                      style={[
                        styles.imagePreview,
                        files?.length === 1
                          ? { width: width * 0.9 }
                          : { width: width * 0.5 },
                      ]}
                      resizeMode="contain"
                    />
                    <View style={styles.imageActions}>
                      {!isEditMode && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => handleEditImage(index)}>
                          <Image
                            source={require('../../../assets/ugcs/editPostIcon.png')}
                            style={{ height: 20, width: 20 }}
                          />
                        </TouchableOpacity>
                      )}
                      {!isEditMode && (
                          <TouchableOpacity
                          style={[styles.actionButton, styles.removeButton]}
                          onPress={() => handleRemoveImage(index)}>
                          <Icon name="close-circle" size={22} color="#ED4956" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
                {!isEditMode && (
                <TouchableOpacity 
                style={[styles.imageContainer, styles.addImageButton]} 
                onPress={selectFiles}>
                <Icon name="add" size={40} color="#666" />
                <Text style={styles.addImageText}>Add Images</Text>
              </TouchableOpacity>
                )}
              </ScrollView>
            </View>
            <View style={styles.formContainer}>
              <UserTaggingInput
                label="Title"
                placeholder="Add your project title here"
                value={title}
                onChangeText={setTitle}
                defaultOneLine={true}
                multiline={true}
                iconName=""
                error={errors.title} // Show error message
                onFocus={() => handleFieldFocus('title')}
                token={token}
                onTagUserChange={handleMentionedUsersToChange}
              />
              {/* <CustomTextInput
                label="Title *"
                placeholder="Add your project Title here"
                value={title}
                onChangeText={setTitle}
                defaultOneLine={true}
                multiline={true}
                iconName=""
                error={errors.title} // Show error message
                onFocus={() => handleFieldFocus('title')}
              /> */}
              <CustomTextInput
                label="Description"
                placeholder="Add a description and tell everyone what your post is about"
                value={description}
                onChangeText={setDescription}
                iconName=""
                multiline={true}
                numberOfLines={3}
                error={errors.description} // Show error message
                onFocus={() => handleFieldFocus('description')}
              />
              {/* <CustomTextInput
                label="Add Link"
                placeholder="Add any additional links here"
                value={link}
                onChangeText={setLink}
                iconName="web"
              /> */}
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
                    {/* <Image source={locationIcon} style={styles.icon} /> */}
                    <Text style={styles.optionText}>Location</Text>
                  </View>
                  <Image source={arrowRightIcon} style={styles.icon} />
                </TouchableOpacity>
              )}
              <Divider />

              <View>
                {/* "Add Tag" Button */}
                <TouchableOpacity style={styles.Tab} onPress={handleShowMentionModal}>
                  <View style={styles.optionButton}>
                    {/* <Image source={tagIcon} style={styles.icon} /> */}
                    <Text style={styles.optionText}>Mention</Text>
                  </View>
                  <Image source={arrowRightIcon} style={styles.icon} />
                </TouchableOpacity>

                {/* Display tagged users below the "Add Tag" button */}
                {peopleTag && peopleTag.length > 0 && (
                  <View style={styles.taggedUsersContainer}>
                    <FlatList
                      data={peopleTag}
                      renderItem={({ item }: any) => (
                        <View style={styles.chip}>
                          <Text style={styles.chipText}>
                            {item?.businessName ||
                              `${item?.firstName} ${item?.lastName}` ||
                              item.username}
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
                label="Tags"
                placeholder="Enter tags, separated by commas or spaces..."
                value={tags}
                onChangeTags={(updatedTags: any) => setTags(updatedTags)} // Update the tags
                iconName="tag"
              />

              {/* <Divider /> */}
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            {isEditMode ? (
              <>
                <TouchableOpacity 
                  style={[styles.nextButton, styles.deleteButton]} 
                  onPress={handleDeleteClick}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.nextButton, {width: '48%'}]} 
                  onPress={() => goToDetails(false)}>
                  <Text style={styles.nextButtonText}>Share</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.nextButton, {width: '100%'}]} 
                onPress={() => goToDetails(false)}>
                <Text style={styles.nextButtonText}>Share</Text>
              </TouchableOpacity>
            )}
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
          visible={deleteModalVisible}
          title="Delete Project"
          description="Are you sure you want to delete this project?"
          buttonOneText="Delete"
          buttonTwoText="Cancel"
          onPressButton1={handleConfirmDelete}
          onPressButton2={() => setDeleteModalVisible(false)}
        />
        <CustomAlertModal
          visible={showBackAlert}
          title={isEditMode ? "Save Changes?" : isDraft ? "Post Project?" : "Save as Draft?"}
          description={isEditMode ? "Would you like to save your changes or discard them?" : isDraft ? "Would you like to post this project or discard it?" : "Would you like to save this as a draft or discard it?"}
          buttonOneText={isDraft ? "Post" : isEditMode ? "Save Changes" : "Save as Draft"}
          onPressButton1={async () => {
            setShowBackAlert(false);
            setIsProcessing(true);
            try {
              if (isEditMode) {
                goToDetails(false);
              } else if (isDraft) {
                goToDetails(false);
              } else {
                goToDetails(true);
              }
            } finally {
              setIsProcessing(false);
            }
          }}
          buttonTwoText="Cancel"
          onPressButton2={() => {
            setShowBackAlert(false);
            navigation.goBack();
          }}
          onClose={() => {
            setShowBackAlert(false);
          }}
        />
        <CustomAlertModal
          visible={customAlert.visible}
          title={customAlert.title}
          description={customAlert.description}
          buttonOneText={customAlert.buttonOneText}
          buttonTwoText={customAlert.buttonTwoText}
          buttonThreeText={customAlert.buttonThreeText}
          onPressButton1={customAlert.onPressButton1}
          onPressButton2={customAlert.onPressButton2}
          onPressButton3={customAlert.onPressButton3}
          onClose={hideCustomAlert}
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
  imageScrollContainer: {
    marginBottom: 20,
  },
  imageScroll: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    width: cardWidth,
    height: cardHeight,
    backgroundColor: Color.white,
    borderRadius: 15,
    marginVertical: 10,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    marginRight: 10,
    borderWidth: 1,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 11.71,
  },
  formContainer: {
    marginTop: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  buttonContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F3F3F3',
  },
  nextButton: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  draftButton: {
    backgroundColor: Color.secondarygrey,
  },
  deleteButton: {
    backgroundColor: '#FFEEEE',
    width: '48%',
  },
  deleteText: {
    color: "#ED4956",
    fontSize: 15,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
  },
  nextButtonText1: {
    color: Color.black,
    fontSize: 15,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
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
    fontSize: 13,
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
  // edit
  editIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'black',
    borderRadius: 25,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#000',
    lineHeight: 20,
    fontFamily: 'Gilroy-Regular',
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taggedUsersContainer: {
    marginBottom: 10,
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
  addImageButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#666',
    backgroundColor: '#f5f5f5',
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontFamily: FontFamilies.regular,
  },
  imageActions: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column-reverse',
    gap: 8,
  },
  actionButton: {
    // padding: 4,
    borderRadius: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  editButton: {
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  removeButton: {
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

export default UploadProjects;