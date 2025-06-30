import { useContext } from 'react';
import { RatingContext } from '../context/RatingContext';

export const useRatings = () => {
  const context = useContext(RatingContext);
  if (context === undefined) {
    throw new Error('useRatings must be used within a RatingProvider');
  }
  return context;
}; 