import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from 'react-native';
import { Color, FontFamilies, FontSizes } from '../../styles/constants'; 
const { width } = Dimensions.get('window');

const badgeImage = require('../../assets/profile/businessPage/badges.png');

interface Badge {
  id: string;
  tier: string;
  customers: number;
}

const mockBadges: Badge[] = [
  { id: '1', tier: '100', customers: 10000 },
  { id: '2', tier: 'IRON', customers: 1000 },
  { id: '3', tier: 'IRON', customers: 100 },
  { id: '4', tier: 'IRON', customers: 10 },
];

const CircleSpaceBadges: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CircleSpace Badges</Text>
      <Text style={styles.emptyText}>No Badges Yet</Text>
      {/* <FlatList
        data={mockBadges}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={badgeImage} style={styles.badgeImage} />
            <View style={styles.tierContainer}>
              <Text style={styles.tierText}>{item.tier}</Text>
            </View>
            <Text style={styles.customersText}>{item.customers.toLocaleString()} Customers</Text>
          </View>
        )}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 0,
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
  title: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: Color.black,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 24,
    padding: 18,
    marginLeft: 16,
    marginRight: 4,
    width: width * 0.40,
    height: width * 0.36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  tierContainer: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tierText: {
    backgroundColor: '#222',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FontFamilies.bold,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  customersText: {
    fontSize: 15,
    fontWeight: '600',
    color: Color.black,
    fontFamily: FontFamilies.regular,
    marginTop: 18,
    textAlign: 'center',
  },
});

export default CircleSpaceBadges; 