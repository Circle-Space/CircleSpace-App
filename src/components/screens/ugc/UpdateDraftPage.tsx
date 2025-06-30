/* eslint-disable prettier/prettier */
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  BackHandler,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Modal,
  Dimensions,
  Keyboard,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ScrollView} from 'react-native-gesture-handler';
import AWS from 'aws-sdk';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {put, post, del} from '../../../services/dataRequest';
import CustomTextInput from '../profile/businessProfile/customTextInput';
import CustomTagInput from '../../commons/customTagInput';
import {Divider} from 'react-native-paper';
import UserTaggingInput from '../profile/businessProfile/userTagggingInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import style from 'react-native-image-blur-loading/src/style';
import { Color, FontFamilies, FontSizes } from '../../../styles/constants';
import MentionModal from '../../commons/MentionModal';
import LocationModal from '../../commons/LocationModal';
import {createVideoThumbnail} from 'react-native-compressor';
import CustomAlertModal from '../../commons/customAlert';
import IconIonicons from 'react-native-vector-icons/Ionicons';
const locationIcon = require('../../../assets/ugcs/location-pin.png');
const arrowRightIcon = require('../../../assets/settings/arrowRightIcon.png');

const S3_BUCKET = 'csappproduction-storage';
const REGION = 'ap-south-1';
const ACCESS_KEY = 'AKIAU6GDZYODLC5QOLPX';
const SECRET_KEY = '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';

