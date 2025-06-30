import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Color, FontFamilies } from '../../../styles/constants';
import { get, post, put } from '../../../services/dataRequest';
import { useRatings } from '../../../context/RatingContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddReviewView({ navigation, route }: any) {
  const cleanedProfile = route.params;
  const {fetchUserReviews} = useRatings();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiReviewResponse, setApiReviewResponse] = useState(null);

  const handleSubmitReview = async () => {
    if (!rating) {
      Alert.alert('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        type: rating >= 3 ? "positive" : "negative",
        stars: rating,
        note: review.trim() || undefined
      };

      let response;
      if (apiReviewResponse?.hasGivenCircle && apiReviewResponse?.givenCircle?.id) {
        console.log("king 100 ::", reviewData);
        response = await put(`circle/update/${apiReviewResponse.givenCircle.id}`, reviewData);
      } else {
        // Create new review
        response = await post(`circle/give/${route.params.profile?._id}`, reviewData);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      fetchUserReviews(route.params.profile?._id);
      navigation.goBack();

    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(
        'Error',
        'Failed to submit review. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => (
    <View style={styles.ratingSection}>
      <Text style={styles.ratingTitle}>Tap to rate</Text>
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
          >
            <Image
              source={
                star <= rating
                  ? require('../../../assets/icons/starFilled.png')
                  : require('../../../assets/icons/starUnfilled.png')
              }
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getReview = async () => {
    let userId = route.params.profile?._id;
    const getToken = await AsyncStorage.getItem('userToken');
    console.log("getToken ::", getToken);
    const apiReview = await get(`circle/check-relationship/${userId}`, {}, getToken);
    console.log("king 100 ::", apiReview?.data);
    setApiReviewResponse(apiReview?.data);
    
    // Set initial values if user has already given a review
    if (apiReview?.data?.hasGivenCircle && apiReview?.data?.givenCircle) {
      setRating(apiReview.data.givenCircle.stars);
      setReview(apiReview.data.givenCircle.note || '');
    }
  }

  useEffect(() => {
    getReview();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {renderStars()}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Write a review</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Optional"
              placeholderTextColor="#666666"
              multiline
              value={review}
              onChangeText={setReview}
            />
          </View>
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            disabled={isSubmitting}
            onPress={handleSubmitReview}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>{apiReviewResponse?.hasGivenCircle ? "Update" : "Submit"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Add padding to account for the button
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
    width: 40,
    height: 40,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FontFamilies.medium,
    color: '#000000',
  },
  headerRight: {
    width: 40,
  },
  ratingSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 40,
  },
  ratingTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: '#000000',
    marginBottom: 32,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
  },
  starIcon: {
    width: 48,
    height: 48,
  },
  reviewSection: {
    paddingHorizontal: 16,
  },
  reviewTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: '#000000',
    marginBottom: 16,
  },
  reviewInput: {
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    padding: 16,
    height: 160,
    textAlignVertical: 'top',
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: '#000000',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: Platform.OS === 'ios' ? 40 : 35,
  },
  submitButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.black,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#666666',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FontFamilies.medium,
    fontWeight: '600',
  },
}); 