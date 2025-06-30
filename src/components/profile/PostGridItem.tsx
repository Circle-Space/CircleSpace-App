import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post } from '../../types/Posttype';
import { useDispatch } from 'react-redux';
import { setCurrentPostAuthor } from '../../redux/reducers/chatSlice';
import { createVideoThumbnail } from 'react-native-compressor';
import Video, { VideoRef } from 'react-native-video';

const { width } = Dimensions.get('window');

const ITEM_SIZE = (width - 40) / 2;

interface PostGridItemProps {
  post: Post;
  posts: Post[];
  currentUserId?: string;
  liked?: boolean;
  saved?: boolean;
  onLike?: () => Promise<void>;
  onSave?: (id: string) => void;
}

const PostGridItem = ({ post, posts, currentUserId, liked = false, saved = false, onLike, onSave }: PostGridItemProps) => {
  const navigation = useNavigation<any>();
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [duration, setDuration] = useState('0:00');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<VideoRef>(null);

  // Check if a URL is a video
  const isVideoURL = (url: string | undefined): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Format duration helper
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

  // Handle video load
  const handleVideoLoad = (data: any) => {
    try {
      const validDuration = data && typeof data.duration === 'number' && !isNaN(data.duration) 
        ? data.duration 
        : 0;
      setIsVideoReady(true);
      setDuration(formatDuration(validDuration));
    } catch (err) {
      console.error('Error handling video load:', err);
    }
  };

  // Generate thumbnail for video
  useEffect(() => {
    const generateThumbnail = async () => {
      const imageUrl = getImageUrl();
      if (imageUrl && isVideoURL(imageUrl)) {
        try {
          const thumb = await createVideoThumbnail(imageUrl);
          if (thumb?.path) {
            setThumbnail(thumb.path);
          }
        } catch (error) {
          console.error('Error generating thumbnail:', error);
        }
      }
    };

    generateThumbnail();
  }, [post]);

  // Helper to render icons using local assets
  const renderHeartIcon = () => (
    <TouchableOpacity onPress={onLike} style={styles.iconContainer} activeOpacity={0.7}>
      <Image
        source={
          liked
            ? require('../../assets/profile/profileTabs/heartFilled.png')
            : require('../../assets/profile/profileTabs/heart.png')
        }
        style={styles.icon}
      />
    </TouchableOpacity>
  );

  const renderBookmarkIcon = () => (
    <TouchableOpacity onPress={() => onSave?.(post._id)} style={styles.iconContainer} activeOpacity={0.7}>
      <Image
        source={
          saved
            ? require('../../assets/profile/profileTabs/saveFilled.png')
            : require('../../assets/profile/profileTabs/save.png')
        }
        style={styles.icon}
      />
    </TouchableOpacity>
  );
  const dispatch =useDispatch()
  // Handle post click to navigate to FeedDetailExp
  const handlePress = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const currentIndex = posts.findIndex((p) => p._id === post._id);
    dispatch(setCurrentPostAuthor(post?.posterDetails?.userId || post?.userDetails?.id))
    navigation.navigate('FeedDetailExp', {
      posts: posts,
      currentIndex,
      type: post.contentType || post.type || 'post',
      isSelfProfile: true,
      token,
      pageName: 'profile',
      onFollowUpdate: () => {},
    });
  };

  // Get the image URL - handle both old and new data structures
  const getImageUrl = () => {
    if (post.contentUrl) {
      return Array.isArray(post.contentUrl) ? post.contentUrl[0] : post.contentUrl;
    }
    return post.image || post.imageUrl || '';
  };

  const imageUrl = getImageUrl();
  const isVideo = isVideoURL(imageUrl);

  // Get video source with proper type
  const getVideoSource = () => {
    if (!imageUrl) return undefined;
    
    try {
      const extension = imageUrl.split('.').pop()?.toLowerCase() || '';
      
      if (Platform.OS === 'android') {
        const videoTypes: { [key: string]: string } = {
          'mp4': 'mp4',
          'm4v': 'm4v',
          'mov': 'mov',
          '3gp': '3gp',
          'mkv': 'mkv',
          'webm': 'webm',
          'ts': 'ts',
          'm3u8': 'hls'
        };

        return {
          uri: imageUrl,
          type: videoTypes[extension] || 'mp4'
        } as const;
      }

      return { uri: imageUrl } as const;
    } catch (err) {
      console.error('Error creating video source:', err);
      return undefined;
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.item}>
        {isVideo ? (
          <>
            <Video
              ref={videoRef}
              source={getVideoSource()}
              style={styles.image}
              resizeMode="cover"
              repeat={true}
              paused={true}
              muted={true}
              controls={false}
              onLoad={handleVideoLoad}
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
            {!isVideoReady && (
              <Image source={{ uri: thumbnail || imageUrl }} style={[styles.image, styles.overlayImage]} />
            )}
          </>
        ) : (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        )}
        
        {/* Count overlay - only for projects */}
        {(post.type === 'project' || post.contentType === 'project') && post.count && (
          <View style={styles.countOverlay}>
            <Text style={styles.countText}>{post.count}</Text>
          </View>
        )}
        
        {/* Type overlay (for video) */}
        {(post.type === 'video' || post.contentType === 'video') && (
          <View style={styles.durationOverlay}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        )}
        
        {/* Bottom right icons */}
        <View style={styles.bottomIcons}>
          {renderHeartIcon()}
          {renderBookmarkIcon()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE + 20,
    borderRadius: 18,
    backgroundColor: '#f8f8f8',
    margin: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  overlayImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  countOverlay: {
    position: 'absolute',
    top: 8,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
  },
  typeOverlay: {
    position: 'absolute',
    top: 8,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    padding: 2,
  },
  durationOverlay: {
    position: 'absolute',
    top: 10,
    right: 15,
    backgroundColor: '#FFFFFFBF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  durationText: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '600',
  },
  bottomIcons: {
    position: 'absolute',
    flexDirection: 'row',
    right: 10,
    bottom: 10,
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
});

export default PostGridItem; 