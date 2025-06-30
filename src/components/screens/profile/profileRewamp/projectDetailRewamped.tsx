import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Alert,
    Platform,
    Modal,
    Dimensions,
} from 'react-native';
import { Divider } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { del, post, get } from '../../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertModal from '../../../commons/customAlert';
import { handleShareProject } from '../../jobs/utils/utils';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import LikesBottomSheet from '../../../commons/customLikeSheet';
import {
    Color,
    FontFamilies,
    FontSizes,
    LetterSpacings,
    LineHeights,
} from '../../../../styles/constants';
import CommentList from '../../Home/CommentList';
import CommentInputCard from '../../Home/CommentInputCard';
import BackButton from '../../../commons/customBackHandler';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike, toggleSave, updatePostState } from '../../../../redux/slices/postSlice';
import { RootState } from '../../../../redux/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

type RootStackParamList = {
    OtherUserProfile: {
        userId: string;
        isSelfProfile: boolean;
        token: string;
    };
    Profile: {
        id: string;
        tab: string;
    };
    UploadProjects: {
        data: any;
    };
    FullScreenImageView: {
        images: string[];
        initialIndex: number;
        type: string;
        projectId: string;
        caption: string;
        userDetails: {
            username: string;
            location: string;
            profilePic: string;
            isLiked: boolean;
            isSaved: boolean;
            likeCount: number;
            commentCount: number;
        };
    };
    FullPostScreen: {
        feed: any;
        selectedIndex: number;
    };
    FullScreenProjectRewamped: {
        items: Array<{
            imageUrl: string;
            userDetails: {
                profilePic?: string;
                id: string;
                name: string;
                username?: string;
                profileImage?: string;
                isLiked?: boolean;
                isSaved?: boolean;
                likeCount?: number;
                commentCount?: number;
                caption?: string;
            };
            caption: string;
        }>;
        initialIndex?: number;
        type?: 'project' | 'post';
        projectId?: string;
        token?: string;
    };
};

type ProjectDetailProps = {
    route: any;
    navigation: NativeStackNavigationProp<RootStackParamList>;
};

