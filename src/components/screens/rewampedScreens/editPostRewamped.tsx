import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
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
    ScrollView,
    Keyboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { del, put } from '../../../services/dataRequest';
import CustomTagInput from '../../commons/customTagInput';
import { Divider } from 'react-native-paper';
import UserTaggingInput from '../../screens/profile/businessProfile/userTagggingInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import { Color, FontFamilies, FontSizes } from '../../../styles/constants';
import MentionModal from '../../commons/MentionModal';
import LocationModal from '../../commons/LocationModal';
import CustomAlertModal from '../../commons/customAlert';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { useDispatch } from 'react-redux';
import { updateCompletePost } from '../../../redux/slices/postSlice';

// Define proper types for CustomTagInput to resolve type issues
interface CustomTagInputProps {
    label: string;
    placeholder: string;
    value: string[];
    onChangeTags: (tags: string[]) => void;
    iconName?: string;
    error?: string;
    onFocus?: () => void;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    disabled?: boolean;
}

interface User {
    _id: string;
    name?: string;
    businessName?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
}

interface TaggedUser extends User {
    userId?: string;
    profilePic?: string;
}

interface RouteParams {
    draft: {
        _id: string;
        caption?: string;
        contentUrl?: string;
        contentType?: string;
        tags?: string[];
        taggedUsers?: string[];
        taggedUsersDetails?: TaggedUser[];
        mentionedUsers?: string[];
        mentionedUsersDetails?: User[];
        userDetails?: {
            location?: string;
        };
        post?: any;
    };
}

type RootStackParamList = {
    BottomBar: {
        screen: 'ProfileRewamp';
    };
};

type NavigationProps = NavigationProp<RootStackParamList>;

