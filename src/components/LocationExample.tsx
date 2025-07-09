import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocations } from '../hooks/useLocations';
import { Location } from '../types/profile';

/**
 * Example component showing how to use the location functionality
 * This demonstrates the key features of the location system
 */
const LocationExample: React.FC = () => {
  const {
    locations,
    locationsLoading,
    locationsError,
    loadLocations,
    searchLocations,
    getLocationDisplayName,
    findLocationById,
    findLocationByCityState
  } = useLocations();

  const handleLocationSelect = (location: Location) => {
    console.log('Selected location:', getLocationDisplayName(location));
    console.log('Location ID:', location._id);
    console.log('City:', location.City);
    console.log('State:', location.State);
  };

  const handleSearchExample = async () => {
    // Example: Search for locations containing "Mumbai"
    const result = await searchLocations('Mumbai');
    if (result) {
      console.log('Found locations:', result.locations.length);
      console.log('Total pages:', result.totalPages);
    }
  };

  const handleLoadMoreExample = async () => {
    // Example: Load more locations
    const result = await loadLocations(2, 10); // Page 2, 10 items per page
    if (result) {
      console.log('Loaded more locations:', result.locations.length);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location System Example</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <Text>Loading: {locationsLoading ? 'Yes' : 'No'}</Text>
        <Text>Error: {locationsError || 'None'}</Text>
        <Text>Total Locations: {locations.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sample Locations</Text>
        {locations.slice(0, 3).map((location) => (
          <Text key={location._id} style={styles.locationItem}>
            {getLocationDisplayName(location)}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usage Examples</Text>
        <Text style={styles.exampleText}>
          • Use useLocations() hook in any component{'\n'}
          • Call loadLocations() to fetch initial data{'\n'}
          • Use searchLocations(query) for search{'\n'}
          • Access locations array for rendering{'\n'}
          • Use getLocationDisplayName() for formatting
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  locationItem: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default LocationExample; 