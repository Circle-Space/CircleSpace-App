import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Project } from '../../types/profile';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2; // 16px padding on each side, 16px gap
const IMAGE_SIZE = (CARD_SIZE - 25) / 2; // 12px gap between images

interface ProjectGridItemProps {
  project: Project;
  onPress: (project: Project) => void;
}

const ProjectGridItem: React.FC<ProjectGridItemProps> = ({ project, onPress }) => {
  console.log("ProjectGridItem project:", project);
  const images = project.contentUrl || [];
  const displayImages = images.slice(0, 4);
  const title = project.projectTitle || '';

  // Helper: insert line break after 2 words
  const formatTitle = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 2) return text;
    return words.slice(0, 2).join(' ') + '\n' + words.slice(2).join(' ');
  };

  const renderImages = () => {
    switch (displayImages.length) {
      case 1:
        return (
          <Image
            source={{ uri: displayImages[0] }}
            style={[styles.gridImage, styles.singleImage]}
            resizeMode="cover"
          />
        );
      case 2:
        return (
          <View style={styles.twoImageContainer}>
            <Image
              source={{ uri: displayImages[0] }}
              style={[styles.gridImage, styles.halfWidthImage]}
              resizeMode="cover"
            />
            <Image
              source={{ uri: displayImages[1] }}
              style={[styles.gridImage, styles.halfWidthImage]}
              resizeMode="cover"
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.threeImageContainer}>
            <Image
              source={{ uri: displayImages[0] }}
              style={[styles.gridImage, styles.halfWidthImage]}
              resizeMode="cover"
            />
            <View style={styles.rightImagesContainer}>
              <Image
                source={{ uri: displayImages[1] }}
                style={[styles.gridImage, styles.quarterImage]}
                resizeMode="cover"
              />
              <Image
                source={{ uri: displayImages[2] }}
                style={[styles.gridImage, styles.quarterImage]}
                resizeMode="cover"
              />
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.gridContainer}>
            {displayImages.map((image, idx) => (
              <Image
                key={idx}
                source={{ uri: image }}
                style={styles.gridImage}
                resizeMode="cover"
              />
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity onPress={() => onPress(project)} activeOpacity={1}>
      <View style={styles.card}>
        {renderImages()}
        <View style={styles.titlePill}>
          <Text style={styles.titleText} numberOfLines={2} ellipsizeMode="tail">{formatTitle(title)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#fff',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: CARD_SIZE - 12,
    height: CARD_SIZE - 12,
    marginTop: 6,
    marginBottom: 6,
  },
  twoImageContainer: {
    flexDirection: 'row',
    width: CARD_SIZE - 12,
    height: CARD_SIZE - 12,
    marginTop: 6,
    marginBottom: 6,
  },
  threeImageContainer: {
    flexDirection: 'row',
    width: CARD_SIZE - 12,
    height: CARD_SIZE - 12,
    marginTop: 6,
    marginBottom: 6,
  },
  rightImagesContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  gridImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    margin: 3,
    backgroundColor: '#eee',
  },
  singleImage: {
    width: CARD_SIZE - 12,
    height: CARD_SIZE - 12,
    margin: 6,
  },
  halfWidthImage: {
    width: (CARD_SIZE - 22) / 2,
    height: (CARD_SIZE - 18),
    margin: 3,
  },
  quarterImage: {
    width: (CARD_SIZE - 24) / 2,
    height: (CARD_SIZE - 24) / 2,
    margin: 3,
  },
  titlePill: {
    position: 'absolute',
    top: '36%',
    alignSelf: 'center',
    width: 150,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 200,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
  },
});

export default ProjectGridItem; 