const UpdateDraftPage = () => {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [caption, setCaption] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<any>([]);
  const [mentionedUsersIds, setMentionedUsersIds] = useState('');
  const [filePath, setFilePath] = useState('');
  const [serverFile, setServerFile] = useState('');
  const [fileType, setFileType] = useState('video/mp4');
  const [location, setLocation] = useState('');
  const [peopleTag, setPeopleTag] = useState([]);
  console.log("peopleTag",peopleTag)
  const [token, setToken] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const {draft,isShow = false}: any = route.params; // Draft passed from GetDrafts component
  console.log('draftprops',draft)
  const [isMentionModalVisible, setIsMentionModalVisible] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [showBackAlert, setShowBackAlert] = useState(false);
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
    };
    console.log('log 72 ::', draft);

    fetchToken();
  }, []);

  // Add keyboard event listeners to track keyboard visibility
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

  const fetchDraftDetails = useCallback(() => {
    console.log('draft :', draft);

    if (draft) {
      setCaption(prevCaption => prevCaption || draft.caption);
      setLocation(prevLocation => prevLocation || draft.location);

      // Handle tagged users - if we have details use them, if we only have IDs use those
      if (draft.taggedUsersDetails && draft.taggedUsersDetails.length > 0) {
        // If we have full user details, use them
        setPeopleTag(prevPeopleTag =>
          Array.isArray(prevPeopleTag) && prevPeopleTag.length === 0
            ? draft.taggedUsersDetails
            : prevPeopleTag,
        );
      } else if (draft.taggedUsers && draft.taggedUsers.length > 0) {
        // If we only have IDs, fetch user details
        const fetchUserDetails = async () => {
          try {
            console.log("Fetching details for users:", draft.taggedUsers);
            const response = await post('user/get-users-by-ids', {
              userIds: draft.taggedUsers
            });
            console.log("User details response:", response.data);
            
            // Check if response.data exists and has the users object
            if (response.status === 200 && response.data && response.data.users) {
              // Convert the users object to an array of user objects
              const userDetails = Object.entries(response.data.users).map(([userId, userData]: [string, any]) => ({
                _id: userId, // Use the key as _id
                ...userData,
                name: userData.name || userData.businessName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username
              }));
              
              console.log("Transformed user details:", userDetails);
              setPeopleTag(userDetails);
            }
          } catch (error) {
            console.error('Error fetching tagged users details:', error);
          }
        };
        fetchUserDetails();
      }

      // Only set tags if they are not already set
      setTags(prevTags =>
        prevTags && prevTags.length > 0 ? prevTags : draft.tags,
      );
      setImage(prevImage => prevImage || draft.contentUrl);
      setFileName(prevFileName => prevFileName || draft.fileName || '');
    }
  }, [draft]);

  const handleMentionedUsersToChange = (newUsers: any) => {
    setMentionedUsers((prevMentionedUsers: any) => {
      // Step 1: Extract userIds from previous mentionedUsers (assuming it is an array of strings)
      const prevUserIds = Array.isArray(prevMentionedUsers)
        ? prevMentionedUsers
        : [];

      // Step 2: Extract userIds from newUsers (assuming newUsers is an array of JSON objects)
      const newUserIds = newUsers.map(user => user); // Extract 'userid' from each JSON object

      // Step 3: Merge both arrays and remove duplicates
      const mergedUserIds = Array.from(
        new Set([...prevUserIds, ...newUserIds]),
      );

      console.log('Merged Mentioned Users:', mergedUserIds);

      return mergedUserIds; // Update the state with the merged array of user IDs
    });
  };

  const pickImage = useCallback(async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.video],
        copyTo: 'cachesDirectory',
      });
      if (res && res.length > 0) {
        setFileName(res[0].name);
        setImage(res[0].uri);
        setFilePath(res[0].fileCopyUri);
        setFileType(res[0].type);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        navigation.goBack();
      } else {
        console.error('Unknown Error: ', err);
      }
    }
  }, [navigation]);

  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
  });

  useFocusEffect(
    useCallback(() => {
      fetchDraftDetails();
    }, [fetchDraftDetails]),
  );

  const s3 = new AWS.S3();

  const uploadFiles = async () => {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      const blob = await response.blob();

      const params = {
        Bucket: S3_BUCKET,
        Key: `ugc/${fileName}`,
        Body: blob,
        ContentType: fileType,
        ACL: 'public-read',
      };

      const data = await s3.upload(params).promise();
      setServerFile(data.Location);
      return data.Location;
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const sendDataToServer = async (fileUrl, isDraft = false) => {
    setIsLoading(true);
    
    // Step 1: Filter mentioned users based on whether their username exists in the caption
    const filteredMentionedUsers = mentionedUsers.filter((user: any) =>
        caption.includes(`@${user.username}`),
    );

    // Step 2: Create the payload
    const payload = {
      contentUrl: fileUrl || draft.contentUrl,
      caption,
      contentType: fileType === 'video/mp4' ? 'video' : 'photo',
      flags: {
        draft: isDraft,
        deleted: false,
        archive: false,
      },
      tags: tags,
      location,
      taggedUsers: getSelectedUserIds(),
      mentionedUsers: filteredMentionedUsers.map((user: any) => user.userId), // Only add users whose username is in the caption
    };
    try {
      const response = await put(`ugc/update-ugc/${draft._id}`, payload); // Use PUT for updating the draft;
      if (response.status === 200) {
        navigation.navigate('BottomBar', {
          screen: 'ProfileRewamp',
      });
      } else {
        Alert.alert('Failed to update draft');
      }
    } catch (error) {
      console.error('Error updating draft:', error);
      Alert.alert('Error updating draft');
    } finally {
      setIsLoading(false);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const handleUpdatePost = async () => {
    if (isProcessing) return; // Prevent multiple clicks
    setIsProcessing(true);
    try {
      let contentUrl = draft.contentUrl;
      console.log('contentUrl',contentUrl)
      if (filePath) {
        contentUrl = await uploadFiles();
      }
      if (contentUrl) {
        console.log('here')
        await sendDataToServer(contentUrl, false);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsProcessing(false); // Reset processing flag
    }
  };

  const handleSaveDraft = async () => {
    console.log('->', !image || caption === '');
    if (isProcessing) return; // Prevent multiple clicks
    setIsProcessing(true);
    try {
      let contentUrl = draft.contentUrl;
      if (filePath) {
        contentUrl = await uploadFiles();
      }
      if (contentUrl) {
        await sendDataToServer(contentUrl, true);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsProcessing(false); // Reset processing flag
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

  const handleChangeImage = () => {
    pickImage();
  };

  const resetForm = () => {
    setImage(null);
    setCaption('');
    setLocation('');
    setPeopleTag([]);
    setTags('');
  };

  const handleNavigationBack = () => {
    navigation.goBack();
  };

  const handleBackPress = () => {
    setShowBackAlert(true);
  };

  useEffect(() => {
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
  const showLocationModal = () => {
    setIsLocationModalVisible(true);
  };
  const handleLocationSelect = (selectedLocation: any) => {
    setLocation(`${selectedLocation.City}, ${selectedLocation.State}`);
  };
  const tagIcon = require('../../../assets/ugcs/tagIcon.png');

  const routeToTags = () => {
    // Ensure `peopleTag` is always an array, even if it's undefined or null
    const safePeopleTag = Array.isArray(peopleTag) ? peopleTag : [];

    navigation.navigate('SelectTags', {
      selectedTags: safePeopleTag, // Pass currently selected tags
      onSelect: (newSelectedUsers: any) => {
        // Ensure `newSelectedUsers` is an array, default to an empty array if it's undefined or null
        const safeNewSelectedUsers = Array.isArray(newSelectedUsers)
          ? newSelectedUsers
          : [];

        // Debugging logs to understand the issue better
        console.log('Current peopleTag:', safePeopleTag);
        console.log('New selected users:', safeNewSelectedUsers);

        // Merge newly selected users with existing ones, avoiding duplicates
        const mergedTags = [...safePeopleTag, ...safeNewSelectedUsers].reduce(
          (acc, user) => {
            // Check if `user` and `user._id` are defined before adding
            if (user && user._id && !acc.some(tag => tag._id === user._id)) {
              acc.push(user); // Only add users that haven't been added yet
            }
            return acc;
          },
          [],
        );

        // Debugging log for the merged tags
        console.log('Merged Tags:', mergedTags);

        // Update state
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

  // video player
  const [paused, setPaused] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoPlayer = useRef(null);
  const [buffering, setBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const onProgress = (data: any) => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
    }
  };
  const [muted, setMuted] = useState(false);
  const handleBuffer = (meta: any) => {
    // Only show buffering when video is playing
    if (isPlaying) {
      setBuffering(meta.isBuffering);
    }
  };

  const handlePlay = (e: any) => {
    setIsPlaying(e.isPlaying);
    setBuffering(false); // Assume buffering ends once video starts playing
  };
  const onLoad = (data: any) => {
    if (startForm) {
      videoPlayer.current.seek(startForm);
      setPaused(false);
    }
    setLoading(false);
    setDuration(data.duration);
  };

  const onSeek = value => {
    setIsSeeking(false);
    videoPlayer.current.seek(value);
    setCurrentTime(value);
  };

  const onSlidingStart = () => {
    setIsSeeking(true);
  };

  const togglePlayPause = () => {
    setPaused(!paused);
  };

  const showMentionModal = () => {
    setIsMentionModalVisible(true);
  };

  const handleMentionSelect = (selectedUsers: any[]) => {
    setPeopleTag(prevPeopleTag => {
      // Convert existing tags to array if not already
      const existingTags = Array.isArray(prevPeopleTag) ? prevPeopleTag : [];
      
      // Merge existing and new users, avoiding duplicates based on _id
      const mergedUsers = [...existingTags];
      
      selectedUsers.forEach(newUser => {
        // Only add if user with same _id doesn't exist
        if (!mergedUsers.some(existingUser => existingUser._id === newUser._id)) {
          mergedUsers.push(newUser);
        }
      });
      
      console.log("Updated peopleTag with merged users:", mergedUsers);
      return mergedUsers;
    });
  };

  const getFileTypeFromUrl = (url: string) => {
    if (!url) return 'video/mp4'; // default to video/mp4 if no URL
    
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/mp4';
      case 'jpg':
        return 'photo';
      case 'jpeg':
        return 'photo';
      case 'png':
        return 'photo';
      case 'gif':
        return 'video/mp4';
      default:
        return 'video/mp4'; // default to video/mp4 for unknown extensions
    }
  };

  // Function to get thumbnail URL
  const getThumbnailUrl = async (draft: any) => {
    if (draft.contentUrl?.endsWith('.mp4')) {
      setIsVideo(true);
      if (draft.thumbnailUrl) {
        setThumbnail(draft.thumbnailUrl);
        return draft.thumbnailUrl;
      }
      try {
        const thumb = await createVideoThumbnail(draft.contentUrl);
        setThumbnail(thumb?.path);
        return thumb?.path;
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        return draft.contentUrl.replace('.mp4', '.jpg');
      }
    }
    // For image files (.jpg, .png)
    setIsVideo(false);
    setThumbnail(draft.contentUrl);
    return draft.contentUrl;
  };

  useEffect(() => {
    if (draft) {
      setCaption(draft.caption || '');
      setLocation(draft.location || '');
      setFileType(getFileTypeFromUrl(draft.contentUrl));
      getThumbnailUrl(draft);
    }
  }, [draft]);

  const handleConfirmDelete = async () => {
    setDeleteModalVisible(false);
    console.log("draft",draft._id)
    try {
      const res = await del(`ugc/delete-post/${draft._id}`, '');
      console.log("draft",draft._id)
      if (res) {
        navigation.navigate('BottomBar', {
          screen: 'ProfileRewamp',
      });
      } else {
        Alert.alert('Something went wrong');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      Alert.alert('Error', 'Failed to delete draft');
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalVisible(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={styles.main}
      keyboardVerticalOffset={30}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}>
          <IconIonicons name="chevron-back" size={22} color="#181818" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Post</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: isKeyboardVisible ? 90 : 170 }]}
          keyboardShouldPersistTaps="handled">
          {isLoading ? (
            <Modal
              transparent={true}
              animationType="fade"
              visible={isLoading}
              onRequestClose={() => {}}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <ActivityIndicator size="large" color={Color.black} />
                </View>
              </View>
            </Modal>
          ) : (
            <View style={{flex: 1}}>
              {isShow && (
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                {image && (
                  <View style={styles.imageContainer}>
                    {isVideo ? (
                      <Video
                        style={styles.imagePreview}
                        source={{uri: image}}
                        resizeMode="contain"
                        paused={false}
                        controls={true}
                      />
                    ) : (
                      <Image source={{uri: thumbnail || image}} style={styles.imagePreview} />
                    )}
                    {/* <TouchableOpacity
                      style={styles.editIcon}
                      onPress={handleChangeImage}>
                      <Image
                        source={require('../../../assets/ugcs/editPostIcon.png')}
                        style={{height: 36, width: 36}}
                      />
                    </TouchableOpacity> */}
                  </View>
                )}
              </View>
              )}
              {image && (
                <View style={{flex: 1}}>
                  <UserTaggingInput
                    label="Description"
                    placeholder="Write a description..."
                    value={caption}
                    multiline={true}
                    defaultOneLine={false}
                    numberOfLines={4}
                    error={errors.caption}
                    onFocus={() => handleFieldFocus('caption')}
                    onChangeText={(text: any) => setCaption(text)}
                    token={token}
                    onTagUserChange={handleMentionedUsersToChange}
                    style={{
                      minHeight: 120,
                      textAlignVertical: 'top',
                      paddingTop: 12,
                    }}
                  />

                  <Divider />
                  {location ? (
                    <TouchableOpacity
                      style={styles.Tab}
                      onPress={showLocationModal}>
                      <View style={styles.optionButton}>
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
                    <TouchableOpacity
                      style={styles.Tab}
                      onPress={showMentionModal}>
                      <View style={styles.optionButton}>
                        <Text style={styles.optionText}>Mentions</Text>
                      </View>
                      <Image source={arrowRightIcon} style={styles.icon} />
                    </TouchableOpacity>

                    {peopleTag && peopleTag.length > 0 && (
                      <View style={styles.taggedUsersContainer}>
                        <FlatList
                          data={peopleTag}
                          renderItem={({item}: any) => {
                            console.log("item", peopleTag);
                            return (
                              <View style={styles.chip}>
                                <Text style={styles.chipText}>
                                  {item?.name || // Use the name from the API
                                   item?.businessName || // Then try businessName
                                   (item?.firstName && item?.lastName ? `${item.firstName} ${item.lastName}` : '') || // Then try firstName + lastName
                                   item?.username || // Finally fall back to username
                                   'Unknown User'} {/* Fallback if no name is available */}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => removeTag(item._id)}>
                                  <Icon
                                    name="times"
                                    size={14}
                                    color="#000"
                                    style={styles.removeIcon}
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          }}
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
                    placeholder="Add hashtags related to your post here"
                    value={tags}
                    onChangeTags={(updatedTags: any) => setTags(updatedTags)}
                    iconName="tag"
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.pickButton, styles.draftButton]}
            onPress={handleDeleteClick}>
            <Text style={[styles.pickButtonText, styles.draftButtonText]}>
              Delete
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickButton} onPress={handleUpdatePost}>
            <Text style={styles.pickButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomAlertModal
        visible={deleteModalVisible}
        title="Delete Draft"
        description="Are you sure you want to delete this draft?"
        buttonOneText="Delete"
        buttonTwoText="Cancel"
        onPressButton1={handleConfirmDelete}
        onPressButton2={() => setDeleteModalVisible(false)}
      />

      <LocationModal
        visible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        onSelect={handleLocationSelect}
      />
      <MentionModal
        visible={isMentionModalVisible}
        onClose={() => setIsMentionModalVisible(false)}
        onSelect={handleMentionSelect}
        selectedUsers={peopleTag}
      />

      <CustomAlertModal
        visible={showBackAlert}
        title="Save Changes?"
        description="Would you like to save your changes or discard them?"
        buttonOneText="Save as Draft"
        onPressButton1={ () => {
         handleSaveDraft();
        }}
        buttonTwoText="Post"
        onPressButton2={() => {
          setShowBackAlert(false);
          handleUpdatePost();
        }}
        buttonThreeText="Discard"
        onPressButton3={() => {
          setShowBackAlert(false);
          navigation.goBack();
        }}
        onClose={() => {
          setShowBackAlert(false);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    // elevation: 5,
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#000',
    lineHeight: 20,
    fontFamily: FontFamilies.regular,
    textAlign: 'center',
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
    fontSize: FontSizes.medium,
    fontWeight: '800',
    fontFamily: FontFamilies.semibold,
    color: '#1E1E1E',
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
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.regular,
    color: '#333',
  },
  removeIcon: {
    marginLeft: 5,
    marginBottom: 2,
  },
  buttonContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 25 : 10,
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
    width: '48%',
  },
  draftButton: {
    backgroundColor: '#FFEEEE',
    borderWidth: 0,
  },
  draftButtonText: {
    color: '#ED4956',
    fontFamily: FontFamilies.semibold,
  },
  pickButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: FontFamilies.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default UpdateDraftPage;