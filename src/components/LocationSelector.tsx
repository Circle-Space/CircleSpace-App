import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocations } from '../hooks/useLocations';
import { Location } from '../types/profile';

interface LocationSelectorProps {
  onLocationSelect?: (location: Location) => void;
  selectedLocation?: Location | null;
  placeholder?: string;
  showSearch?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  selectedLocation,
  placeholder = "Select a location...",
  showSearch = true
}) => {
  const {
    locations,
    locationsLoading,
    locationsError,
    hasMoreLocations,
    loadLocations,
    loadMoreLocations,
    searchLocations,
    getLocationDisplayName
  } = useLocations();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load initial locations
  useEffect(() => {
    loadLocations();
  }, []);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    try {
      if (query.trim()) {
        await searchLocations(query);
      } else {
        await loadLocations();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search locations');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    onLocationSelect?.(location);
  };

  // Handle load more
  const handleLoadMore = async () => {
    if (hasMoreLocations && !locationsLoading) {
      try {
        if (searchQuery.trim()) {
          await loadMoreLocations(5, searchQuery);
        } else {
          await loadMoreLocations();
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load more locations');
      }
    }
  };

  // Render location item
  const renderLocationItem = ({ item }: { item: Location }) => {
    const isSelected = selectedLocation?._id === item._id;
    
    return (
      <TouchableOpacity
        style={[styles.locationItem, isSelected && styles.selectedLocationItem]}
        onPress={() => handleLocationSelect(item)}
      >
        <Text style={[styles.locationText, isSelected && styles.selectedLocationText]}>
          {getLocationDisplayName(item)}
        </Text>
        {isSelected && (
          <Text style={styles.selectedIndicator}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render footer for loading more
  const renderFooter = () => {
    if (!hasMoreLocations) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>No more locations</Text>
        </View>
      );
    }
    
    if (locationsLoading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.footerText}>Loading more...</Text>
        </View>
      );
    }
    
    return null;
  };

  // Render empty state
  const renderEmptyState = () => {
    if (locationsLoading && !isSearching) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyStateText}>Loading locations...</Text>
        </View>
      );
    }
    
    if (locationsError) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>Error: {locationsError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadLocations()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (searchQuery.trim() && locations.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No locations found for "{searchQuery}"</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No locations available</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#007AFF" style={styles.searchLoader} />
          )}
        </View>
      )}
      
      <FlatList
        data={locations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item._id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchLoader: {
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  locationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedLocationItem: {
    backgroundColor: '#E3F2FD',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLocationText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  selectedIndicator: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationSelector; 