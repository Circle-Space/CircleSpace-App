import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView as RNSafeAreaView,
    Alert,
    Platform,
    Modal,
    Dimensions,
    Keyboard,
} from 'react-native';
import { Divider } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { del, post, get } from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertModal from '../../commons/customAlert';
import { handleShareProject } from '../jobs/utils/utils';
import BottomSheet, { BottomSheetFooter, BottomSheetView } from '@gorhom/bottom-sheet';
import LikesBottomSheet from '../../commons/customLikeSheet';
import {
    Color,
    FontFamilies,
    FontSizes,
} from '../../../styles/constants';
import CommentList from '../Home/CommentList';
import CommentInputCard from '../Home/CommentInputCard';
import BackButton from '../../commons/customBackHandler';
import { getInitials } from '../../../utils/commonFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike as toggleLikeInPostSlice, toggleSave, updatePostState, clearLastEditedPost } from '../../../redux/slices/postSlice';
import { toggleLike as toggleLikeInLikeSlice } from '../../../redux/slices/likeSlice';
import { RootState } from '../../../redux/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { updatePostFollowStatus, setFollowCounts, syncFollowStatus } from '../../../redux/slices/feedSlice';
import BottomSheetModal from '../../screens/profile/BottomSheetModal';
import { setSaveStatus } from '../../../redux/slices/saveSlice';
import LikedUsersModal from '../../commons/LikedUsersModal';
import FeedLayout from '../rewampedExp/feedLayout';
import { SafeAreaView } from 'react-native-safe-area-context';

const DANGER_COLOR = '#ED4956';


type RootStackParamList = {
    OtherUserProfileRewamped: {
        userId: string;
        isSelfProfile: boolean;
    };
    Profile: {
        id: string;
        tab: string;
    };
    UploadProjects: {
        data: any;
    };
    FullScreenImageView: {
        items: Array<{
            imageUrl: string;
            userDetails: {
                name: string;
                username: string;
                location: string;
                profilePic: string;
                isLiked: boolean;
                isSaved: boolean;
                likeCount: number;
                commentCount: number;
            };
            caption: string;
        }>;
        initialIndex: number;
        type: string;
        projectId?: string;
    };
    FullPostScreen: {
        feed: any;
        selectedIndex: number;
    };
};

const CHARACTER_LIMIT = 100;
const TAG_LIMIT = 3;

