import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Color, FontFamilies, FontSizes} from '../../../styles/constants';
import {useNavigation} from '@react-navigation/native';
import {get} from '../../../services/dataRequest';
import {useRatings} from '../../../context/RatingContext';
import LatestReviews from './LatestReviews';
import ReviewedReviews from './ReviewedReviews';
import PinnedReviewsVertical from './PinnedReviewsVertical';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontConfig } from 'react-native-paper/lib/typescript/styles/fonts';

type TabType = 'Pinned' | 'Latest' | 'Reviewed';

interface Circle {
  _id: string;
  giver: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePic: string;
    avatar: string;
    accountType: string;
  };
  type: 'positive' | 'negative';
  note: string;
  isVisible: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CircleResponse {
  message: string;
  status: number;
  data: Circle[];
  stats: {
    totalVisible: number;
    positiveCount: number;
    negativeCount: number;
    positivePercentage: number;
  };
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePic: string;
  avatar: string;
  accountType: string;
}

export default function RatingsAndReviewsView({route}: any) {
  const navigation = useNavigation<any>();
  const {
    reviews,
    stats,
    loading,
    error,
    fetchUserReviews,
    fetchReviewedReviews,
    reviewedReviews,
  } = useRatings();
  const [canEdit, setCanEdit] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const cleanedProfile = route.params;
  const profileId = cleanedProfile?.profile?._id;
  console.log('Profile Data:', {
    cleanedProfile,
    profileId,
    hasReviewed
  });
  const [activeTab, setActiveTab] = useState<TabType>(route.params?.initialTab || 'Latest');

  useEffect(() => {
    checkUserPermission();
    if (profileId) {
      fetchUserReviews(profileId);
      fetchReviewedReviews();
    }
  }, [profileId, fetchUserReviews, fetchReviewedReviews]);

  useEffect(() => {
    console.log("fetched reviews ::", reviewedReviews);
    console.log("user ::", user);
    console.log("fetch user reviews ::", fetchUserReviews);
    
    console.log("Checking reviews:", {
      user: user?._id,
      reviewedReviews: reviewedReviews,
      profileId: profileId
    });
    
    if (user && reviewedReviews.length > 0 && profileId) {
      const hasUserReviewed = reviewedReviews.some(
        review => {
          return review?.giver?._id === user._id;
        }
      );
      setHasReviewed(hasUserReviewed);
    }
  }, [user, reviewedReviews, profileId]);

  const checkUserPermission = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      console.log('userData', userData);
      if (userData) {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser!);
        console.log('userid', parsedUser._id);
        console.log('cleanedProfileid', cleanedProfile.profile._id);
        setCanEdit(parsedUser._id === cleanedProfile.profile._id);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  const renderRatingSection = () => {
    const average = stats?.averageStars || 0;
    const totalRatings = stats?.totalVisible || 0;
    const starSize = 18;
    const starStyle = { fontSize: starSize, marginHorizontal: 1 };
  
    return (
      <View style={{width: '100%', alignSelf: 'center', paddingHorizontal: 20}}>
        <View style={styles.ratingSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center',justifyContent: 'center' }}>
              <Text style={styles.ratingNumber}>{average.toFixed(1)}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                {[...Array(5)].map((_, i) => {
                  const starFill = Math.min(Math.max(average - i, 0), 1); // value between 0 and 1
                  return (
                    <View
                      key={i}
                      style={{
                        position: 'relative',
                        width: starSize,
                        height: starSize,
                        marginHorizontal: 1,
                      }}>
                      {/* Background gray star */}
                      <Image
                        source={require('../../../assets/icons/starUnfilledIcon.png')}
                        style={{
                          width: starSize,
                          height: starSize,
                          position: 'absolute',
                        }}
                        resizeMode="contain"
                      />
                      {/* Filled part */}
                      <View
                        style={{
                          width: starSize * starFill,
                          height: starSize,
                          overflow: 'hidden',
                          position: 'absolute',
                        }}>
                        <Image
                          source={require('../../../assets/icons/starFilledIcon.png')}
                          style={{ width: starSize, height: starSize }}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={{ alignItems: 'center',justifyContent: 'center' }}>
              <Text style={styles.ratingNumber}>{totalRatings}</Text>
              <Text style={{ fontSize: FontSizes.medium, fontFamily: FontFamilies.medium, color: '#1E1E1E', marginTop: 4 }}>Ratings</Text>
            </View>
          </View>
        </View>
        {/* Separation border */}
        <View style={{width: '100%', height: 1, backgroundColor: '#EDEDED', marginHorizontal: 0, marginTop: 4 }} />
      </View>
    );
  };
  

  const renderTabs = () => (
    <View style={styles.tabContainerCustom}>
      {(['Pinned', 'Latest', 'Reviewed'] as TabType[]).map((tab, index) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabCustom, activeTab === tab && styles.activeTabCustom]}
          onPress={() => setActiveTab(tab)}>
          <Text style={[styles.tabTextCustom]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderReviewCard = (review: Circle) => (
    <View key={review._id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <Image
            source={
              review.giver.avatar
                ? {uri: review.giver.avatar}
                : require('../../../assets/profile/defaultAvatar.png')
            }
            style={styles.userAvatar}
          />
          <View>
            <Text style={styles.userName}>
              {review.giver.firstName} {review.giver.lastName}
            </Text>
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((star, index) => (
                <Image
                  key={index}
                  source={require('../../../assets/icons/starFilled.png')}
                  style={styles.reviewStarIcon}
                />
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.timeAgo}>{formatDate(review.createdAt)}</Text>
      </View>
      <Text style={styles.reviewText}>
        {review.note.length > 100
          ? `${review.note.substring(0, 100)}... `
          : review.note}
        {review.note.length > 100 && <Text style={styles.moreText}>more</Text>}
      </Text>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Pinned':
        return (
          <PinnedReviewsVertical
            userId={profileId}
            route={cleanedProfile}
          />
        );
      case 'Latest':
        return (
          <LatestReviews
            userId={profileId}
            route={cleanedProfile}
          />
        );
      case 'Reviewed':
        return (
          <ReviewedReviews
            route={cleanedProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderRatingSection()}
        {renderTabs()}
        {renderContent()}
      </ScrollView>
      {!canEdit && cleanedProfile?._id !== user?._id && !hasReviewed && (
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={() => {
            navigation.navigate('AddReview' as never, cleanedProfile as never)
          }}>
          <Text style={styles.addReviewText}>Add review</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-SemiBold',
    color: '#1E1E1E',
  },
  headerRight: {
    width: 24,
  },
  ratingSection: {
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ratingNumber: {
    fontSize: 50,
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    lineHeight: 60,
  },
  ratingRight: {
    alignItems: 'flex-end',
  },
  starContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  starIcon: {
    width: 24,
    height: 24,
  },
  ratingCount: {
    fontSize: 14,
    fontFamily: FontFamilies.bold,
    color: '#81919E',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    height: 46,
  },
  tab: {
    flex: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#000000',
  },
  tabText: {
    fontSize: 15,
    fontFamily: FontFamilies.medium,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: FontFamilies.medium,
  },
  reviewCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    // Shadow for iOS
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    // Shadow for Android
    elevation: 5,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userName: {
    fontSize: 14,
    fontFamily: FontFamilies.semibold,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewStarIcon: {
    width: 12,
    height: 12,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    color: '#81919E',
  },
  reviewText: {
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    color: '#1E1E1E',
    lineHeight: 18,
  },
  moreText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#3897F0',
  },
  addReviewButton: {
    margin: 16,
    height: 46,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addReviewText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#FF0000',
  },
  tabContainerCustom: {
    width: '80%',
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    padding: 10,
    height: 54,
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.04,
    // shadowRadius: 8,
    // elevation: 4,
  },
  tabCustom: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 2,
  },
  activeTabCustom: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  tabTextCustom: {
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.medium,
    color: Color.black,
  },
});
