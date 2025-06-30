import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike } from '../../../redux/slices/likeSlice';
import { ApplicationState } from '../../../redux/store';
import { Color, FontFamilies, FontSizes } from "../../../styles/constants";
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';

interface PostCardProps {
    item: any;
    onPress?: () => void;
    style?: any;
    onSavePress?: (id: string) => void;
    loading?: boolean;
    enableLongPress?: boolean;
    onLongPress?: () => void;
    id?: string;
    onLikePress?: () => Promise<void>;
    isLiked?: boolean;
    isSaved?: boolean;
    likeCount?: number;
    isFollowed?: boolean;
    onFollowPress?: () => Promise<void>;
    /**
     * If true, show like/save icons. Default: true
     */
    showIcons?: boolean;
}

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.44;

const PostCard: React.FC<PostCardProps> = ({
    item,
    onPress,
    style,
    onSavePress,
    loading = false,
    enableLongPress = false,
    onLongPress,
    id,
    onLikePress,
    showIcons = true
}) => {
    const dispatch = useDispatch();
    const isLiked = useSelector((state: ApplicationState) => 
        state.like.likedPosts[item._id] || false
    );
    const likeCount = useSelector((state: ApplicationState) => 
        state.like.likeCounts[item._id] || 0
    );
    const isSaved = useSelector((state: ApplicationState) => 
        state.save.SavedPosts[item._id] || false
    );

    const handleLikePress = async () => {
        if (onLikePress) {
            try {
                await onLikePress();
            } catch (error) {
                console.error('Error toggling like:', error);
            }
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, style]}
            onPress={onPress}
            onLongPress={enableLongPress ? onLongPress : undefined}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                {/* Content Count for projects */}
                {item.contentType === 'project' && item.contentCount > 1 && (
                    <View style={styles.imageCount}>
                        <Text style={styles.imageCountText}>1/{item.contentCount}</Text>
                    </View>
                )}

                {/* Image */}
                <FastImage
                    style={[styles.image]}
                    source={{
                        uri: item.contentUrl || item.coverImage,
                        priority: FastImage.priority.normal,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                >
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="small" color="#1E1E1E" />
                        </View>
                    )}
                </FastImage>

                {/* Actions */}
                {showIcons && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleLikePress}
                            activeOpacity={0.8}
                        >
                            <Icon
                                name={isLiked ? 'heart' : 'heart-outline'}
                                size={14}
                                color={isLiked ? 'red' : '#000'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                console.log('Save pressed for:', id || item._id, 'Current state:', isSaved);
                                onSavePress?.(id || item._id);
                            }}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={
                                    isSaved
                                        ? require('../../../assets/postcard/saveFillIcons.png')
                                        : require('../../../assets/postcard/saveIcon.png')
                                }
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        // overflow: 'hidden',
        width: cardWidth,
        height: 200,
        borderRadius: 12,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    imageCount: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        height: 22,
        width: 38,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: 10,
        right: 10,
        zIndex: 1,
        borderRadius: 16,
    },
    imageCountText: {
        fontFamily: FontFamilies.semibold,
        color: Color.black,
        fontWeight: '400',
        fontSize: FontSizes.small,
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: Color.white,
        borderRadius: 12,
    },
    actions: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        right: 1,
    },
    actionButton: {
        padding: 7,
        margin: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 20,
    },
    icon: {
        height: 14,
        width: 14,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default PostCard;