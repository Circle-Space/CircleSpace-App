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
import { Color } from '../../styles/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonFeedCardProps {
  style?: any;
  contentType?: 'post' | 'video' | 'project';
}

const SkeletonFeedCard: React.FC<SkeletonFeedCardProps> = ({ 
  style,
  contentType = 'post'
}) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
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

  const getShimmerStyle = () => {
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

  return (
    <View style={[styles.skeletonContainer, style]}>
      <View style={styles.mediaContainer}>
        <Animated.View style={[styles.media, getShimmerStyle()]} />
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
      
      <View style={styles.footer}>
        <View style={styles.avatarContainer}>
          <Animated.View style={[styles.avatar, getShimmerStyle()]} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        
        <View style={styles.infoContainer}>
          <Animated.View style={[styles.title, getShimmerStyle()]} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
          
          {contentType === 'project' && (
            <Animated.View style={[styles.subtitle, getShimmerStyle()]} />
          )}
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <Animated.View style={[styles.action, getShimmerStyle()]} />
        <Animated.View style={[styles.action, getShimmerStyle()]} />
        {contentType === 'video' && (
          <Animated.View style={[styles.action, getShimmerStyle()]} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    borderRadius: 12,
    backgroundColor: Color.white,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E1E1E1',
  },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginRight: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E1E1E1',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    height: 14,
    width: '70%',
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    marginBottom: 4,
  },
  subtitle: {
    height: 12,
    width: '40%',
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 10,
    justifyContent: 'flex-start',
  },
  action: {
    height: 18,
    width: 18,
    backgroundColor: '#E1E1E1',
    borderRadius: 9,
    marginRight: 16,
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
});

export default SkeletonFeedCard; 