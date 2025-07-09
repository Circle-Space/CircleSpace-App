import { useContext, useCallback } from 'react';
import { ProfileContext } from '../context/ProfileContext';
import { Location, LocationResponse } from '../types/profile';

export const useLocations = () => {
  const context = useContext(ProfileContext);
  
  if (!context) {
    throw new Error('useLocations must be used within a ProfileProvider');
  }

  const {
    locations,
    fetchLocations,
    locationsLoading,
    locationsError,
    locationsCurrentPage,
    hasMoreLocations
  } = context;

  const loadLocations = useCallback(async (
    page: number = 1, 
    limit: number = 5, 
    searchQuery?: string
  ): Promise<LocationResponse | null> => {
    console.log('🔄 Loading locations:', { page, limit, searchQuery });
    // Always call API - no local filtering
    return await fetchLocations(page, limit, searchQuery);
  }, [fetchLocations]);

  const loadMoreLocations = useCallback(async (
    limit: number = 5, 
    searchQuery?: string
  ): Promise<LocationResponse | null> => {
    if (!hasMoreLocations || locationsLoading) {
      console.log('⏸️ Skipping load more - no more locations or already loading');
      return null;
    }
    console.log('📄 Loading more locations:', { nextPage: locationsCurrentPage + 1, limit, searchQuery });
    // Pass the search query to maintain search context when loading more
    return await fetchLocations(locationsCurrentPage + 1, limit, searchQuery);
  }, [fetchLocations, hasMoreLocations, locationsLoading, locationsCurrentPage]);

  const searchLocations = useCallback(async (
    searchQuery: string, 
    limit: number = 5
  ): Promise<LocationResponse | null> => {
    console.log('🔍 Searching locations:', { searchQuery, limit });
    // Always call API with search parameter - don't filter locally
    // Reset to page 1 when searching
    return await fetchLocations(1, limit, searchQuery);
  }, [fetchLocations]);

  const getLocationDisplayName = useCallback((location: Location): string => {
    return `${location.City}, ${location.State}`;
  }, []);

  const findLocationById = useCallback((locationId: string): Location | undefined => {
    return locations.find(location => location._id === locationId);
  }, [locations]);

  const findLocationByCityState = useCallback((city: string, state: string): Location | undefined => {
    return locations.find(location => 
      location.City.toLowerCase() === city.toLowerCase() && 
      location.State.toLowerCase() === state.toLowerCase()
    );
  }, [locations]);

  return {
    // State
    locations,
    locationsLoading,
    locationsError,
    locationsCurrentPage,
    hasMoreLocations,
    
    // Actions
    loadLocations,
    loadMoreLocations,
    searchLocations,
    
    // Utilities
    getLocationDisplayName,
    findLocationById,
    findLocationByCityState
  };
}; 