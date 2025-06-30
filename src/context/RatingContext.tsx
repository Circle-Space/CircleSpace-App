import React, { createContext, useContext, useState, useCallback } from 'react';
import { get, put, del } from '../services/dataRequest';
import { Review, RatingStats } from '../types/ratings';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RatingContextType {
  reviews: Review[];
  pinnedReviews: Review[];
  reviewedReviews: Review[];
  stats: RatingStats | null;
  loading: boolean;
  error: string | null;
  fetchUserReviews: (userId: string, page?: number, limit?: number) => Promise<void>;
  fetchReviewedReviews: (page?: number, limit?: number) => Promise<void>;
  fetchReviewsGivenByUser: (userId: string, page?: number, limit?: number) => Promise<void>;
  pinReview: (circleId: string) => Promise<void>;
  unpinReview: (circleId: string) => Promise<void>;
  deleteReview: (circleId: string) => Promise<void>;
}

// Create initial context value
const initialContextValue: RatingContextType = {
  reviews: [],
  pinnedReviews: [],
  reviewedReviews: [],
  stats: null,
  loading: false,
  error: null,
  fetchUserReviews: async () => {},
  fetchReviewedReviews: async () => {},
  fetchReviewsGivenByUser: async () => {},
  pinReview: async () => {},
  unpinReview: async () => {},
  deleteReview: async () => {},
};

// Create context with initial value
export const RatingContext = createContext<RatingContextType>(initialContextValue);

// Custom hook to use the rating context
export const useRatings = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRatings must be used within a RatingProvider');
  }
  return context;
};

export const RatingProvider = ({ children }: { children: React.ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pinnedReviews, setPinnedReviews] = useState<Review[]>([]);
  const [reviewedReviews, setReviewedReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserReviews = useCallback(async (userId: string, page = 1, limit = 100) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await get(`circle/user/${userId}`, {
        page,
        limit
      }, "");

      if (response?.status === 200) {
        setReviews(response.data || []);
        setStats(response.stats || null);
        setPinnedReviews(response.data?.filter((review: Review) => review.isPinned) || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReviewedReviews = useCallback(async (page = 1, limit = 100) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await get('circle/given', {
        page,
        limit
      }, token);
      console.log("response reviewed",response);

      if (response?.status === 200) {
        setReviewedReviews(response.data || []);
        
      } else {
        throw new Error(response?.message || 'Failed to fetch reviewed reviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching reviewed reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReviewsGivenByUser = useCallback(async (userId: string, page = 1, limit = 100) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await get(`circle/given/${userId}`, {
        page,
        limit
      }, token);

      if (response?.status === 200) {
        setReviewedReviews(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch reviews given by user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching reviews given by user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const pinReview = useCallback(async (circleId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await put(`circle/${circleId}/pin`, {}, token);
      
      if (response?.status === 200) {
        // Update the reviews list to reflect the pin status
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === circleId 
              ? { ...review, isPinned: true }
              : review
          )
        );
      }
    } catch (err) {
      console.error('Error pinning review:', err);
    }
  }, []);

  const unpinReview = useCallback(async (circleId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await put(`circle/${circleId}/unpin`, {}, token);
      
      if (response?.status === 200) {
        // Update the reviews list to reflect the unpin status
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === circleId 
              ? { ...review, isPinned: false }
              : review
          )
        );
      }
    } catch (err) {
      console.error('Error unpinning review:', err);
    }
  }, []);

  const deleteReview = useCallback(async (circleId: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`https://prodapi.circlespace.in/circle/${circleId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        // Remove the deleted review from the reviewedReviews list
        setReviewedReviews(prevReviews => 
          prevReviews.filter(review => review._id !== circleId)
        );
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting review:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    reviews,
    pinnedReviews,
    reviewedReviews,
    stats,
    loading,
    error,
    fetchUserReviews,
    fetchReviewedReviews,
    fetchReviewsGivenByUser,
    pinReview,
    unpinReview,
    deleteReview
  };

  return (
    <RatingContext.Provider value={value}>
      {children}
    </RatingContext.Provider>
  );
};

export default RatingProvider; 