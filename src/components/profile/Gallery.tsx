import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GalleryImage {
  uri: string;
  type: 'photo' | 'video';
}

interface GalleryProps {
  images: GalleryImage[];
  onSeeAllPress?: () => void;
  userId?: string;
  username?: string;
  isSelf?: boolean;
  profile?: any;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onSeeAllPress, userId, username, isSelf, profile }) => {
  console.log("Gallery images:", images);
  const navigation = useNavigation();
  const handleSeeAll = () => {
    if (onSeeAllPress) onSeeAllPress();
    (navigation as any).navigate('SeeAllGallery', {
      userId,
      username,
      isSelf,
      profile,
      accountType: profile?.accountType,
    });
  };

  const renderItem = ({ item }: { item: GalleryImage }) => (
    <View style={styles.imageContainer}>
      <Image 
        source={{ uri: item.uri }} 
        style={styles.galleryImage}
        resizeMode="cover"
      />
      {item.type === 'video' && (
        <View style={styles.videoIndicator}>
          <Icon name="play-circle-filled" size={32} color="#fff" />
        </View>
      )}
    </View>
  );

  return (
    <View>
      <View style={styles.galleryHeaderRow}>
        <Text style={styles.galleryTitle}>Gallery</Text>
        
          <TouchableOpacity onPress={handleSeeAll}>
            <Text style={styles.seeAllText}>See all </Text>
          </TouchableOpacity>
        
      </View>
      {images.length > 0 ? (
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.emptyText}>No Posts Yet</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  galleryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  galleryTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: Color.black,
  },
  seeAllText: {
    color: Color.black,
    fontSize: 14,
    fontFamily: FontFamilies.regular,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  videoIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
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