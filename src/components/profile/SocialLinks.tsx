import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { FontFamilies, Color, FontSizes } from '../../styles/constants';

interface SocialLinksProps {
  socialMedia?: {
    instagram?: string;
    pinterest?: string;
    facebook?: string;
  };
  website?: string;
}

const socialIcons = [
  {
    id: 'web',
    icon: require('../../assets/profile/businessPage/web.png'),
  },
  {
    id: 'instagram',
    icon: require('../../assets/profile/businessPage/instagram.png'),
  },
  {
    id: 'pinterest',
    icon: require('../../assets/profile/businessPage/pinterest.png'),
  },
  {
    id: 'facebook',
    icon: require('../../assets/profile/businessPage/facebook.png'),
  },
];

const SocialLinks: React.FC<SocialLinksProps> = ({ socialMedia, website }) => {
  console.log("socialMedia", socialMedia);
  console.log("website", website);
  const handlePress = (id: string) => {
    if (id === 'web' && website) {
      const formattedUrl = website.startsWith('http') ? website : `https://${website}`;
      Linking.openURL(formattedUrl);
      return;
    }
    
    if (!socialMedia) return;
    const url = socialMedia[id as keyof typeof socialMedia];
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(formattedUrl);
    }
  };

  const hasLink = (id: string) => {
    if (id === 'web') return !!website;
    return socialMedia && !!socialMedia[id as keyof typeof socialMedia];
  };

  // Filter only the icons that have links
  const availableIcons = socialIcons.filter(item => hasLink(item.id));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social Links</Text>
      {availableIcons.length > 0 ? (
        <FlatList
          data={availableIcons}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => handlePress(item.id)}
              activeOpacity={0.8}
            >
              <Image 
                source={item.icon} 
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>No Social Links Yet</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: Color.black,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 4,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    tintColor: Color.white,
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

export default SocialLinks; 