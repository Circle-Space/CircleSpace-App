import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Color, FontFamilies } from '../../../styles/constants';
import { useRatings } from '../../../context/RatingContext';
import { formatTimeAgo } from '../../../utils/dateUtils';

interface Giver {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePic?: string;
  avatar?: string;
  accountType: string;
}

interface Review {
  _id: string;
  giver: Giver;
  receiver: string;
  type: 'positive' | 'negative';
  note: string;
  isVisible: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  stars?: number;
}

interface Stats {
  rating: number;
  totalRatings: number;
}

interface PinnedReviewsProps {
  userId: string;
  onStatsUpdate?: (stats: any) => void;
}

const PinnedReviews = ({ userId, onStatsUpdate }: PinnedReviewsProps) => {
  const { reviews, stats, loading, error, fetchUserReviews, unpinReview } = useRatings();
  console.log(reviews, 'reviews');

  useEffect(() => {
    if (userId) {
      fetchUserReviews(userId);
    }
  }, [userId, fetchUserReviews]);

  useEffect(() => {
    if (stats && onStatsUpdate) {
      onStatsUpdate(stats);
    }
    console.log(stats, 'stats');
    console.log(reviews, 'reviews');
  }, [stats, onStatsUpdate]);

  // Filter only pinned reviews
  const pinnedReviews = reviews.filter(review => review.isPinned);

  const handleUnpin = async (reviewId: string) => {
    await unpinReview(reviewId);
    // Refresh reviews after unpinning
    fetchUserReviews(userId);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={Color.black} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!pinnedReviews || pinnedReviews.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noReviewsText}>No pinned reviews yet</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {pinnedReviews.map((review) => (
        <View key={review._id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.userInfo}>
              <Image
                source={
                  review.giver.profilePic
                    ? { uri: review.giver.profilePic }
                    : " "
                }
                style={styles.userImage}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {`${review.giver.username}`}
                </Text>
                <View style={styles.ratingContainer}>
                  <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star, index) => (
                      <Image
                        key={index}
                        source={
                          star <= (review.stars || 0)
                            ? require('../../../assets/icons/starFilled.png')
                            : require('../../../assets/icons/starUnfilled.png')
                        }
                        style={styles.starIcon}
                      />
                    ))}
                  </View>
                  <Text style={styles.timeAgo}>{formatTimeAgo(review.createdAt)}</Text>
                </View>
              </View>
            </View>
           
          </View>
          <Text style={styles.reviewText} numberOfLines={2}>
            {review.note}
          </Text>
          {review?.note?.length > 100 && (
            <TouchableOpacity>
              <Text style={styles.moreText}>more</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 20,
  },
  reviewCard: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 15,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: FontFamilies.semibold,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  starIcon: {
    width: 14,
    height: 14,
  },
  timeAgo: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    color: '#6B7280',
  },
  pinButton: {
    padding: 4,
    marginLeft: 12,
  },
  pinIcon: {
    width: 20,
    height: 20,
  },
  reviewText: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    color: '#1E1E1E',
    lineHeight: 20,
  },
  moreText: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    color: '#3897F0',
    marginTop: 4,
  },
  centerContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  noReviewsText: {
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: '#FF4D4F',
    textAlign: 'center',
  },
});

export default PinnedReviews; 