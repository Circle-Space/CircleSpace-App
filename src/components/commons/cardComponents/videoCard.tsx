import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { Color, FontFamilies, FontSizes, FontWeights } from "../../../styles/constants";
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import Video, { VideoRef } from 'react-native-video';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    Easing 
} from 'react-native-reanimated';

interface VideoCardProps {
    item: {
        _id: string;
        contentUrl: string | string[];
        coverImage?: string;
    };
    onPress?: () => void;
    style?: any;
    isLiked?: boolean;
    isSaved?: boolean;
    onLikePress?: () => void;
    onSavePress?: () => void;
    loading?: boolean;
    enableLongPress?: boolean;
    onLongPress?: () => void;
    autoplay?: boolean;
    likeCount?: number;
    isFollowed?: boolean;
    onFollowPress?: () => void;
    /**
     * If true, show like/save icons. Default: true
     */
    showIcons?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({
    item,
    onPress,
    style,
    isLiked = false,
    isSaved = false,
    onLikePress,
    onSavePress,
    loading = false,
    enableLongPress = false,
    onLongPress,
    autoplay = false,
    showIcons = true
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [duration, setDuration] = useState('0:00');
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const videoRef = useRef<VideoRef>(null);
    const maxRetries = 2;

    // Animation values for skeleton loading
    const shimmerValue = useSharedValue(0);

    // Start the shimmer animation
    useEffect(() => {
        shimmerValue.value = 0;
        shimmerValue.value = withRepeat(
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1, // Infinite repetitions
            false // Don't reverse
        );
    }, []);

    // Create shimmer animation style
    const shimmerAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: shimmerValue.value * 300 - 150, // Adjust based on component width
                },
            ],
        };
    });

    // Cleanup video when component unmounts
    useEffect(() => {
        return () => {
            try {
                if (videoRef.current) {
                    videoRef.current.pause();
                }
            } catch (err) {
                // Silent cleanup error - just ensuring we don't crash on unmount
                console.log('Silent cleanup error in VideoCard');
            }
        };
    }, []);

    // Reset video state when item changes
    useEffect(() => {
        setIsVideoReady(false);
        setError(false);
        setDuration('0:00');
        setRetryCount(0);
        
        // Delay autoplay to allow component to fully mount
        let playTimer: NodeJS.Timeout;
        if (autoplay) {
            playTimer = setTimeout(() => {
                setIsPlaying(true);
            }, 500);
        }
        
        return () => {
            if (playTimer) clearTimeout(playTimer);
        };
    }, [item._id, autoplay]);

    const formatDuration = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        try {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        } catch (error) {
            return '0:00';
        }
    };

    // Get the content URL safely
    const getContentUrl = useMemo(() => {
        if (!item.contentUrl) return '';
        
        // Handle both string and array types
        if (Array.isArray(item.contentUrl)) {
            return item.contentUrl[0] || '';
        }
        
        return item.contentUrl;
    }, [item.contentUrl]);

    const handleVideoLoad = (data: any) => {
        try {
            // Guard against invalid duration data
            const validDuration = data && typeof data.duration === 'number' && !isNaN(data.duration) 
                ? data.duration 
                : 0;
                
            setIsVideoReady(true);
            
            // Only set to play if autoplay is true and not previously errored
            if (autoplay && !error) {
                setIsPlaying(true);
            }
            
            setDuration(formatDuration(validDuration));
            setError(false);
            setRetryCount(0);
        } catch (err) {
            console.error('Error handling video load:', err);
            setError(true);
            setIsPlaying(false);
        }
    };

    const handleVideoError = (err: any) => {
        console.error('Video Error:', err);
        
        // Immediately set error state to use fallback image
        setError(true);
        setIsVideoReady(false);
        setIsPlaying(false);
        
        // If we haven't exceeded max retries, try to reload
        if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            
            // Try to reload after a short delay
            setTimeout(() => {
                try {
                    // Reset error state to try video again
                    setError(false);
                    
                    // Only try to seek if we successfully reset the player
                    if (videoRef.current) {
                        videoRef.current.seek(0);
                        // Don't auto-play on retry to reduce chance of failure
                        setIsPlaying(false);
                    }
                } catch (retryErr) {
                    // If retry also fails, stay in error state
                    console.error('Video retry error:', retryErr);
                    setError(true);
                }
            }, 2000); // Longer delay for retry
        }
    };

    const handleVideoEnd = () => {
        try {
            if (videoRef.current) {
                videoRef.current.seek(0);
                // Keep playing if autoplay is enabled
                setIsPlaying(autoplay);
            }
        } catch (err) {
            console.error('Error handling video end:', err);
            // Don't set error state here, just stop playing
            setIsPlaying(false);
        }
    };

    // Handle video source
    const videoSource = useMemo(() => {
        if (!getContentUrl) return null;
        
        try {
            // Get file extension from URL
            const getFileExtension = (url: string) => {
                try {
                    const extension = url.split('.').pop()?.toLowerCase();
                    return extension || '';
                } catch (err) {
                    return '';
                }
            };

            const extension = getFileExtension(getContentUrl);
            
            // For Android, we need to specify the type based on the file extension
            if (Platform.OS === 'android') {
                const videoTypes: { [key: string]: string } = {
                    'mp4': 'mp4',
                    'm4v': 'm4v',
                    'mov': 'mov',
                    '3gp': '3gp',
                    'mkv': 'mkv',
                    'webm': 'webm',
                    'ts': 'ts',
                    'm3u8': 'hls' // Use 'hls' type for m3u8 files
                };

                return {
                    uri: getContentUrl,
                    type: videoTypes[extension] || 'mp4' // Default to mp4 if extension not recognized
                };
            }

            // For iOS, we don't need to specify the type
            return { uri: getContentUrl };
        } catch (err) {
            console.error('Error creating video source:', err);
            return null;
        }
    }, [getContentUrl]);

    // Get the fallback image source
    const fallbackImageSource = useMemo(() => {
        try {
            // Use coverImage if available, otherwise use the content URL
            const sourceUri = item.coverImage || getContentUrl;
            if (!sourceUri) return { uri: '' }; // Return an empty source instead of null
            
            return {
                uri: sourceUri,
                priority: FastImage.priority.normal,
            };
        } catch (err) {
            console.error('Error creating fallback image source:', err);
            return { uri: '' }; // Return an empty source instead of null
        }
    }, [item.coverImage, getContentUrl]);

    // Render skeleton loading component
    const renderSkeletonLoading = () => (
        <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBackground} />
            <Animated.View style={[styles.shimmerOverlay, shimmerAnimatedStyle]} />
            
            {/* Video icon indicator */}
            <View style={styles.videoIconContainer}>
                <Icon name="play-circle-outline" size={30} color="rgba(255,255,255,0.8)" />
            </View>
        </View>
    );

    return (
        <TouchableOpacity
            style={[styles.card, style]}
            onPress={onPress}
            onLongPress={enableLongPress ? onLongPress : undefined}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                {/* Video Time Pill */}
                <View style={styles.videoTimePill}>
                    <Text style={styles.videoTimeText}>{duration}</Text>
                </View>

                {/* Video Player - Only show if not in error state and source is valid */}
                {!error && videoSource && (
                    <Video
                        ref={videoRef}
                        source={videoSource}
                        style={styles.video}
                        resizeMode="cover"
                        repeat={true}
                        paused={!isPlaying}
                        muted={true}
                        controls={false}
                        onLoad={handleVideoLoad}
                        onError={handleVideoError}
                        onEnd={handleVideoEnd}
                        bufferConfig={{
                            minBufferMs: Platform.OS === 'android' ? 5000 : 15000,
                            maxBufferMs: Platform.OS === 'android' ? 10000 : 50000,
                            bufferForPlaybackMs: Platform.OS === 'android' ? 1000 : 2500,
                            bufferForPlaybackAfterRebufferMs: Platform.OS === 'android' ? 2000 : 5000
                        }}
                        ignoreSilentSwitch="ignore"
                        playInBackground={false}
                        playWhenInactive={false}
                        progressUpdateInterval={1000}
                        useTextureView={Platform.OS === 'android'}
                        maxBitRate={Platform.OS === 'android' ? 2000000 : undefined}
                    />
                )}

                {/* Fallback Image or Skeleton - Show when video is not ready or in error state */}
                {(!isVideoReady || error || !videoSource) && (
                    <>
                        {/* Fallback image if available */}
                        {fallbackImageSource.uri ? (
                            <FastImage
                                style={styles.image}
                                source={fallbackImageSource}
                                resizeMode={FastImage.resizeMode.cover}
                            >
                                {loading && (
                                    <View style={styles.loadingOverlay}>
                                        <ActivityIndicator size="small" color="#1E1E1E" />
                                    </View>
                                )}
                            </FastImage>
                        ) : (
                            // Skeleton loading when no fallback image is available
                            renderSkeletonLoading()
                        )}
                    </>
                )}

                {/* Play Button Overlay for Error State */}
                {error && (
                    <TouchableOpacity 
                        style={styles.playButtonOverlay}
                        onPress={() => {
                            // Try to reset video on manual click
                            setError(false);
                            setRetryCount(0);
                            
                            // Small delay before trying to play again
                            setTimeout(() => {
                                if (videoRef.current) {
                                    try {
                                        videoRef.current.seek(0);
                                        setIsPlaying(true);
                                    } catch (err) {
                                        setError(true);
                                    }
                                }
                            }, 500);
                        }}
                    >
                        <Icon name="play" size={30} color="#fff" />
                    </TouchableOpacity>
                )}

                {/* Actions */}
                {showIcons && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                if (onLikePress) {
                                    onLikePress();
                                }
                            }}
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
                                if (onSavePress) {
                                    onSavePress();
                                }
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
        overflow: 'hidden',
        height: 200,
        borderRadius: 12,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    videoTimePill: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        height: 22,
        paddingHorizontal: 8,
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        top: 10,
        right: 10,
        zIndex: 2,
        borderRadius: 12,
        gap: 4,
    },
    videoTimeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'black',
        fontFamily: FontFamilies.semibold,
    },
    video: {
        width: '100%',
        height: '100%',
        backgroundColor: Color.black,
        borderRadius: 12,
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: Color.white,
        borderRadius: 12,
    },
    playButtonOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1,
    },
    actions: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        right: 1,
        zIndex: 2,
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
    },
    // Skeleton loading styles
    skeletonContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    skeletonBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#E1E9EE',
    },
    shimmerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        transform: [{ translateX: -150 }],
    },
    videoIconContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default VideoCard;