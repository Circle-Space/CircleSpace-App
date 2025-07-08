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
import { Color, FontFamilies, FontSizes } from '../../../styles/constants';
import { useRatings } from '../../../context/RatingContext';
import { formatTimeAgo } from '../../../utils/dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getInitials } from '../../../utils/commonFunctions';

interface LatestReviewsProps {
  userId: string;
  route: any;
}

const LatestReviews = ({ userId, route }: LatestReviewsProps) => {
  console.log("userId latest",userId)
  const [canEdit, setCanEdit] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const { 
    reviews, 
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
        (navigation as any).navigate('BottomBar', {
          screen: 'ProfileScreen',
          params: {
            isSelf: true
          }
        });
      } else {
        // Check if the profile is personal or professional
        if (accountType === 'professional') {
          // Navigate to business profile screen
          (navigation as any).navigate('otherBusinessScreen', {
            userId: uid,
            isSelf: false
          });
        } else {
          // Navigate to personal profile screen
          (navigation as any).navigate('otherProfileScreen', {
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

    // Add a function for rendering review text with more/less logic, matching renderAbout
    const renderReviewText = (note: string | undefined, expanded: boolean, toggleExpand: () => void) => {
      // Ensure note is always a string
      note = typeof note === 'string' ? note : '';
      // Count lines and characters
      const lines = note.split('\n');
      const hasMoreLines = lines.length > 1;
      const cleanNote = note.replace(/\n/g, '');
      const hasMoreChars = cleanNote.length > 90;
      const shouldShowMore = hasMoreLines || hasMoreChars;
  
      // Get display text
      let displayText = note;
      if (!expanded) {
        // Limit to 3 lines
        const limitedLines = lines.slice(0, 1);
        displayText = limitedLines.join('\n');
  
        // If still too long, truncate to 135 chars
        if (cleanNote.length > 90) {
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
        <Text style={styles.reviewText} numberOfLines={expanded ? undefined : 2}>
          {displayText}
          {shouldShowMore && (
            <>
              {!expanded && '... '}
              <Text
                style={styles.moreText}
                onPress={toggleExpand}
              >
                {expanded ? ' less' : 'more'}
              </Text>
            </>
          )}
        </Text>
      );
    };

  const renderReviewCard = (review: any) => (
    console.log("reviewll",review.giver.profilePic),
    <TouchableOpacity key={review._id} style={styles.reviewCard} activeOpacity={1}>
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
            <TouchableOpacity onPress={() => handleUsernamePress(review.giver._id,review.giver.accountType)}>
              <Text style={styles.userName}>
                {`${review.giver.username}`}
              </Text>
            </TouchableOpacity>
            <View style={styles.ratingContainer}>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star, index) => (
                  <Image
                    key={index}
                    source={
                      star <= review.stars
                        ? require('../../../assets/icons/starFilledIcon.png')
                        : require('../../../assets/icons/starUnfilledIcon.png')
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
      <View>
        {renderReviewText(
          review.note,
          expandedReviews.has(review._id),
          () => toggleReviewExpand(review._id)
        )}
      </View>
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
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    color: Color.black,
    lineHeight: 20,
  },
  moreText: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    color: Color.primarygrey,
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