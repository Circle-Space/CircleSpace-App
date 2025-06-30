import React from 'react';
import {View, Text, Image, StyleSheet, Dimensions} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import { Color, FontFamilies, FontSizes } from '../../../styles/constants';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.4; // 40% of screen width
const cardHeight = cardWidth * 0.9; // Maintain aspect ratio

interface ProjectGridProps {
  title: string;
  images: string[];
  onPress: () => void;
  imagecount: string[];
}

const ProjectGridComponent = ({title, images = [], onPress, imagecount = []}: ProjectGridProps) => {
  const displayImages = Array.isArray(imagecount) ? imagecount.slice(0, 3) : [];
  console.log('displayImages :: 19 :: ', imagecount);
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} key={title}>
      <View style={styles.grid}>
        {displayImages.length === 0 ? (
          // No images available
          <View style={styles.noImagesContainer}>
            <Text style={styles.noImagesText}>No images available</Text>
          </View>
        ) : displayImages.length === 1 ? (
          // Single image layout
          <Image
            key={displayImages[0].toString()}
            source={{uri: displayImages[0]}}
            style={[styles.singleImage, styles.image]}
          />
        ) : displayImages.length === 2 ? (
          // Two images layout
          <>
            {displayImages.map((image, index) => (
              <Image
                key={image.toString()}
                source={{uri: image}}
                style={[styles.halfImage, styles.image]}
              />
            ))}
          </>
        ) : (
          // Three images layout
          <>
            <View style={styles.leftSide}>
              <Image
                key={displayImages[0].toString()}
                source={{uri: displayImages[0]}}
                style={[styles.halfWidthFullHeightImage, styles.image]}
              />
            </View>
            <View style={styles.rightSide}>
              {displayImages.slice(1, 3).map((image: string) => (
                <Image
                  key={image.toString()}
                  source={{uri: image}}
                  style={[styles.quarterImage, styles.image]}
                />
              ))}
            </View>
          </>
        )}
      </View>
      {/* <View style={styles.floatTitle}>
        <Text style={styles.title}>{title.trim()}</Text>
      </View> */}
      <View style={styles.bottomInfo}>
      <Text style={styles.title}>{title?.trim() || ''}</Text>
        {/* <Text style={styles.imageCount}>{images.length}</Text> */}
        <Text style={styles.imageCount}>{imagecount.length} Photos</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    marginVertical: 5,
    width: cardWidth,
  },
  grid: {
    width: cardWidth,
    height: cardHeight,
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
  },
  leftSide: {
    flex: 1.4,
    // marginRight: gap/2,
  },
  rightSide: {
    flex: 1,
    // marginLeft: gap/2,
  },
  image: {
    // borderRadius: cardWidth * 0.07,
  },
  singleImage: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 14,
  },
  halfImage: {
    width: (cardWidth) / 2,
    height: cardHeight,
    // borderRadius: 14,
  },
  halfWidthFullHeightImage: {
    width: '100%',
    height: cardHeight,
    // borderRadius: 14,
  },
  quarterImage: {
    width: '100%',
    height: (cardHeight) / 2,
    // borderRadius: 14,
  },
  floatTitle: {
    position: 'absolute',
    top: '33%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 28,
  },
  title: {
    fontSize: FontSizes.small,
    textAlign: 'center',
    fontWeight: '400',
    color: Color.black,
    fontFamily: FontFamilies.semibold,
  },
  bottomInfo: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: cardHeight * 0.05,
    gap: cardWidth * 0.05,
  },
  imageCount: {
    fontSize: FontSizes.extraSmall,
    fontFamily: FontFamilies.medium,
    color: '#4A4A4A',
  },
  noImagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagesText: {
    fontSize: FontSizes.small,
    color: '#4A4A4A',
    textAlign: 'center',
  },
});

export default ProjectGridComponent;
