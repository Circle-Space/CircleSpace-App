import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { Divider } from 'react-native-paper';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../../styles/constants';
import { post } from '../../../../services/dataRequest';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import ProfileOptionModal from '../ProfileOptionModal';
import SharePostToChat from '../../Home/SharePostToChat';
import { handleShareProfile } from '../../jobs/utils/utils';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { updatePostFollowStatus, setFollowCounts, syncFollowStatus } from '../../../../redux/slices/feedSlice';
import { RootState } from '../../../../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInitials } from '../../../../utils/commonFunctions';

interface ProfileData {
    _id: string;
    username: string;
    firstName?: string;
    businessName?: string;
    followersCount: number;
    followingCount: number;
    bio?: string;
    profilePic?: string;
    accountType: string;
    servicesProvided?: string[];
    professionalType?: string;
    isFollowed?: boolean;
}

interface ProfileUserInfoProps {
    profile: ProfileData;
    navigation: any;
    self: boolean;
    setOpenShare?: (value: boolean) => void;
    openShare?: boolean;
}

const BIO_CHARACTER_LIMIT = 105;

const ProfileUserInfo: React.FC<ProfileUserInfoProps> = ({
    profile,
    navigation,
    self,
    setOpenShare,
    openShare = false,
}) => {
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const [isFollowing, setIsFollowing] = useState(profile?.isFollowed ?? false);
    const [followersCount, setFollowersCount] = useState(profile?.followersCount ?? 0);
    const userId = useCurrentUserId();
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const dispatch = useDispatch();
    const feedState = useSelector((state: RootState) => state.feed);

    useEffect(() => {
        if (profile?._id) {
            const isFollowedStatus = feedState.userFollowStatus[profile._id] || false;
            setIsFollowing(isFollowedStatus);
        }
    }, [feedState.userFollowStatus, profile?._id]);

    const displayName = profile?.accountType === 'professional'
        ? profile?.businessName || profile?.firstName || ''
        : profile?.firstName || '';

    const handleFollowUser = async () => {
        try {
            const response = await post(`user/toggle-follow/${profile?._id}`, {});

            if (response.status === 200) {
                const newFollowState = !isFollowing;
                setIsFollowing(newFollowState);
                setFollowersCount(prev => newFollowState ? prev + 1 : prev - 1);

                // Update Redux feed state
                dispatch(updatePostFollowStatus({
                    userId: profile?._id,
                    isFollowed: newFollowState
                }));

                // Sync with other components
                dispatch(syncFollowStatus({
                    userId: profile?._id,
                    isFollowed: newFollowState
                }));

                // Update follow counts
                dispatch(setFollowCounts({
                    followers: followersCount,
                    following: newFollowState ? profile?.followingCount + 1 : profile?.followingCount - 1
                }));
            }
        } catch (error) {
            console.error('[ProfileUserInfo] Error following user:', error);
        }
    };

    const handleShareProfile = () => {
        if (setOpenShare) {
            setOpenShare(true);
        }
    };

    const handleProfileImagePress = () => {
        setShowProfilePopup(true);
    };

    const closeProfilePopup = () => {
        setShowProfilePopup(false);
    };

    const renderBio = () => {
        if (!profile?.bio) {
            console.log('Bio is empty or undefined');
            return null;
        }
        // Count lines and characters
        const lines = profile.bio.split('\n');
        const hasMoreLines = lines.length > 3;
        const cleanBio = profile.bio.replace(/\n/g, '');
        const hasMoreChars = cleanBio.length > 90;
        const shouldShowMore = hasMoreLines || hasMoreChars;

        // Get display text
        let displayText = profile?.bio;
        if (!isBioExpanded) {
            // Limit to 3 lines
            const limitedLines = lines.slice(0, 3);
            displayText = limitedLines.join('\n');

            // If still too long, truncate to 90 chars
            if (cleanBio.length > 90) {
                let charCount = 0;
                let truncatedText = '';
                for (let i = 0; i < displayText.length; i++) {
                    if (displayText[i] === '\n') {
                        truncatedText += '\n';
                    } else if (charCount < 90) {
                        truncatedText += displayText[i];
                        charCount++;
                    }
                }
                displayText = truncatedText;
            }
        }

        return (
            <Text style={styles.bio}>
                {displayText}
                {shouldShowMore && (
                    <>
                        {!isBioExpanded && '... '}
                        <Text
                            style={styles.moreButtonText}
                            onPress={() => setIsBioExpanded(!isBioExpanded)}>
                            {isBioExpanded ? ' less' : 'more'}
                        </Text>
                    </>
                )}
            </Text>
        );
    };

    const renderServices = () => {
        if (!profile?.servicesProvided?.length) return null;

        return (
            <TouchableOpacity
                style={styles.servicesChip}
                onPress={() => navigation.push('ProfessionalDetailRewamped', { profile, self })}>
                <View style={styles.serviceContent}>
                    <Image
                        style={styles.serviceIcon}
                        source={require('../../../../assets/profile/image.png')}
                    />
                    <Text style={styles.serviceText}>
                        {profile.servicesProvided[0]}
                        {profile.servicesProvided.length > 1 && (
                            <Text style={styles.moreServicesText}>
                                {` & ${profile.servicesProvided.length - 1} more`}
                            </Text>
                        )}
                    </Text>
                </View>
                <Image
                    source={require('../../../../assets/profile/arrowRight.png')}
                    style={[
                        styles.accountTypeImage,
                        { position: 'absolute', right: 0 },
                    ]}
                />
            </TouchableOpacity>
        );
    };

    const handleFollowerFollowingPress = (user: any, type: string) => {
        navigation.push('FollowFollowingRewamp', {
            id: user._id,
            tabName: type,
            username: user.username,
            user: user,
            self: false,
        });
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.statsContainer}>
                <TouchableOpacity
                    style={styles.statItem}
                    onPress={() => handleFollowerFollowingPress(profile, 'Followers')}>
                    <Text style={styles.statNumber}>{followersCount}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileImageContainer}
                    onPress={handleProfileImagePress}
                >
                    {profile?.profilePic ? (
                        <Image
                            style={styles.profileImage}
                            source={{ uri: profile.profilePic }}
                        />
                    ) : (
                        <View style={styles.initialsAvatar}>
                            <Text style={styles.initialsText}>
                                {getInitials(profile?.username)}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.statItem}
                    onPress={() => handleFollowerFollowingPress(profile, 'Following')}>
                    <Text style={styles.statNumber}>{profile?.followingCount || 0}</Text>
                    <Text style={styles.statLabel}>Following</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.name}>{displayName}</Text>
                <Divider style={styles.divider} />
                {renderBio()}
                {!self && (
                    <TouchableOpacity
                        style={[
                            styles.followButton,
                            isFollowing ? styles.followingButton : styles.followChip,
                        ]}
                        onPress={handleFollowUser}>
                        <Text
                            style={[
                                styles.followButtonText,
                                isFollowing ? styles.followingText : styles.followText,
                            ]}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                )}

                {profile?.accountType === 'professional' && renderServices()}
            </View>

            {showProfileOptions && (
                <ProfileOptionModal
                    fromPrivateChat={true}
                    visible={showProfileOptions}
                    setVisible={setShowProfileOptions}
                    callBack={(type: string) => {
                        if (type === 'send profile') {
                            handleShareProfile();
                        } else if (type === 'copy profile url') {
                            handleShareProfile();
                        }
                    }}
                    blocked={false}
                />
            )}

            <SharePostToChat
                feed={profile as any}
                openShare={openShare}
                setOpenShare={setOpenShare}
                isProfile={true}
            />

            {/* Profile Picture Popup */}
            <Modal
                visible={showProfilePopup}
                transparent={true}
                animationType="fade"
                onRequestClose={closeProfilePopup}
            >
                <TouchableWithoutFeedback onPress={closeProfilePopup}>
                    <View style={styles.popupOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.popupContent}>
                                {profile?.profilePic ? (
                                    <FastImage
                                        style={styles.popupImage}
                                        source={{ uri: profile.profilePic }}
                                        resizeMode={FastImage.resizeMode.contain}
                                    />
                                ) : (
                                    <View style={styles.popupInitialsContainer}>
                                        <Text style={styles.popupInitialsText}>
                                            {getInitials(profile?.username)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Color.white,
        paddingHorizontal: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginTop: 16,
    },
    statItem: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statNumber: {
        fontFamily: FontFamilies.semibold,
        fontSize: FontSizes.medium2,
        fontWeight: '400',
        color: Color.black,
        paddingBottom: 10,
    },
    statLabel: {
        fontFamily: FontFamilies.medium,
        fontSize: FontSizes.small,
        fontWeight: '400',
        color: Color.black,
    },
    profileImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 50,
        backgroundColor: Color.black,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    initialsAvatar: {
        width: '100%',
        height: '100%',
        backgroundColor: Color.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        color: Color.white,
        fontSize: 20,
        fontWeight: '400',
        fontFamily: FontFamilies.regular,
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: 16,
        width: '100%',
        minHeight: 100,
    },
    name: {
        fontFamily: FontFamilies.semibold,
        fontSize: FontSizes.medium2,
        fontWeight: '800',
        color: Color.black,
        lineHeight: LineHeights.large,
    },
    divider: {
        width: '80%',
        height: 0.5,
        backgroundColor: '#D9D9D9',
        marginTop: 13,
    },
    bio: {
        marginTop: 10,
        marginHorizontal: 10,
        maxWidth: '90%',
        minHeight: 20,
        fontSize: FontSizes.small,
        lineHeight: LineHeights.medium,
        color: Color.black,
        fontWeight: '400',
        textAlign: 'center',
        fontFamily: FontFamilies.medium,
    },
    moreButtonText: {
        fontSize: FontSizes.small,
        fontFamily: FontFamilies.medium,
        color: Color.grey,
    },
    followButton: {
        width: '90%',
        height: 44,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    followChip: {
        backgroundColor: Color.black,
    },
    followingButton: {
        backgroundColor: '#E5E5E5',
    },
    followButtonText: {
        fontFamily: FontFamilies.semibold,
        fontWeight: '800',
        fontSize: FontSizes.medium,
        color: Color.black,
    },
    followText: {
        color: '#fff',
    },
    followingText: {
        color: Color.black,
    },
    servicesChip: {
        marginTop: 12,
        minWidth: '90%',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 15,
        backgroundColor: Color.white,
        paddingHorizontal: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    serviceContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    serviceText: {
        fontFamily: FontFamilies.semibold,
        fontWeight: '800',
        fontSize: FontSizes.medium,
        color: Color.black,
    },
    moreServicesText: {
        color: Color.grey,
        fontSize: FontSizes.small,
        fontWeight: '400',
        fontFamily: FontFamilies.medium,
    },
    arrowIcon: {
        width: 20,
        height: 20,
    },
    accountTypeImage: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    popupOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContent: {
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').width * 0.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupImage: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
    },
    popupInitialsContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: Color.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupInitialsText: {
        color: '#fff',
        fontSize: 80,
        fontWeight: '400',
        fontFamily: FontFamilies.regular,
    },
});

export default ProfileUserInfo;