import React from 'react';
import {View, Text, Image, StyleSheet, Dimensions, } from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import { Color, FontFamilies } from '../../../styles/constants';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.4; // 40% of screen width
const cardHeight = screenWidth * 0.4; // Maintain aspect ratio
const ProjectGrid = ({title, images, onPress}: any) => {
  const getImageStyle = (index: any) => {
    switch (images.length) {
      case 1:
        return styles.singleImage;
      case 2:
        return styles.halfImage;
      case 3:
        return index === 0 ? styles.fullWidthImage : styles.quarterImage;
      case 4:
        return styles.quarterImage;
      default:
        return styles.quarterImage;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} key={title}>
      <View style={styles.grid}>
        {images.map((image: any, index: any) => (
          <Image
            key={image.toString()}
            source={{uri: image}}
            style={[getImageStyle(index), styles.image]}
          />
        ))}
      </View>
      <View style={styles.floatTitle}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title.trim()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal:40,
    marginLeft:2,
    paddingVertical:6,
    backgroundColor: Color.white,
    borderRadius:16,
    elevation: 5, // For Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {
        width: 0, // Horizontal offset
        height: 2, // Vertical offset
    },
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.5, // Blur radius of the shadow
  },
  grid: {
    width: cardWidth,
    height: cardHeight,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    // alignContent:'center',
    marginTop:5,
    alignItems:'center',
    // alignContent: 'space-between',
    gap:12,
  },
  image: {
    borderRadius: 11.71,
},
  singleImage: {
    width: cardWidth*0.9,
    height: cardHeight*0.9,
  },
  halfImage: {
    width: cardWidth*0.95,
    height: cardHeight*0.45,
  },
  fullWidthImage: {
    width: cardWidth*0.97,
    height: cardHeight*0.45,
  },
  quarterImage: {
    width: cardWidth*0.45,
    height: cardHeight*0.45,
  },
  floatTitle: {
    width:cardWidth*0.8,
    height:'auto',
    position: 'absolute',
    top: '40%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    // paddingHorizontal:5,
    borderRadius: 28,
  },
  title: {
    fontSize: 11,
    lineHeight:15,
    paddingHorizontal:10,
    textAlign: 'center',
    fontWeight: '400',
    color: Color.black,
    fontFamily: FontFamilies.semibold,
  },
});

export default ProjectGrid;