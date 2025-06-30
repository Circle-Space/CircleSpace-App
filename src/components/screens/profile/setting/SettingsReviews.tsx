/* eslint-disable no-trailing-spaces */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {Color, FontFamilies} from '../../../../styles/constants';
import {useRatings} from '../../../../context/RatingContext';
import {formatTimeAgo} from '../../../../utils/dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {get} from '../../../../services/dataRequest';
import {getInitials} from '../../../../utils/commonFunctions';

type RootStackParamList = {
  OtherUserProfile: {userId: string};
};

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'OtherUserProfile'
>;

const SettingsReviews = () => {
  const {reviewedReviews, fetchReviewedReviews, loading, deleteReview} =
    useRatings();
  const navigation = useNavigation<NavigationProp>();
  console.log('reviewedReviews settings', reviewedReviews);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReviewedReviews(1);
  }, [fetchReviewedReviews]);

  const handleLoadMore = () => {
    if (!loading && hasMore && reviewedReviews.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviewedReviews(nextPage);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchReviewedReviews(1);
    setRefreshing(false);
  };

  const handleDelete = async (reviewId: string) => {
    try {
      setIsDeleting(true);
      await deleteReview(reviewId);
    } catch (err) {
      console.error('Error deleting review:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUsernamePress = async (uid: string, accountType: string) => {
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
            isSelf: true,
          },
        });
      } else {
        // Check if the profile is personal or professional
        if (accountType === 'professional') {
          // Navigate to business profile screen
          navigation.navigate('otherBusinessScreen', {
            userId: uid,
            isSelf: false,
          });
        } else {
          // Navigate to personal profile screen
          navigation.navigate('otherProfileScreen', {
            userId: uid,
            isSelf: false,
          });
        }
      }
    } catch (error) {
      console.error('Error routing to profile:', error);
    }
  };

  const renderReviewCard = (review: any) => (
    <TouchableOpacity
      key={review._id}
      style={styles.reviewCard}
      onPress={() =>
        handleUsernamePress(review.receiver._id, review.receiver.accountType)
      }>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() =>
              handleUsernamePress(
                review.receiver._id,
                review.receiver.accountType,
              )
            }>
            {review.receiver.profilePic ? (
              <Image
                source={
                  review.receiver.profilePic
                    ? {uri: review.receiver.profilePic}
                    : require('../../../../assets/profile/defaultAvatar.png')
                }
                style={styles.userImage}
              />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>
                  {getInitials(review.receiver.username)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{review.receiver.username}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star, index) => (
                  <Image
                    key={index}
                    source={
                      star <= review.stars
                        ? require('../../../../assets/icons/starFilled.png')
                        : require('../../../../assets/icons/starUnfilled.png')
                    }
                    style={styles.starIcon}
                  />
                ))}
              </View>
              <Text style={styles.timeAgo}>
                {formatTimeAgo(review.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={styles.reviewText} numberOfLines={2}>
        {review.note}
      </Text>
      {review?.note?.length > 100 && <Text style={styles.moreText}>more</Text>}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
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

  if (!reviewedReviews || reviewedReviews.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noReviewsText}>No reviews yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Color.black]}
          />
        }>
        {reviewedReviews.map(review => renderReviewCard(review))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
    fontFamily: FontFamilies.bold,
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
    fontFamily: 'Roboto-Regular',
    color: '#6B7280',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 12,
  },
  deleteIcon: {
    width: 30,
    height: 30,
  },
  reviewText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#1E1E1E',
    lineHeight: 20,
  },
  moreText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
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
    fontFamily: 'Roboto-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#FF4D4F',
    textAlign: 'center',
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
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: Color.white,
    textAlign: 'center',
  },
});

export default SettingsReviews;