const ProjectDetailRewamped = ({ route }: any) => {
    console.log("ProjectDetailRewamped route:", route);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { feed, token, pageName } = route.params;
    const postedByUserId = feed?.posterDetails?._id;
    const [selfPost, setSelfPost] = useState(false);
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [showLikeBottomSheet, setShowLikeBottomSheet] = useState(false);
    const [showCommentBottomSheet, setShowCommentBottomSheet] = useState(false);
    const [isFollowing, setIsFollowing] = useState(feed?.isFollowed || false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const bottomSheetLikeRef = useRef<BottomSheet>(null);
    const bottomSheetCommentRef = useRef<BottomSheet>(null);
    const [openComments, setOpenComments] = useState(false);
    const feedState = useSelector((state: RootState) => state.feed);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);

    const dispatch = useDispatch();
    const postState = useSelector((state: RootState) =>
        feed?._id ? state.posts.posts[feed._id] : null
    );

    // Add postsState from Redux to track updates
    const postsState = useSelector((state: RootState) => state.posts);

    // Get like state from Redux
    const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
    const likeCounts = useSelector((state: RootState) => state.like.likeCounts);
    const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);


    // Create derived values from Redux state for likes
    const isProjectLiked = feed ? (likedPosts[feed._id] !== undefined ? likedPosts[feed._id] : feed.isLiked || false) : false;
    const projectLikeCount = feed ? (likeCounts[feed._id] !== undefined ? likeCounts[feed._id] : feed.likes || 0) : 0;
    const isSaved = feed ? (savedPosts[feed._id] !== undefined ? savedPosts[feed._id] : feed.isSaved || false) : false;

    const feedURL = feed?.contentUrl ? feed?.contentUrl : feed?.images;
    // Format data to be compatible with FeedLayout
    const formattedContentUrls = feedURL?.map((item: any, index: number) => ({
        _id: index + 1,
        contentUrl: item,
        contentType: 'photo', // Set contentType for FeedLayout
        posterDetails: feed?.posterDetails, // Pass posterDetails for FeedLayout
        caption: feed?.caption || '', // Pass caption
        isLiked: isProjectLiked,
        isSaved: isSaved,
        likes: projectLikeCount
    }));

    // Get comment count from Redux
    const reduxCommentCount = useSelector((state: RootState) => {
        return feed?._id ? state.comment.commentCounts[feed._id] || 0 : 0;
    });

    // Initialize post state from feed data
    useEffect(() => {
        if (feed?._id) {
            // Only update if the values are different from current state
            const currentState = postState;
            if (!currentState ||
                currentState.isLiked !== feed.isLiked ||
                currentState.isSaved !== feed.isSaved ||
                currentState.likeCount !== feed.likes ||
                currentState.commentCount !== feed.commentsCount) {
                dispatch(updatePostState({
                    id: feed._id,
                    isLiked: feed.isLiked || false,
                    isSaved: feed.isSaved || false,
                    likeCount: feed.likes || 0,
                    commentCount: feed.commentsCount || 0
                }));
            }
        }
    }, [feed?._id]); // Only depend on feed._id

    // Initialize follow state from feed data and Redux
    useEffect(() => {
        if (postedByUserId) {
            // First check Redux state
            const reduxFollowState = feedState.userFollowStatus[postedByUserId];

            if (reduxFollowState !== undefined) {
                setIsFollowing(reduxFollowState);
            } else if (feed?.isFollowed !== undefined) {
                // Fallback to feed data if Redux state doesn't exist
                setIsFollowing(feed.isFollowed);
                // Sync to Redux
                dispatch(updatePostFollowStatus({
                    userId: postedByUserId,
                    isFollowed: feed.isFollowed
                }));
            }
        }
    }, [feed?.isFollowed, postedByUserId, feedState.userFollowStatus]);

    // Update follow state when Redux state changes
    useEffect(() => {
        if (feedState.lastUpdatedUserId === postedByUserId) {
            const isFollowed = feedState.userFollowStatus[postedByUserId] || false;
            setIsFollowing(isFollowed);
        }
    }, [feedState.lastUpdatedUserId, feedState.lastAction, feedState.userFollowStatus, postedByUserId]);

    const fetchLatestPost = async (projectId: string) => {
        try {
            const savedToken = await AsyncStorage.getItem('userToken');
            if (!savedToken) {
                console.error('No token found');
                return;
            }

            const response = await get(`project/get-project/${projectId}`, undefined, savedToken);
            if (response?.project) {
                dispatch(updatePostState({
                    id: projectId,
                    isLiked: response.project.isLiked,
                    isSaved: response.project.isSaved,
                    likeCount: response.project.likes,
                    commentCount: response.project.commentsCount || 0
                }));
            }
        } catch (error) {
            console.error('Error fetching latest project:', error);
        }
    };

    const getInitialData = async () => {
        try {
            let storedData;
            if (pageName === 'home') {
                storedData = await AsyncStorage.getItem('initialData');
            } else if (pageName === 'tags') {
                storedData = await AsyncStorage.getItem('tagResultsData');
            }
            if (storedData !== null) {
                const posts = JSON.parse(storedData!);
                const matchingPost = posts.find((post: any) => post._id === feed._id);
                if (matchingPost) {
                    dispatch(updatePostState({
                        id: feed._id,
                        isLiked: matchingPost.isLiked,
                        isSaved: matchingPost.isSaved,
                        likeCount: matchingPost.likes,
                        commentCount: matchingPost.commentsCount || 0
                    }));
                }
            }
        } catch (error) {
            console.error('Error retrieving data:', error);
        }
    };

    const routeToProfile = async (id: string, accountType: string) => {
        try {
            const account_ = await AsyncStorage.getItem('user');
            const currentUser = JSON.parse(account_ || '{}')._id;
            const isSelfProfile = currentUser === id;
            if (isSelfProfile) {
                navigation.navigate('BottomBar', {
                    screen: 'ProfileScreen',
                    params: {
                        isSelf: true
                    }
                });
            } else {
                if (accountType === 'professional') {
                    navigation.navigate('otherBusinessScreen', {
                        userId: id,
                        isSelf: false
                    });
                } else {
                    navigation.navigate('otherProfileScreen', {
                        userId: id,
                        isSelf: false
                    });
                }
            }
        } catch (error) {
            console.error('Error routing to profile:', error);
        }
    };

    const handleProjectEdit = (item: any) => {
        navigation.navigate('UploadProjects', { data: item });
    };

    const handleTagPress = (userId: string) => {
        if (loggedInUserId !== userId) {
            navigation.navigate('OtherUserProfileRewamped', {
                userId: userId,
                isSelfProfile: false
            });
        } else {
            navigation.navigate('Profile', {
                id: userId,
                tab: 'Projects'
            });
        }
    };

    const updateCommentCount = (prevCount: number) => {
        dispatch(updatePostState({
            id: feed?._id,
            commentCount: prevCount
        }));
    };

    useFocusEffect(
        useCallback(() => {
            fetchLatestPost(feed._id);
            const checkIfCanEdit = async () => {
                await getInitialData();
                await getUserDetail();
            };
            checkIfCanEdit();
        }, [loggedInUserId, feed])
    );

    // Add effect to check for updated project data in Redux when the screen is focused
    useFocusEffect(
        useCallback(() => {
            // Check if the current project is the one that was just edited
            if (feed && postsState.lastEditedPostId === feed._id) {
                console.log('[ProjectDetailRewamped] Detected project update in Redux, refreshing UI');
                
                // Get the updated project data from Redux
                const updatedProjectData = postsState.posts[feed._id]?.fullPostData;
                
                if (updatedProjectData) {
                    // Update the feed state with the new data to refresh the UI
                    navigation.setParams({
                        feed: updatedProjectData,
                        token,
                        accountType: feed?.posterDetails?.accountType,
                        pageName
                    });
                }
                
                // Clear the last edited post ID from Redux to avoid duplicate updates
                dispatch(clearLastEditedPost());
            }
        }, [feed?._id, postsState.lastEditedPostId, postsState.posts])
    );

    const getUserDetail = async () => {
        const user = await AsyncStorage.getItem('user');
        const userData = JSON.parse(user!);
        setLoggedInUserId(userData?._id);
        setSelfPost(userData?._id === postedByUserId);
    };

    const handleLikePress = async () => {
        if (!feed || !feed._id) return;
        try {

            // Get current values from derived state
            const currentLiked = isProjectLiked;
            const currentLikes = projectLikeCount;

            // Optimistic update through Redux
            dispatch(toggleLikeInPostSlice(feed._id));
            dispatch(toggleLikeInLikeSlice(feed._id));

            // Update network with correct project endpoint
            const response = await post(`project/toggle-like/?projectId=${feed._id}`, {});
            
            if (!response || response.status !== 200) {
                // Revert optimistic update if API call fails
                console.error('Failed to update like status:', response);
                dispatch(toggleLikeInPostSlice(feed._id));
                dispatch(toggleLikeInLikeSlice(feed._id));
                return;
            }

            // State is already updated through Redux - no need for AsyncStorage manipulation
            // Redux will ensure that likes are updated consistently across the app
        } catch (error) {
            console.error('Error in handleLikePress:', error);
        }
    };

    const unsavePost = async (postId: string) => {
        const response = await del(`collections/remove-item/${postId}`, '');
        if (response && response.message === 'Item removed from all collections successfully') {
            dispatch(setSaveStatus({ postId: feed._id, isSaved: false }));
            await fetchLatestPost(postId);
        } else {
            dispatch(setSaveStatus({ postId: feed._id, isSaved: true }));
            throw new Error('Failed to unsave the post');
        }
    };

    const handleSavePress = async () => {
        // if (!feed?._id) return;


        try {
            if (isSaved) {
                // If already saved, unsave it
                await unsavePost(feed._id);
            } else {
                // Show collection selector modal
                setIsModalVisible(true);
            }
        } catch (error) {
            console.error('Error handling save:', error);
        }
    };

    const handleSaveToCollection = async (collectionInfo: any) => {
        if (!feed?._id) return;

        try {
            // If this is a new collection creation, just update Redux state
            if (collectionInfo.isNewCollection) {
                dispatch(setSaveStatus({ postId: feed._id, isSaved: true }));
                return;
            }

            // For existing collections, make the API call
            const response = await post(`collections/add-item/${collectionInfo.collectionInfo.collectionId}`, {
                itemId: feed._id,
                itemType: feed?.contentType === 'ugc' ? 'photo' : feed?.contentType || 'project'
            });

            if (response && response.message === 'Item added to collection successfully') {
                // Update Redux state
                dispatch(setSaveStatus({ postId: feed._id, isSaved: true }));
                await fetchLatestPost(feed._id);
            } else {
                dispatch(setSaveStatus({ postId: feed._id, isSaved: false }));
                throw new Error('Failed to save the post');
            }
        } catch (error) {
            console.error('Error in handleSaveToCollection:', error);
            Alert.alert('Error', 'Failed to save to collection');
        } finally {
            setShowCollectionModal(false);
        }
    };

    const handleCardPress = (item: any, selectedIndex: number) => {
        if (!feed) return;

        const images = Array.isArray(feed.contentUrl)
            ? feed.contentUrl
            : [feed.contentUrl];

        const initialIndex = images.findIndex((img: string | string[]) => {
            if (typeof img === 'string') return img === item.contentUrl;
            if (Array.isArray(img)) return img.includes(item.contentUrl);
            return false;
        });

        // Create a structured array of items with all necessary details
        const items = images.map((img: string) => ({
            imageUrl: img,
            userDetails: {
                id: feed?.posterDetails?._id || feed?.userDetails?._id || '',
                name: feed?.posterDetails?.firstName || feed?.userDetails?.firstName || '',
                username: feed?.posterDetails?.username || feed?.userDetails?.username || '',
                location: feed?.location || '',
                profilePic: feed?.posterDetails?.profilePic || feed?.userDetails?.profilePic || '',
                isLiked: isProjectLiked,
                isSaved: Boolean(postState?.isSaved),
                likeCount: projectLikeCount,
                commentCount: Number(postState?.commentCount) || 0,
                isPaid: feed?.posterDetails?.isPaid || false,
                accountType: feed?.posterDetails?.accountType || ''
            },
            caption: feed?.caption || ''
        }));

        // Explicitly define the navigation parameters
        type FullScreenParams = {
            items: Array<{
                imageUrl: string;
                userDetails: {
                    id?: string;
                    name: string;
                    username: string;
                    location: string;
                    profilePic: string;
                    isLiked: boolean;
                    isSaved: boolean;
                    likeCount: number;
                    commentCount: number;
                    isPaid: boolean;
                    accountType: string;
                };
                caption: string;
            }>;
            initialIndex: number;
            type: string;
            projectId?: string;
        };

        const navParams: FullScreenParams = {
            items,
            initialIndex: initialIndex >= 0 ? initialIndex : 0,
            type: 'project',
            projectId: feed?._id
        };

        navigation.navigate('FullScreenProjectRewamped', navParams);
    };

    const handleMenuToggle = () => {
        setMenuVisible(!menuVisible);
    };

    const handleMenuOptionSelect = (option: string) => {
        setMenuVisible(false);
        switch (option) {
            case 'report':
                setIsReportModalVisible(true);
                break;
            case 'delete':
                setDeleteMenuVisible(true);
                break;
            case 'share':
                handleShareProject(feed);
                break;
            case 'edit':
                handleProjectEdit(feed);
                break;
            default:
                break;
        }
    };

    const handleConfirmDelete = async () => {
        setMenuVisible(false);
        const id = feed?._id;
        const res = await del(`project/delete-project?projectId=${id}`, '');
        if (res) {
            setDeleteMenuVisible(false);
            routeToProfile(feed?.posterDetails?._id);
        } else {
            Alert.alert('Something went wrong');
            setDeleteMenuVisible(false);
        }
    };

    const handleCloseCommentBottomSheet = () => {
        if (bottomSheetCommentRef.current) {
            bottomSheetCommentRef.current.close();
        }
        setShowCommentBottomSheet(false);
    };

    const handleCommentPress = () => {
        Keyboard.dismiss();
        setOpenComments(true);
    };

    const followUser = async () => {
        if (!postedByUserId) return;

        try {
            const response = await post(`user/toggle-follow/${postedByUserId}`, {});

            if (response.status === 200) {
                const newFollowState = !isFollowing;

                // Update Redux feed state
                dispatch(updatePostFollowStatus({
                    userId: postedByUserId,
                    isFollowed: newFollowState
                }));

                // Sync with other components
                dispatch(syncFollowStatus({
                    userId: postedByUserId,
                    isFollowed: newFollowState
                }));

                // Update local state
                setIsFollowing(newFollowState);
                setFollowersCount(prevCount => newFollowState ? prevCount + 1 : prevCount - 1);

                // Update follow counts in Redux
                dispatch(setFollowCounts({
                    followers: followersCount,
                    following: newFollowState ? followingCount + 1 : followingCount - 1
                }));

            }
        } catch (error) {
            console.error('[ProjectDetail] Error following user:', error);
        }
    };

    const renderCaption = () => {
        const caption = feed?.caption || '';
        const words = caption.split(/(\s+)/);

        return words.map((word: string, index: number) => {
            if (word.startsWith('@')) {
                const usernameWithoutAt = word.slice(1).trim();
                const taggedUser = feed?.mentionedUsersDetails?.find(
                    (user: any) => user.username === usernameWithoutAt
                );

                if (taggedUser) {
                    return (
                        <Text
                            key={index}
                            style={styles.taggedText}
                            onPress={() => handleTagPress(taggedUser.userId)}>
                            {word}{' '}
                        </Text>
                    );
                }
            }
            return <Text key={index}>{word}</Text>;
        });
    };

    const handleReportOptionSelect = async (reason: any) => {
        try {
            const payload = {
                postId: feed?._id,
                reason,
            };
            const response = await post('report/project', payload);
            if (response.status == 200) {
                Alert.alert(
                    'Success',
                    'Thanks for your feedback!\n We use these reports to show you less of this kind of content in the future.'
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to report post');
        } finally {
            setIsReportModalVisible(false);
        }
    };

    const renderFooter = useCallback(
        (props: any) => (
            <BottomSheetFooter {...props} bottomInset={0}>
                <View style={styles.footerContainer}>
                    <CommentInputCard
                        postId={feed?._id}
                        token={token}
                        onCommentAdded={() => updateCommentCount(postState?.commentCount || 0 + 1)}
                        isProject={true}
                    />
                </View>
            </BottomSheetFooter>
        ),
        []
    );

    const renderTags = () => {
        if (!feed?.tags || !Array.isArray(feed.tags) || feed.tags.length === 0) {
            return null;
        }

        const filteredTags = feed.tags.filter((tag: string) => tag.trim() !== '');
        const displayTags = showAllTags ? filteredTags : filteredTags.slice(0, TAG_LIMIT);
        const hasMoreTags = filteredTags.length > TAG_LIMIT;

        // Fix the navigation function with type assertion
        const routeToTagResults = (tag: string) => {
            // Navigate to the TagResultsScreen with the tag as query parameter
            if (navigation) {
                (navigation as any).navigate('TagResultScreenRewamped', { query: tag });
            }
        };

        return (
            <View style={styles.tagsContainer}>
                <View style={styles.tagsWrapper}>
                    {displayTags.map((tag: string, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.tagButton}
                            onPress={() => console.log(tag)}
                        >
                            <Text style={styles.tagText}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                    {hasMoreTags && (
                        <TouchableOpacity
                            style={styles.moreTagsButton}
                            onPress={() => setShowAllTags(!showAllTags)}
                        >
                            <Text style={styles.moreTagsText}>
                                {showAllTags ? 'less..' : `+${filteredTags.length - TAG_LIMIT}`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <ScrollView 
                    contentContainerStyle={styles.scrollView}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    overScrollMode="never"
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}>
                            <BackButton />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleMenuToggle}>
                            <Image
                                source={require('../../../assets/header/moreIcon.png')}
                                style={{ height: 30, width: 30 }}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userDetails}>
                        <View style={styles.detailsContainer}>
                            <View style={styles.userInfoContainer}>
                                <TouchableOpacity
                                    style={styles.left}
                                    onPress={() => routeToProfile(feed?.posterDetails?._id, feed?.posterDetails?.accountType)}>
                                    {feed?.posterDetails?.profilePic || feed?.userDetails?.profilePic ? (
                                        <Image
                                            source={{ uri: feed?.posterDetails?.profilePic || feed?.userDetails?.profilePic }}
                                            style={styles.avatar}
                                        />
                                    ) : (
                                        <View style={styles.initialsAvatar}>
                                            <Text style={styles.initialsText}>
                                                {getInitials(
                                                    feed?.posterDetails?.username
                                                )}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.user}>
                                        <Text style={styles.name}>
                                            {feed?.posterDetails?.username}
                                            {/* {loggedInUserId !== feed?.posterDetails?._id
                                                ? (feed?.userDetails?.firstName || feed?.posterDetails?.firstName)
                                                    ? (feed?.userDetails?.firstName?.length > 15 || feed?.posterDetails?.firstName?.length > 15)
                                                        ? `${(feed?.userDetails?.firstName || feed?.posterDetails?.firstName).slice(0, 18)}...`
                                                        : feed?.userDetails?.firstName || feed?.posterDetails?.firstName
                                                    : (feed?.userDetails?.name || feed?.posterDetails?.name)?.length > 15
                                                        ? `${(feed?.userDetails?.name || feed?.posterDetails?.name).slice(0, 18)}...`
                                                        : feed?.userDetails?.name || feed?.posterDetails?.name || feed?.userDetails?.username || feed?.posterDetails?.username || ''
                                                : (feed?.userDetails?.firstName || feed?.posterDetails?.firstName)
                                                    ? `${feed?.userDetails?.firstName || feed?.posterDetails?.firstName} ${feed?.userDetails?.lastName || feed?.posterDetails?.lastName || ''}`.trim()
                                                    : feed?.userDetails?.name || feed?.posterDetails?.name || feed?.userDetails?.username || feed?.posterDetails?.username || ''} */}
                                        </Text>
                                        {feed?.posterDetails?.isPaid &&
                                            feed?.posterDetails?.accountType === 'professional' && (
                                                <View style={styles.verifiedBadgeContainer}>
                                                    <Image
                                                        source={require('../../../assets/settings/subscription/VerifiedIcon.png')}
                                                        style={styles.verifiedBadge}
                                                    />
                                                </View>
                                            )}
                                    </View>
                                </TouchableOpacity>
                                {loggedInUserId !== feed?.posterDetails?._id && (
                                    <TouchableOpacity
                                        style={isFollowing ? styles.followingButton : styles.followButton}
                                        onPress={followUser}>
                                        <Text style={isFollowing ? styles.followingText : styles.followText}>
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <Text style={styles.caption}>{renderCaption()}</Text>
                        <Text style={styles.description}>{feed?.description}</Text>
                        
                        {renderTags()}

                        <View style={styles.actionFooter}>
                            <View style={styles.actionFooterLeft}>
                                <View style={styles.actionButton}>
                                    <TouchableOpacity onPress={handleLikePress}>
                                        <Image
                                            source={isProjectLiked
                                                ? require('../../../assets/postcard/likeFillIcon.png')
                                                : require('../../../assets/postcard/likeIcon.png')}
                                            style={styles.icon}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setShowLikeBottomSheet(true)}>
                                        <Text style={styles.actionText}>{projectLikeCount}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.actionButton}>
                                    <TouchableOpacity onPress={handleCommentPress}>
                                        <Image
                                            source={require('../../../assets/postcard/commentIcon.png')}
                                            style={styles.icon}
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.actionText}>{reduxCommentCount}</Text>
                                </View>
                                <View style={styles.actionButton}>
                                    <TouchableOpacity onPress={handleSavePress}>
                                        <Image
                                            source={isSaved
                                                ? require('../../../assets/postcard/saveFillIcons.png')
                                                : require('../../../assets/postcard/saveIcon.png')}
                                            style={styles.icon2}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.actionButton}>
                                    <TouchableOpacity onPress={() => handleShareProject(feed)}>
                                        <Image
                                            source={require('../../../assets/postcard/sendIcon.png')}
                                            style={styles.icon2}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.feedContainer}>
                        <FeedLayout
                            data={formattedContentUrls}
                            token={token}
                            accountType={feed?.posterDetails?.accountType || ''}
                            currentUserId={loggedInUserId || ''}
                            pageName="projectDetailRewamped"
                            showFAB={false}
                            initialLoading={false}
                            showIcons={false}
                            onItemClick={(item) => handleCardPress(item, item._id - 1)}
                            onDataUpdate={(updatedData) => {
                                // If the data has been updated (like/save status), reflect it in the project
                                const firstItem = updatedData[0];
                                if (firstItem) {
                                    // Update Redux state if like/save status changed
                                    if (firstItem.isLiked !== isProjectLiked) {
                                        dispatch(toggleLikeInPostSlice(feed._id));
                                        dispatch(toggleLikeInLikeSlice(feed._id));
                                    }
                                    if (firstItem.isSaved !== isSaved) {
                                        dispatch(setSaveStatus({ postId: feed._id, isSaved: firstItem.isSaved }));
                                    }
                                }
                            }}
                        />
                    </View>
                    {/* Add padding view to prevent flickering at the bottom */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {menuVisible && (
                    <>
                        <TouchableOpacity
                            style={styles.menuOverlay}
                            activeOpacity={1}
                            onPress={() => setMenuVisible(false)}
                        />
                        <View style={styles.menu}>
                            {loggedInUserId === feed?.posterDetails?._id && (
                                <View style={styles.optionsCard}>
                                    <TouchableOpacity
                                        onPress={() => handleMenuOptionSelect('edit')}
                                        style={styles.optionItem}>
                                        <Text style={styles.optionText}>Edit</Text>
                                        <Image
                                            source={require('../../../assets/icons/editIcon.png')}
                                            style={{ height: 20, width: 20 }}
                                        />
                                    </TouchableOpacity>
                                    <Divider style={styles.divider} />
                                    <TouchableOpacity
                                        onPress={() => handleMenuOptionSelect('delete')}
                                        style={styles.optionItem}>
                                        <Text style={[styles.optionText, styles.deleteText]}>
                                            Delete
                                        </Text>
                                        <Image
                                            source={require('../../../assets/icons/deleteIcon.png')}
                                            style={{ height: 20, width: 20 }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {loggedInUserId !== feed?.posterDetails?._id && (
                                <View style={styles.optionsCard}>
                                    <TouchableOpacity
                                        style={styles.optionItem}
                                        onPress={() => handleMenuOptionSelect('report')}
                                    >
                                        <Text style={[styles.optionText, { color: DANGER_COLOR }]}>Report</Text>
                                        <Image
                                            source={require('../../../assets/rewampedIcon/reportIcon.png')}
                                            style={styles.optionIcon}
                                        />
                                    </TouchableOpacity>
                                    <Divider style={styles.divider} />
                                    <TouchableOpacity
                                        style={styles.optionItem}
                                        onPress={() => handleMenuOptionSelect('share')}
                                    >
                                        <Text style={styles.optionText}>Share to...</Text>
                                        <Image
                                            source={require('../../../assets/rewampedIcon/sendIcon.png')}
                                            style={styles.optionIcon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </>
                )}

                {showLikeBottomSheet && (
                    <LikedUsersModal
                        visible={showLikeBottomSheet}
                        onClose={() => setShowLikeBottomSheet(false)}
                        postId={feed?._id}
                    />
                )}

                {openComments && (
                    <BottomSheet
                        enablePanDownToClose
                        index={2}
                        snapPoints={[500,800]}
                        ref={bottomSheetCommentRef}
                        onClose={() => {
                            setOpenComments(false);
                        }}
                        backgroundStyle={{
                            borderRadius: 22,
                        }}
                        style={{
                            elevation: 10,
                            borderRadius: 22,
                        }}
                        handleIndicatorStyle={{
                            width: 50,
                            backgroundColor: '#CECECE',
                        }}
                        footerComponent={renderFooter}
                    >
                        <BottomSheetView
                            style={{
                                flex: 1,
                                padding: 0,
                                paddingLeft: 0,
                                paddingRight: 0,
                                gap: 0,
                                backgroundColor: 'white',
                            }}>
                            <View style={styles.commentHeader}>
                                <Text style={styles.commentHeaderText}>Comments</Text>
                            </View>

                            <CommentList
                                postId={feed?._id}
                                isLast={false}
                                navigation={navigation}
                                token={token}
                                isProject={true}
                                selfPost={selfPost}
                            />

                        </BottomSheetView>
                    </BottomSheet>
                )}

                <Modal
                    visible={isReportModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsReportModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Report This Project</Text>
                            <View style={styles.optionsContainer}>
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={() => handleReportOptionSelect("I just don't like it")}>
                                    <Text style={styles.modalOptionText}>I just don't like it</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={() => handleReportOptionSelect('Scam, Fraud or spam')}>
                                    <Text style={styles.modalOptionText}>Scam, Fraud, or Spam</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={() => handleReportOptionSelect('False Information')}>
                                    <Text style={styles.modalOptionText}>False Information</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={() => handleReportOptionSelect('Others')}>
                                    <Text style={styles.modalOptionText}>Others</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCancel}
                                onPress={() => setIsReportModalVisible(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <CustomAlertModal
                    visible={deleteMenuVisible}
                    title="Delete Project"
                    description="You can't recover your project afterward. Are you sure you want to delete this project?"
                    buttonOneText="Delete"
                    buttonTwoText="Cancel"
                    onPressButton1={handleConfirmDelete}
                    onPressButton2={() => setDeleteMenuVisible(false)}
                />

                <BottomSheetModal
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    saveToggle={handleSaveToCollection}
                    post={feed}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        marginLeft: 6,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    scrollView: {
        flexGrow: 1,
        paddingBottom: 20,
        paddingTop: 10,
        minHeight: Dimensions.get('window').height * 0.9,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    backButton: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingTop: 10,
        left: -5,
    },
    userDetails: {
        margin: 15,
    },
    detailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    caption: {
        marginTop: 10,
        fontSize: FontSizes.medium,
        fontFamily: FontFamilies.semibold,
        fontWeight: '400',
        color: Color.black,
        lineHeight: 19.71,
    },
    description: {
        marginTop: 5,
        fontSize: FontSizes.small,
        fontFamily: FontFamilies.semibold,
        fontWeight: '400',
        color: Color.primarygrey,
    },
    taggedText: {
        color: Color.black,
        fontFamily: FontFamilies.regular,
        fontSize: FontSizes.small,
        fontWeight: 'bold',
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    avatar: {
        borderRadius: 50,
        height: 45,
        width: 45,
    },
    initialsAvatar: {
        borderRadius: 50,
        height: 45,
        width: 45,
        backgroundColor: Color.black,
        alignItems: 'center',
        justifyContent: 'center',
    },
    initialsText: {
        color: Color.white,
        fontSize: 16,
        fontWeight: '400',
        fontFamily: FontFamilies.regular,
    },
    user: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
    },
    name: {
        color: Color.black,
        fontSize: FontSizes.medium2,
        fontWeight: '800',
        fontFamily: FontFamilies.semibold,
    },
    verifiedBadgeContainer: {
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    verifiedBadge: {
        height: 18,
        width: 18,
    },
    followButton: {
        height: 32,
        width: 90,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E1E1E',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    followText: {
        fontSize: FontSizes.medium,
        fontFamily: FontFamilies.semibold,
        fontWeight: '400',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    followingButton: {
        height: 30,
        width: 95,
        alignItems: 'center',
        backgroundColor: '#EBEBEB',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    followingText: {
        fontSize: FontSizes.medium,
        fontFamily: FontFamilies.semibold,
        fontWeight: '400',
        color: Color.black,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginLeft: -5,
        marginBottom: 20,
    },
    photoContainer: {
        width: (Dimensions.get('window').width - 45) / 2,
        marginBottom: 12,
    },
    photo: {
        width: '100%',
        height: Dimensions.get('window').width * 0.5,
        borderRadius: 12,
    },
    actionFooter: {
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionFooterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    actionButton: {
        alignItems: 'center',
    },
    icon: {
        height: 21,
        width: 21,
    },
    icon2: {
        height: 21,
        width: 21,
        marginBottom: 20,
    },
    actionText: {
        fontSize: FontSizes.small,
        fontWeight: '400',
        color: Color.black,
        marginTop: 5,
        fontFamily: FontFamilies.regular,
    },
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: -10,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 99,
    },
    menu: {
        position: 'absolute',
        right: 20,
        top: Platform.OS == 'ios' ? 125 : 75,
        backgroundColor: '#F3F3F3',
        borderRadius: 8,
        elevation: 5,
        zIndex: 999,
        width: 200,
        alignItems: 'center',
    },
    menuItem: {
        paddingVertical: 15,
        width: '100%',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 13,
        color: '#000',
        fontFamily: FontFamilies.medium,
    },
    reportText: {
        color: '#ED4956',
    },
    deleteText: {
        color: '#ED4956',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        width: '90%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: FontFamilies.semibold,
    },
    optionsContainer: {
        width: '100%',
        marginBottom: 20,
    },
    modalOption: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginVertical: 5,
        width: '100%',
        borderRadius: 8,
        backgroundColor: '#F3F3F3',
        alignItems: 'center',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
        fontFamily: FontFamilies.regular,
    },
    modalCancel: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#fff',
        fontFamily: FontFamilies.semibold,
    },
    bottomSheetContent: {
        flex: 1,
        padding: 0,
        paddingLeft: 0,
        paddingRight: 0,
        gap: 0,
    },
    bottomSheetHeader: {
        justifyContent: 'center',
        flexDirection: 'row',
        borderBottomColor: '#B9B9BB',
        borderBottomWidth: 1,
        paddingBottom: 15,
        marginBottom: 10,
    },
    bottomSheetTitle: {
        color: '#1E1E1E',
        fontSize: 14,
        fontWeight: '400',
    },
    commentHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    commentHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: FontFamilies.bold,
        color: '#000',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#EFEFEF',
        marginHorizontal: 8,
    },
    optionText: {
        fontSize: FontSizes.small,
        fontFamily: FontFamilies.regular,
        color: Color.black,
    },
    optionIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },
    optionsCard: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Color.white,
        borderRadius: 12,
        paddingHorizontal: 5,
        paddingVertical: 8,
        width: 180,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    footerContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: 'white',
        width: '100%',
        // borderTopWidth: 1,
        borderTopColor: '#EFEFEF',

    },
    feedContainer: {
        flex: 1,
        minHeight: 300,
        paddingHorizontal: 6,
    },
    bottomSpacer: {
        height: 50,
    },
    tagsContainer: {
        paddingHorizontal: 5,
        paddingVertical: 16,
        marginBottom: 16,
        width: '100%',
        overflow: 'hidden',
    },
    tagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        width: '100%',
    },
    tagButton: {
        backgroundColor: Color.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    tagText: {
        fontSize: FontSizes.small,
        color: Color.black,
        fontWeight: '400',
        fontFamily: FontFamilies.regular,
        lineHeight: 15,
    },
    moreTagsButton: {
        backgroundColor: Color.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    moreTagsText: {
        fontSize: FontSizes.small,
        color: Color.black,
        fontWeight: '400',
        fontFamily: FontFamilies.regular,
        lineHeight: 15,
    },
});

export default ProjectDetailRewamped;