const ProjectDetailRewamped = ({ route, navigation }: ProjectDetailProps) => {
    const { feed, accountType, token, pageName } = route.params;
    const postedByUserId = feed?.posterDetails?._id;
    const [selfPost, setSelfPost] = useState(false);
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [showLikeBottomSheet, setShowLikeBottomSheet] = useState(false);
    const [showCommentBottomSheet, setShowCommentBottomSheet] = useState(false);
    const [isFollowing, setIsFollowing] = useState(feed?.posterDetails?.isFollowing || false);
    const bottomSheetLikeRef = useRef<BottomSheet>(null);
    const bottomSheetCommentRef = useRef<BottomSheet>(null);

    const dispatch = useDispatch();
    const postState = useSelector((state: RootState) => 
        feed?._id ? state.posts.posts[feed._id] : null
    );

    const feedURL = feed?.contentUrl ? feed?.contentUrl : feed?.images;
    const formattedContentUrls = feedURL?.map((item: any, index: number) => ({
        _id: index + 1,
        contentUrl: item,
    }));

    useEffect(() => {
        if (feed?._id) {
            dispatch(updatePostState({
                id: feed._id,
                isLiked: feed?.isLiked || false,
                isSaved: feed?.isSaved || false,
                likeCount: feed?.likes || 0,
                commentCount: feed?.commentsCount || 0
            }));
        }
    }, [feed]);

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

    const fetchLatestPost = async (projectId: string | undefined) => {
        if (!projectId) return;
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

    const getUserDetail = async () => {
        const user = await AsyncStorage.getItem('user');
        const userData = JSON.parse(user!);
        setLoggedInUserId(userData?._id);
        setSelfPost(userData?._id === postedByUserId);
    };

    const handleLikePress = async () => {
        console.log('Like pressed in ProjectDetailRewamped');
        console.log('Project ID:', feed?._id);
        console.log('Current like state:', postState?.isLiked);
        console.log('Current like count:', postState?.likeCount);
        
        if (!feed?._id || !postState) {
            console.log('No feed ID or post state available');
            return;
        }
        
        try {
            // Optimistically update UI through Redux
            console.log('Dispatching toggleLike with ID:', feed._id);
            dispatch(toggleLike(feed._id));
            
            const url = `/project/toggle-like/?projectId=${feed._id}`;
            console.log('Making API call to:', url);
            
            const response = await axios.post(url);
            console.log('API Response:', response);
            
            if (!response?.data?.success) {
                console.log('API call failed, reverting state');
                dispatch(toggleLike(feed._id)); // Revert the optimistic update
                return;
            }
            
            console.log('Like toggled successfully');
            console.log('New like state:', !postState.isLiked);
            console.log('New like count:', postState.likeCount);
            
            // Update AsyncStorage if needed
            let storedData;
            if (pageName === 'home') {
                storedData = await AsyncStorage.getItem('initialData');
            } else if (pageName === 'tags') {
                storedData = await AsyncStorage.getItem('tagResultsData');
            }

            if (storedData) {
                const storedPosts = JSON.parse(storedData);
                const updatedPosts = storedPosts.map((post: any) => {
                    if (post._id === feed._id) {
                        return {
                            ...post,
                            isLiked: !postState.isLiked,
                            likes: postState.isLiked ? postState.likeCount - 1 : postState.likeCount + 1
                        };
                    }
                    return post;
                });

                const storageKey = pageName === 'home' ? 'initialData' : 'tagResultsData';
                await AsyncStorage.setItem(storageKey, JSON.stringify(updatedPosts));
                console.log('AsyncStorage updated successfully');
            }
        } catch (error) {
            console.error('Error in handleLikePress:', error);
            dispatch(toggleLike(feed._id)); // Revert the optimistic update
        }
    };

    const handleSavePress = async () => {
        if (!feed?._id) return;

        try {
            dispatch(toggleSave(feed._id));
            const response = await axios.post(`/project/save-project/${feed._id}`);
            
            if (!response?.data?.success) {
                dispatch(toggleSave(feed._id)); // Revert on failure
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            dispatch(toggleSave(feed._id)); // Revert on error
        }
    };

    const handleCardPress = (item: any, selectedIndex: number) => {
        // Create array of items in the format expected by FullScreenProjectRewamped
        const itemsForFullScreen = formattedContentUrls.map((img: { contentUrl: any; }) => ({
            imageUrl: img.contentUrl,
            caption: feed?.caption || '',
            userDetails: {
                username: feed?.posterDetails?.username || '',
                id: feed?.posterDetails?._id || feed?.posterDetails?.id || '',
                name: feed?.posterDetails?.name || '',
                profilePic: feed?.posterDetails?.profilePic,
                isLiked: postState?.isLiked || false,
                isSaved: postState?.isSaved || false,
                likeCount: postState?.likeCount || 0,
                commentCount: postState?.commentCount || 0
            }
        }));

        navigation.navigate('FullScreenProjectRewamped', {
            items: itemsForFullScreen,
            initialIndex: selectedIndex,
            type: 'project',
            projectId: feed._id,
            token: token
        });
    };

    const handleCommentPress = () => {
        navigation.navigate('FullPostScreen', {
            feed: feed,
            selectedIndex: 0
        });
    };

    const handleMenuToggle = () => {
        setMenuVisible(!menuVisible);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#FFF',
            marginLeft: 6,
        },
        scrollView: {
            flexGrow: 1,
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
            fontSize: 14,
            fontWeight: '400',
            color: '#000',
            marginTop: 5,
            fontFamily: FontFamilies.regular,
        },
        photoGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            marginLeft: -5,
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
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
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
                            source={require('../../../../assets/header/moreIcon.png')}
                            style={{ height: 30, width: 30 }}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.userDetails}>
                    <View style={styles.actionFooter}>
                        <View style={styles.actionFooterLeft}>
                            <View style={styles.actionButton}>
                                <TouchableOpacity onPress={handleLikePress}>
                                    <Image
                                        source={postState?.isLiked
                                            ? require('../../../../assets/postcard/likeFillIcon.png')
                                            : require('../../../../assets/postcard/likeIcon.png')}
                                        style={styles.icon}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowLikeBottomSheet(true)}>
                                    <Text style={styles.actionText}>{postState?.likeCount || 0}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.actionButton}>
                                <TouchableOpacity onPress={handleCommentPress}>
                                    <Image
                                        source={require('../../../../assets/postcard/commentIcon.png')}
                                        style={styles.icon}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.actionText}>{postState?.commentCount || 0}</Text>
                            </View>
                            <View style={styles.actionButton}>
                                <TouchableOpacity onPress={handleSavePress}>
                                    <Image
                                        source={postState?.isSaved
                                            ? require('../../../../assets/postcard/saveFillIcons.png')
                                            : require('../../../../assets/postcard/saveIcon.png')}
                                        style={styles.icon2}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.actionButton}>
                                <TouchableOpacity onPress={() => handleShareProject(feed)}>
                                    <Image
                                        source={require('../../../../assets/postcard/sendIcon.png')}
                                        style={styles.icon2}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.photoGrid}>
                    {formattedContentUrls?.map((item: any, index: number) => (
                        <TouchableOpacity
                            key={`${feed._id}-${index}`}
                            style={styles.photoContainer}
                            onPress={() => handleCardPress(item, index)}>
                            <Image source={{ uri: item.contentUrl }} style={styles.photo} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* ... rest of your existing JSX (modals, bottom sheets, etc.) ... */}
        </SafeAreaView>
    );
};

export default ProjectDetailRewamped; 