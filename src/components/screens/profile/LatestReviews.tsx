import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Color, FontFamilies } from '../../../styles/constants';
import { useRatings } from '../../../context/RatingContext';
import { formatTimeAgo } from '../../../utils/dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getInitials } from '../../../utils/commonFunctions';

interface LatestReviewsProps {
  userId: string;
  onStatsUpdate?: (stats: any) => void;
  route: any;
}

const LatestReviews = ({ userId, onStatsUpdate, route }: LatestReviewsProps) => {
  console.log("userId latest",userId)
  const [canEdit, setCanEdit] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const { 
    reviews, 
    stats, 
    loading, 
    error, 
    fetchUserReviews,
    pinReview,
    unpinReview,
    deleteReview
  } = useRatings();
  console.log("stats",reviews)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    checkUserPermission();
  }, []);

  const checkUserPermission = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setCurrentUserId(parsedUser._id);
        setCanEdit(parsedUser._id === route.profile._id);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserReviews(userId);
    }
  }, [userId, fetchUserReviews]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchUserReviews(userId);
      }
    }, [userId, fetchUserReviews])
  );

  useEffect(() => {
    if (stats && onStatsUpdate) {
      // Convert percentage to 5-star rating
      const averageRating = stats.positivePercentage ? (stats.positivePercentage / 100) * 5 : 0;
      onStatsUpdate({
        averageRating,
        totalRatings: stats.totalVisible
      });
    }
  }, [stats, onStatsUpdate]);

  const handlePinUnpin = async (review: any) => {
    if (review.isPinned) {
      await unpinReview(review._id);
      // fetchUserReviews(userId);
    } else {
      await pinReview(review._id);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      setIsDeleting(true);
      await deleteReview(reviewId);
      // Refresh reviews after deletion
      fetchUserReviews(route.profile._id);
    } catch (err) {
      console.error('Error deleting review:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUsernamePress = async (uid: string,accountType:string) => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const account_ = await AsyncStorage.getItem('user');
      const currentUser = JSON.parse(account_ || '{}')._id;
      const screen = currentUser !== uid ? 'OtherUserProfile' : 'Profile';
      const account_id = uid;
      
      if (uid === currentUser) {
        // If it's the user's own profile, navigate through BottomBar
        navigation.navigate('BottomBar', {
          screen: 'ProfileScreen',
          params: {
            isSelf: true
          }
        });
      } else {
        // Check if the profile is personal or professional
        if (accountType === 'professional') {
          // Navigate to business profile screen
          navigation.navigate('otherBusinessScreen', {
            userId: uid,
            isSelf: false
          });
        } else {
          // Navigate to personal profile screen
          navigation.navigate('otherProfileScreen', {
            userId: uid,
            isSelf: false
          });
        }
      }
    } catch (error) {
      console.error('Error routing to profile:', error);
    }
  };

  const toggleReviewExpand = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const renderReviewCard = (review: any) => (
    console.log("reviewll",review.giver.profilePic),
    <TouchableOpacity onPress={() => handleUsernamePress(review.giver._id,review.giver.accountType)} key={review._id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          {/* <Image
            source={
              review.giver.profilePic
                ? { uri: review.giver.profilePic }
                : require('../../../assets/profile/defaultAvatar.png')
            }
            style={styles.userImage}
          /> */}
          <TouchableOpacity onPress={() => handleUsernamePress(review.giver._id,review.giver.accountType)}>
          {review.giver.profilePic ? (
            
            <Image
              source={{ uri: review.giver.profilePic }}
              style={styles.userImage}
            />
            
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>
                {getInitials(review.giver.username)}
              </Text>
            </View>
            
          )}
          </TouchableOpacity>
          <View style={styles.userDetails}>
            <View >
              <Text style={styles.userName}>
                {`${review.giver.username}`}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star, index) => (
                  <Image
                    key={index}
                    source={
                      star <= review.stars
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
        <View style={styles.actionButtons}>
          {canEdit && (
            <TouchableOpacity
              onPress={() => handlePinUnpin(review)}
              style={styles.pinButton}
            >
              <Image
                source={
                  review.isPinned
                    ? require('../../../assets/icons/PinIcon.png')
                    : require('../../../assets/icons/PinIconUnfilled.png')
                }
                style={styles.pinIcon}
              />
            </TouchableOpacity>
          )}
          {currentUserId === review.giver._id && (
            <TouchableOpacity
              onPress={() => handleDelete(review._id)}
              style={styles.deleteButton}
              disabled={isDeleting}
            >
              <Image
                source={require('../../../assets/icons/delete.png')}
                style={[
                  styles.deleteIcon,
                  isDeleting && { opacity: 0.5 }
                ]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text 
        style={styles.reviewText} 
        numberOfLines={expandedReviews.has(review._id) ? undefined : 2}
      >
        {review.note}
      </Text>
      {review?.note?.length > 100 && (
        <TouchableOpacity onPress={() => toggleReviewExpand(review._id)}>
          <Text style={styles.moreText}>
            {expandedReviews.has(review._id) ? 'See less' : 'See more'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

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

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noReviewsText}>No reviews yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Section */}
      {stats && (
        <View style={styles.ratingSection}>
          <View style={styles.ratingContent}>
            <View style={styles.ratingScore}>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingNumber}>
                {stats.averageStars?.toFixed(1)}
                </Text>
                <View style={styles.ratingRightSection}>
                  <View style={styles.starContainer}>
                    {[1,2,3,4,5].map((star, index) => (
                      console.log("star",star,stats),
                      <Image 
                        key={index}
                        source={
                          star <= stats.averageStars
                            ? require('../../../assets/icons/starFilled.png')
                            : require('../../../assets/icons/starUnfilled.png')
                        }
                        style={styles.starIcon}
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingCount}>{stats.totalVisible} Ratings</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Reviews List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {reviews.map(review => renderReviewCard(review))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
  },
  ratingSection: {
    marginBottom: 0,
    padding: 16,
  },
  ratingContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  ratingScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  ratingNumber: {
    fontSize: 50,
    fontFamily: FontFamilies.bold,
    fontWeight: "bold",
    color: Color.black,
  },
  ratingRightSection: {
    marginLeft: 12,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  starIcon: {
    width: 16,
    height: 16,
  },
  ratingCount: {
    fontSize: 12,
    fontFamily:FontFamilies.medium,
    color: Color.primarygrey,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  initialsAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFF',
    fontFamily: FontFamilies.medium,
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
  pinButton: {
    padding: 4,
    marginLeft: 12,
  },
  pinIcon: {
    width: 30,
    height: 30,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  addReviewButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Color.black,
    alignItems: 'center',
  },
  addReviewText: {
    fontSize: 16,
    fontFamily: FontFamilies.semibold,
    color: '#FFFFFF',
  },
  timeAgo: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    width: 24,
    height: 24,
  },
});

export default LatestReviews; 