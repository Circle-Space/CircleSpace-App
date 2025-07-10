import React, { useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import PinIcon from '../../assets/profile/businessPage/pinnedIcon.png';
import { useRatings } from '../../context/RatingContext';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useNavigation } from '@react-navigation/native';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';
import { getInitials } from '../../utils/commonFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width } = Dimensions.get('window');

interface RatingAndReviewsProps {
  userId: string;
  isSelf?: boolean;
  profile?: any;
}

const RatingAndReviews: React.FC<RatingAndReviewsProps> = ({ userId, isSelf, profile }) => {
  const { reviews, stats, loading, error, fetchUserReviews } = useRatings();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (userId) {
      fetchUserReviews(userId);
    }
  }, [userId, fetchUserReviews]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 24 }} size="small" color="#888" />;
  }
  if (error) {
    return <Text style={{ textAlign: 'center', marginTop: 24, color: 'red' }}>{error}</Text>;
  }

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

    const renderReviewText = (note: string | undefined, expanded: boolean, toggleExpand: () => void) => {
      // Ensure note is always a string
      note = typeof note === 'string' ? note : '';
      // Count lines and characters
      const lines = note.split('\n');
      const hasMoreLines = lines.length > 2;
      const cleanNote = note.replace(/\n/g, '');
      const hasMoreChars = cleanNote.length > 60;
      const shouldShowMore = hasMoreLines || hasMoreChars;
  
      // Get display text
      let displayText = note;
      if (!expanded) {
        // Limit to 3 lines
        const limitedLines = lines.slice(0, 2);
        displayText = limitedLines.join('\n');
  
        // If still too long, truncate to 135 chars
        if (cleanNote.length > 60) {
          let charCount = 0;
          let truncatedText = '';
          for (let i = 0; i < displayText.length; i++) {
            if (displayText[i] === '\n') {
              truncatedText += '\n';
            } else if (charCount < 60) {
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

  // Map reviews from context to the UI format
  const mappedReviews = reviews.map(r => ({
    id: r._id,
    name: r.giver?.username || 'Anonymous',
    avatar: r.giver?.profilePic || '',
    rating: r.stars || 5,
    time: r.createdAt,
    text: r.note,
    pinned: r.isPinned,
    giver:r?.giver
  }));

  const threeReviews = mappedReviews.filter(r => r.pinned).slice(0, 3);

  const renderReview = ({ item }: { item: any }) => {
    const showInitials = !item.avatar;
    const initials = getInitials(item.name);

    return (
      <TouchableOpacity onPress={() => handleUsernamePress(item.giver._id,item.giver.accountType)}  style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.avatarContainer}>
            {showInitials ? (
              <View style={[styles.avatar, styles.initialsContainer]}>
                <Text style={styles.initialsText}>{initials}</Text>
              </View>
            ) : (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.starsRow}>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star, index) => (
                  <Image
                    key={index}
                    source={
                      star <= item.rating
                        ? require('../../assets/icons/starFilledIcon.png')
                        : require('../../assets/icons/starUnfilledIcon.png')
                    }
                    style={styles.starIcon}
                  />
                ))}
              </View>
              <Text style={styles.time}>{formatTimeAgo(item?.time)}</Text>
            </View>
          </View>
          {/* <View style={styles.pinIconContainer}>
            {item.pinned && (
              <Image source={PinIcon} style={styles.pinIcon} />
            )}
          </View> */}
        </View>
        <View>
          {renderReviewText(item.text, false, () => {navigation.navigate('RatingsAndReviews', { profile, initialTab: 'Pinned'})})}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
      <TouchableOpacity
                        style={styles.ratingHeader}
                        onPress={() => {
                            navigation.navigate('RatingsAndReviews', {
                                profile: profile,
                            })
                        }}
                    >
                        <Text style={styles.ratingTitle}>Ratings & Reviews</Text>
                        <Image
                            source={require('../../assets/icons/rightarrow.png')}
                            style={styles.arrowIcon}
                        />
                    </TouchableOpacity>
        {!isSelf && (
          <TouchableOpacity style={styles.addReviewBtn} onPress={() => navigation.navigate('AddReview', { profile })}>
            <Text style={styles.addReviewText}>Add a review</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.subTitle}>{stats?.totalVisible || 0} Ratings</Text>
      {mappedReviews.length > 0 ? (
        <FlatList
          data={threeReviews}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={renderReview}
        />
      ) : (
        <Text style={styles.emptyText}>No Reviews Yet</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: Color.black,
    flexShrink: 0,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 16,
},
ratingTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: Color.black,
},
arrowIcon: {
    width: 20,
    height: 20,
},
  arrow: {
    fontSize: 20,
    color: '#888',
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 12,
  },
  addReviewBtn: {
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginLeft: 'auto',
    backgroundColor: '#fff',
  },
  addReviewText: {
    color: '#222',
    fontWeight: '500',
    fontSize: 15,
    fontFamily: FontFamilies.regular,
  },
  subTitle: {
    color: '#888',
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginLeft: 16,
    marginRight: 4,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  initialsContainer: {
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: Color.white,
    fontSize: 16,
    fontFamily: FontFamilies.regular,
  },
  name: {
    fontFamily: FontFamilies.bold,
    fontSize: 16,
    color: Color.black,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 16,
    height: 16,
  },
  moreText: {
    color: Color.primarygrey,
    fontSize: 13,
    fontFamily: FontFamilies.regular,
  },
  time: {
    color: Color.primarygrey,
    fontSize: 13,
    fontFamily: FontFamilies.regular,
    marginLeft: 8,
  },
  pinIconContainer: {
    marginLeft: 8,
    width: 30,
    height: 30,
    backgroundColor: '#F3F3F3',
    borderRadius: 18,
    resizeMode: 'contain',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  reviewText: {
    color: Color.black,
    fontSize: 13,
    fontFamily: FontFamilies.regular,
    marginTop: 2,
  },
  emptyText: {
    fontFamily: FontFamilies.regular,
    fontWeight: '500',
    fontSize: FontSizes.small,
    lineHeight: 13,
    textAlign: 'center',
    color: Color.primarygrey,
    marginTop: 20,
  },
});

export default RatingAndReviews; 