const EditPostRewamped: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [mentionedUsers, setMentionedUsers] = useState<User[]>([]);
    const [fileType, setFileType] = useState('photo');
    const [location, setLocation] = useState('');
    const [peopleTag, setPeopleTag] = useState<TaggedUser[]>([]);
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [errors, setErrors] = useState({
        caption: '',
        description: '',
        location: '',
    });
    const [isMentionModalVisible, setIsMentionModalVisible] = useState(false);
    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [showBackAlert, setShowBackAlert] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [duration, setDuration] = useState('00:00');
    const [thumbnail, setThumbnail] = useState('');

    const navigation = useNavigation<NavigationProps>();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { draft } = route.params;
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const savedToken = await AsyncStorage.getItem('userToken');
                if (savedToken) {
                    setToken(savedToken);
                }
            } catch (error) {
                console.error('Failed to fetch token:', error);
            }
        };

        fetchToken();
    }, []);

    useEffect(() => {
        if (draft) {
            setCaption(draft.caption || '');
            setLocation(draft.userDetails?.location || '');
            setImage(draft.contentUrl || null);
            setFileType(draft.contentType || 'photo');
            
            console.log('Tags from draft:', draft.tags);
            console.log('Tags from post:', draft.post?.tags);
            
            // Handle tags with null check and ensure it's an array
            if (draft.tags && Array.isArray(draft.tags)) {
                setTags(draft.tags);
            } else if (draft.post?.tags && Array.isArray(draft.post.tags)) {
                setTags(draft.post.tags);
            } else {
                setTags([]);
            }
            
            console.log('Tag draft:', tags);
            console.log('Tag post:', draft.post?.tags);
            // Handle tagged users
            if (draft.taggedUsersDetails && Array.isArray(draft.taggedUsersDetails) && draft.taggedUsersDetails.length > 0) {
                setPeopleTag(draft.taggedUsersDetails);
            } else if (draft.post?.taggedUsersDetails && Array.isArray(draft.post.taggedUsersDetails) && draft.post.taggedUsersDetails.length > 0) {
                setPeopleTag(draft.post.taggedUsersDetails);
            }
            
            // Handle mentioned users if any
            if (draft.mentionedUsersDetails && Array.isArray(draft.mentionedUsersDetails) && draft.mentionedUsersDetails.length > 0) {
                setMentionedUsers(draft.mentionedUsersDetails);
            } else if (draft.post?.mentionedUsersDetails && Array.isArray(draft.post.mentionedUsersDetails) && draft.post.mentionedUsersDetails.length > 0) {
                setMentionedUsers(draft.post.mentionedUsersDetails);
            }
        }
    }, [draft]);

    // For debugging
    useEffect(() => {
        console.log('Current tags state:', tags);
    }, [tags]);

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

    const handleFieldFocus = (field: string) => {
        setErrors(prevErrors => ({
            ...prevErrors,
            [field]: '',
        }));
    };

    const showLocationModal = () => {
        setIsLocationModalVisible(true);
    };

    const handleLocationSelect = (selectedLocation: any) => {
        if (selectedLocation && selectedLocation.City && selectedLocation.State) {
            setLocation(`${selectedLocation.City}, ${selectedLocation.State}`);
        }
    };

    const showMentionModal = () => {
        setIsMentionModalVisible(true);
    };

    const handleMentionSelect = (selectedUsers: User[]) => {
        if (!selectedUsers || !Array.isArray(selectedUsers)) return;
        
        setPeopleTag(prevPeopleTag => {
            const existingTags = Array.isArray(prevPeopleTag) ? prevPeopleTag : [];
            const mergedUsers = [...existingTags];

            selectedUsers.forEach(newUser => {
                if (newUser && newUser._id && !mergedUsers.some(existingUser => existingUser && existingUser._id === newUser._id)) {
                    mergedUsers.push(newUser);
                }
            });

            return mergedUsers;
        });
    };

    const removeTag = (userId: string) => {
        if (!userId) return;
        setPeopleTag(peopleTag.filter(tag => tag && tag._id !== userId));
    };

    const handleUpdatePost = async () => {
        if (isLoading) return;
        
        // Validate description field
        let hasError = false;
        const newErrors = {
            caption: '',
            description: '',
            location: '',
        };
        
        if (!caption || caption.trim() === '') {
            newErrors.caption = 'Description is required';
            newErrors.description = 'Description is required';
            hasError = true;
        }
        
        if (hasError) {
            setErrors(newErrors);
            return; // Prevent submission if there are errors
        }
        
        setIsLoading(true);

        try {
            const contentType = fileType === 'ugc' ? 'photo' : fileType;
            const payload = {
                contentUrl: image,
                caption,
                contentType,
                tags,
                location,
                taggedUsers: peopleTag.filter(tag => tag && tag._id).map(tag => tag._id),
                mentionedUsers: mentionedUsers.filter(user => user && user._id).map(user => user._id),
            };
            
            console.log('Updating post with tags:', tags);
            
            const response = await put(`ugc/update-ugc/${draft._id}`, payload);
            if (response && response.status === 200) {
                // Create updated post data by merging original draft with updated fields
                const updatedPost = {
                    ...draft.post, // Original post data
                    caption,
                    contentUrl: image,
                    contentType,
                    tags,
                    location,
                    taggedUsers: peopleTag.filter(tag => tag && tag._id).map(tag => tag._id),
                    taggedUsersDetails: peopleTag,
                    mentionedUsers: mentionedUsers.filter(user => user && user._id).map(user => user._id),
                    mentionedUsersDetails: mentionedUsers,
                    userDetails: {
                        ...(draft.post?.userDetails || {}),
                        location,
                    },
                    // Add timestamp to indicate the update
                    updatedAt: new Date().toISOString()
                };
                
                // Dispatch to Redux to update all instances of this post
                dispatch(updateCompletePost({
                    postId: draft._id,
                    postData: updatedPost
                }));
                
                // Navigate back
                navigation.goBack();
            } else {
                Alert.alert('Failed to update post');
            }
        } catch (error) {
            console.error('Error updating post:', error);
            Alert.alert('Error', 'Failed to update post');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        setDeleteModalVisible(false);
        try {
            const res = await del(`ugc/delete-post/${draft._id}`, '');
            if (res) {
                navigation.navigate('BottomBar', {
                    screen: 'ProfileRewamp',
                });
            } else {
                Alert.alert('Something went wrong');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Failed to delete post');
        }
    };

    const handleBackPress = () => {
        // Check if description is empty before showing back alert
        
        
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

    const handleTagsChange = useCallback((newTags: string[]) => {
        console.log('Tags changed:', newTags);
        if (Array.isArray(newTags)) {
            setTags(newTags);
        }
    }, []);

    // Custom implementation to display tags if CustomTagInput isn't showing them
    const renderTags = () => {
        if (!tags || tags.length === 0) return null;
        
        return (
            <View style={styles.customTagContainer}>
                {tags.map((tag, index) => (
                    <View key={index} style={styles.customTag}>
                        <Text style={styles.customTagText}>{tag}</Text>
                        <TouchableOpacity 
                            onPress={() => {
                                const newTags = [...tags];
                                newTags.splice(index, 1);
                                setTags(newTags);
                            }}
                        >
                            <Text style={styles.customRemoveTag}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    const isVideo = fileType === 'video';

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContainer, { paddingBottom: isKeyboardVisible ? 90 : 170 }]}
                keyboardShouldPersistTaps="handled">
                {isLoading ? (
                    <Modal
                        transparent={true}
                        animationType="fade"
                        visible={isLoading}
                        onRequestClose={() => { }}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <ActivityIndicator size="large" color={Color.black} />
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <View style={{ flex: 1 }}>
                        {image && (
                            <View style={styles.imageContainer}>
                                {isVideo ? (
                                    <Video
                                        onLoad={data => {
                                            setDuration(formatTime(data.duration));
                                        }}
                                        style={{
                                            ...styles.imagePreview,
                                            maxWidth: '100%',
                                            borderRadius: 100,
                                        }}
                                        paused={false}
                                        controls={true}
                                        source={{uri: image}}
                                        muted={true}
                                    />
                                ) : (
                                    <FastImage
                                        source={{ uri: image }}
                                        style={styles.imagePreview}
                                        resizeMode="contain"
                                    />
                                )}
                                {/* {isVideo && (
                                    <View
                                        style={{
                                            backgroundColor: '#1E1E1E',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            position: 'absolute',
                                            top: 0,
                                            right: 30,
                                            zIndex: 1,
                                            borderRadius: 16,
                                            padding: 8,
                                        }}>
                                        <Text
                                            style={{
                                                fontFamily: FontFamilies.semibold,
                                                color: '#FFFFFF',
                                                fontWeight: '400',
                                                fontSize: 11,
                                            }}>
                                            {duration}
                                        </Text>
                                    </View>
                                )} */}
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <UserTaggingInput
                                label="Description"
                                placeholder="Write a description..."
                                value={caption}
                                multiline={true}
                                defaultOneLine={false}
                                numberOfLines={4}
                                error={errors.caption}
                                onFocus={() => handleFieldFocus('caption')}
                                onChangeText={(text: string) => {
                                    setCaption(text);
                                    if (errors.caption && text.trim() !== '') {
                                        // Clear error when user starts typing
                                        setErrors(prev => ({...prev, caption: '', description: ''}));
                                    }
                                }}
                                token={token}
                                onTagUserChange={setMentionedUsers}
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
                                    <Image source={require('../../../assets/settings/arrowRightIcon.png')} style={styles.icon} />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.Tab}
                                    onPress={showLocationModal}>
                                    <View style={styles.optionButton}>
                                        <Text style={styles.optionText}>Location</Text>
                                    </View>
                                    <Image source={require('../../../assets/settings/arrowRightIcon.png')} style={styles.icon} />
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
                                    <Image source={require('../../../assets/settings/arrowRightIcon.png')} style={styles.icon} />
                                </TouchableOpacity>

                                {peopleTag && peopleTag.length > 0 && (
                                    <View style={styles.taggedUsersContainer}>
                                        <FlatList
                                            data={peopleTag}
                                            renderItem={({ item }: { item: TaggedUser }) => (
                                                <View style={styles.chip}>
                                                    <Text style={styles.chipText}>
                                                        {item?.name || item?.businessName ||
                                                            (item?.firstName && item?.lastName ? `${item.firstName} ${item.lastName}` : '') ||
                                                            item?.username || 'Unknown User'}
                                                    </Text>
                                                    <TouchableOpacity
                                                        onPress={() => removeTag(item._id)}>
                                                        <IconIonicons
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
                                placeholder="Add hashtags related to your post here"
                                value={tags}
                                onChangeTags={handleTagsChange}
                                iconName="tag"
                            />
                            
                            {/* Render existing tags in case CustomTagInput isn't showing them */}
                            {/* {renderTags()} */}
                        </View>
                    </View>
                )}
                {isKeyboardVisible && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.pickButton, styles.draftButton]}
                            onPress={handleDeleteClick}>
                            <Text style={[styles.pickButtonText, styles.draftButtonText]}>
                                Delete
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pickButton} onPress={handleUpdatePost}>
                            <Text style={styles.pickButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {!isKeyboardVisible && (
                <View style={[styles.buttonContainer,{bottom:80,left:10}]}>
                    <TouchableOpacity
                        style={[styles.pickButton, styles.draftButton]}
                        onPress={handleDeleteClick}>
                        <Text style={[styles.pickButtonText, styles.draftButtonText]}>
                            Delete
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pickButton} onPress={handleUpdatePost}>
                        <Text style={styles.pickButtonText}>Update</Text>
                    </TouchableOpacity>
        </View>
            )}

            <CustomAlertModal
                visible={deleteModalVisible}
                title="Delete Post"
                description="Are you sure you want to delete this post?"
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
                buttonOneText="Save"
                onPressButton1={() => {
                    // Validate before saving
                    if (!caption || caption.trim() === '') {
                        setErrors({
                            ...errors,
                            caption: 'Description is required',
                            description: 'Description is required',
                        });
                        setShowBackAlert(false);
                        return;
                    }
                    handleUpdatePost();
                }}
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
    );
};

const styles = StyleSheet.create({
    main: {
        flexGrow: 1,
        backgroundColor: '#FFF',
        padding: 15,
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
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    imageContainer: {
        position: "relative",
        alignItems: 'center',
        width: '70%',
        aspectRatio: 1,
        backgroundColor: Color.white,
        borderRadius: 22,
        marginBottom: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        borderWidth: 1,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
        position: 'absolute',
        bottom: 10,
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pickButton: {
        backgroundColor: '#1E1E1E',
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        width: '48%',
        marginHorizontal: 5,
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
    customTagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    customTag: {
        backgroundColor: '#e0e0e0',
        padding: 5,
        borderRadius: 5,
        margin: 2,
    },
    customTagText: {
        fontSize: FontSizes.medium,
        fontFamily: FontFamilies.regular,
        color: '#333',
    },
    customRemoveTag: {
        fontSize: FontSizes.medium,
        fontFamily: FontFamilies.regular,
        color: '#ED4956',
        marginLeft: 5,
    },
});

export default EditPostRewamped;