import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createVideoThumbnail } from 'react-native-compressor';
import { SavedCollection } from '../../types/profile';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 40) / 2;

interface SavedGridItemProps {
  item: SavedCollection;
  onPress?: () => void;
}

const SavedGridItem = ({ item, onPress }: SavedGridItemProps) => {
  console.log("item :::", item.count);
  const images = item.images || [];
  const imageCount = images.length;
  console.log("imageCount", imageCount);
  const extraCount = item.count && item.count > 3 ? item.count - 3 : 0;
  const [thumbnails, setThumbnails] = useState<{[key: number]: string}>({});

  // Check if a URL is a video
  const isVideoURL = (url: string | undefined): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Generate thumbnails for videos
  useEffect(() => {
    const processThumbnails = async () => {
      const newThumbnails: {[key: number]: string} = {};
      
      for (let i = 0; i < images.length && i < 4; i++) {
        const uri = images[i];
        if (uri && isVideoURL(uri)) {
          try {
            const thumb = await createVideoThumbnail(uri);
            if (thumb?.path) {
              newThumbnails[i] = thumb.path;
            }
          } catch (error) {
            console.log("Failed to create thumbnail for:", uri, error);
          }
        }
      }
      
      if (Object.keys(newThumbnails).length > 0) {
        setThumbnails(newThumbnails);
      }
    };
    
    processThumbnails();
  }, [images]);

  const renderGrid = () => {
    if (imageCount === 1) {
      const uri = images[0];
      const isVideo = isVideoURL(uri);
      const thumbnailUri = thumbnails[0] || uri;
      return (
        <View style={styles.singleImageContainer}>
          <Image source={{ uri: thumbnailUri }} style={styles.singleImage} resizeMode="cover" />
          {isVideo && (
            <View style={styles.videoIndicator}>
              <Icon name="play-circle" size={30} color="#FFFFFF" />
            </View>
          )}
        </View>
      );
    }
    if (imageCount === 2) {
      return (
        <View style={styles.row}>
          <View style={[styles.halfImage, styles.bottomLeftRadius]}>
            <Image source={{ uri: thumbnails[0] || images[0] }} style={styles.halfImage} resizeMode="cover" />
            {isVideoURL(images[0]) && (
              <View style={[styles.videoIndicator, styles.bottomLeftRadius]}>
                <Icon name="play-circle" size={24} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={[styles.halfImage, styles.bottomRightRadius]}>
            <Image source={{ uri: thumbnails[1] || images[1] }} style={styles.halfImage} resizeMode="cover" />
            {isVideoURL(images[1]) && (
              <View style={[styles.videoIndicator, styles.bottomRightRadius]}>
                <Icon name="play-circle" size={24} color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>
      );
    }
    if (imageCount === 3) {
      return (
        <View style={styles.row}>
          <View style={[styles.leftTallImage, styles.bottomLeftRadius]}>
            <Image source={{ uri: thumbnails[0] || images[0] }} style={styles.leftTallImage} resizeMode="cover" />
            {isVideoURL(images[0]) && (
              <View style={[styles.videoIndicator, styles.bottomLeftRadius]}>
                <Icon name="play-circle" size={24} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.rightCol}>
            <View style={styles.rightSmallImage}>
              <Image source={{ uri: thumbnails[1] || images[1] }} style={styles.rightSmallImage} resizeMode="cover" />
              {isVideoURL(images[1]) && (
                <View style={styles.videoIndicator}>
                  <Icon name="play-circle" size={20} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={[styles.rightSmallImage, styles.bottomRightRadius]}>
              <Image source={{ uri: thumbnails[2] || images[2] }} style={styles.rightSmallImage} resizeMode="cover" />
              {isVideoURL(images[2]) && (
                <View style={[styles.videoIndicator, styles.bottomRightRadius]}>
                  <Icon name="play-circle" size={20} color="#FFFFFF" />
                </View>
              )}
            </View>
          </View>
        </View>
      );
    }
    if (imageCount > 3) {
      return (
        <View style={styles.row}>
          <View style={[styles.leftTallImage, styles.bottomLeftRadius]}>
            <Image source={{ uri: thumbnails[0] || images[0] }} style={styles.leftTallImage} resizeMode="cover" />
            {isVideoURL(images[0]) && (
              <View style={[styles.videoIndicator, styles.bottomLeftRadius]}>
                <Icon name="play-circle" size={24} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.rightCol}>
            <View style={styles.rightSmallImage}>
              <Image source={{ uri: thumbnails[1] || images[1] }} style={styles.rightSmallImage} resizeMode="cover" />
              {isVideoURL(images[1]) && (
                <View style={styles.videoIndicator}>
                  <Icon name="play-circle" size={20} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View>
              <View style={[styles.rightSmallImage, styles.bottomRightRadius]}>
                <Image source={{ uri: thumbnails[2] || images[2] }} style={[styles.rightSmallImage, styles.bottomRightRadius]} resizeMode="cover" />
                {isVideoURL(images[2]) && (
                  <View style={[styles.videoIndicator, styles.bottomRightRadius]}>
                    <Icon name="play-circle" size={20} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <View style={[styles.overlay, styles.bottomRightRadius]}>
                <Text style={styles.overlayText}>+{extraCount}</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.item}>
        {renderGrid()}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.count}>{item.count} Images</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    width: ITEM_SIZE,
    borderRadius: 18,
    backgroundColor: '#fff',
    margin: 6,
    overflow: 'hidden',
    alignItems: 'flex-start',
    paddingBottom: 12,
  },
  singleImageContainer: {
    width: '100%',
    height: ITEM_SIZE,
    borderRadius: 18,
    position: 'relative',
  },
  singleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  row: {
    flexDirection: 'row',
  },
  halfImage: {
    width: ITEM_SIZE / 2,
    height: ITEM_SIZE,
  },
  leftTallImage: {
    width: ITEM_SIZE / 2,
    height: ITEM_SIZE,
    borderBottomLeftRadius: 18,
  },
  rightCol: {
    width: ITEM_SIZE / 2,
    height: ITEM_SIZE,
    flexDirection: 'column',
  },
  rightSmallImage: {
    width: ITEM_SIZE / 2,
    height: ITEM_SIZE / 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  bottomLeftRadius: {
    borderBottomLeftRadius: 18,
  },
  bottomRightRadius: {
    borderBottomRightRadius: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginTop: 8,
    marginLeft: 12,
  },
  count: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    marginLeft: 12,
  },
  videoIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default SavedGridItem; 