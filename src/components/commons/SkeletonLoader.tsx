import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  type?: 'post' | 'feed' | 'profile';
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'post', style }) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shimmerValue.value,
            [0, 1],
            [-SCREEN_WIDTH, SCREEN_WIDTH]
          ),
        },
      ],
    };
  });

  const getShimmerStyle = (delay: number) => {
    return useAnimatedStyle(() => {
      return {
        opacity: interpolate(
          shimmerValue.value,
          [0, 0.5, 1],
          [0.3, 0.7, 0.3]
        ),
      };
    });
  };

  const renderPostSkeleton = () => (
    <View style={[styles.skeletonContainer, style]}>
      <View style={styles.skeletonMediaContainer}>
        <Animated.View style={[styles.skeletonMedia, getShimmerStyle(0)]} />
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonUserInfo}>
          <View style={styles.skeletonAvatarContainer}>
            <Animated.View style={[styles.skeletonAvatar, getShimmerStyle(100)]} />
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </View>
          <View style={styles.skeletonTextContainer}>
            <View style={styles.skeletonNameContainer}>
              <Animated.View style={[styles.skeletonName, getShimmerStyle(200)]} />
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
            <View style={styles.skeletonUsernameContainer}>
              <Animated.View style={[styles.skeletonUsername, getShimmerStyle(300)]} />
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
          </View>
        </View>
        <View style={styles.skeletonCaptionContainer}>
          <Animated.View style={[styles.skeletonCaption, getShimmerStyle(400)]} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={styles.skeletonTagsContainer}>
          <Animated.View style={[styles.skeletonTags, getShimmerStyle(500)]} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      </View>
    </View>
  );

  const renderFeedSkeleton = () => (
    <View style={[styles.feedSkeletonContainer, style]}>
      <View style={styles.feedSkeletonItem}>
        <View style={styles.feedSkeletonMediaContainer}>
          <Animated.View style={[styles.feedSkeletonMedia, getShimmerStyle(0)]} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={styles.feedSkeletonContent}>
          <View style={styles.feedSkeletonUserInfo}>
            <View style={styles.feedSkeletonAvatarContainer}>
              <Animated.View style={[styles.feedSkeletonAvatar, getShimmerStyle(100)]} />
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
            <View style={styles.feedSkeletonTextContainer}>
              <Animated.View style={[styles.feedSkeletonText, getShimmerStyle(200)]} />
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderProfileSkeleton = () => (
    <View style={[styles.profileSkeletonContainer, style]}>
      <View style={styles.profileSkeletonHeader}>
        <View style={styles.profileSkeletonAvatarContainer}>
          <Animated.View style={[styles.profileSkeletonAvatar, getShimmerStyle(0)]} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={styles.profileSkeletonInfo}>
          <Animated.View style={[styles.profileSkeletonName, getShimmerStyle(100)]} />
          <Animated.View style={[styles.profileSkeletonBio, getShimmerStyle(200)]} />
          <Animated.View style={[styles.profileSkeletonStats, getShimmerStyle(300)]} />
        </View>
      </View>
      <View style={styles.profileSkeletonContent}>
        <Animated.View style={[styles.profileSkeletonTabs, getShimmerStyle(400)]} />
        <View style={styles.profileSkeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <View key={item} style={styles.profileSkeletonGridItem}>
              <Animated.View style={[styles.profileSkeletonGridContent, getShimmerStyle(item * 100)]} />
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  switch (type) {
    case 'feed':
      return renderFeedSkeleton();
    case 'profile':
      return renderProfileSkeleton();
    default:
      return renderPostSkeleton();
  }
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skeletonMediaContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  skeletonMedia: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E1E1E1',
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonAvatarContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1E1E1',
  },
  skeletonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  skeletonNameContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
  },
  skeletonName: {
    width: '60%',
    height: 16,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  skeletonUsernameContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  skeletonUsername: {
    width: '40%',
    height: 14,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  skeletonCaptionContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  skeletonCaption: {
    width: '100%',
    height: 60,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  skeletonTagsContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  skeletonTags: {
    width: '80%',
    height: 24,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  // Feed Skeleton Styles
  feedSkeletonContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  feedSkeletonItem: {
    marginBottom: 16,
  },
  feedSkeletonMediaContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  feedSkeletonMedia: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E1E1E1',
  },
  feedSkeletonContent: {
    padding: 12,
  },
  feedSkeletonUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedSkeletonAvatarContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  feedSkeletonAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E1E1E1',
  },
  feedSkeletonTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  feedSkeletonText: {
    width: '40%',
    height: 14,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  // Profile Skeleton Styles
  profileSkeletonContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileSkeletonHeader: {
    padding: 16,
    alignItems: 'center',
  },
  profileSkeletonAvatarContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  profileSkeletonAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E1E1E1',
  },
  profileSkeletonInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileSkeletonName: {
    width: '40%',
    height: 20,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    marginBottom: 8,
  },
  profileSkeletonBio: {
    width: '80%',
    height: 16,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    marginBottom: 12,
  },
  profileSkeletonStats: {
    width: '60%',
    height: 16,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  profileSkeletonContent: {
    flex: 1,
  },
  profileSkeletonTabs: {
    width: '100%',
    height: 40,
    backgroundColor: '#E1E1E1',
    marginBottom: 16,
  },
  profileSkeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  profileSkeletonGridItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  profileSkeletonGridContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
});

export default SkeletonLoader; 