/* eslint-disable prettier/prettier */
import React, {useCallback, useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import PopularPlaceCard from './card';
import ProjectGridCard from './projectGridCard';
import CatalogLayout from './catalogLayout';
import { Color, FontFamilies, FontSizes } from '../../../styles/constants';
import ProjectGrid from './projectGrid';

const ImageGrid = ({
  profile,
  images,
  navigateToSinglePost,
  navigateToProjectDetail,
  navigateToSavedDetail,
  loadMoreImages,
  type,
  handlePostUpdated,
  isSelfProfile = false,
  onCatalogDeleted,
  page,
}: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const handlePostUpdate = useCallback(
    (updatedPosts: any[]) => {
      handlePostUpdated(updatedPosts); // Notify parent with updated post data
    },
    [handlePostUpdated],
  );
  const renderItem = ({item}: any) => {
    console.log('item 33 ::', item?.savedItems);

    return (
      <>
        {type === 'Posts' ? (
          <TouchableOpacity
            key={item?._id}
            style={styles.imageContainer}
            onPress={() => navigateToSinglePost(item)}
            onLoadEnd={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}>
            <PopularPlaceCard
              id={item?._id}
              url={item?.contentUrl}
              title={item?.caption}
              liked={item?.isLiked}
              saved={item?.isSaved}
              contentType={item?.contentType}
             
              page={page}
              onPostUpdated={handlePostUpdate}
            />
          </TouchableOpacity>
        ) : type === 'Catalog' ? (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => {}} // Add a function for catalog
            onLoadEnd={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}>
            <CatalogLayout
              title={item?.title}
              downloadUrl={item?.contentUrl}
              isSelfProfile={isSelfProfile}
              catalogId={item}
              onDeleteSuccess={(deletedId) => onCatalogDeleted?.(deletedId)}
            />
          </TouchableOpacity>
        ) : type === 'Saved' ? (
          <TouchableOpacity
            key={item.id}
            style={styles.imageContainer}
            onPress={() => navigateToSavedDetail(item)}
            onLoadEnd={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}>
            <ProjectGridCard title={item?.name} images={item?.images} imagecount={item?.savedItems} profile={profile} isSelfProfile={isSelfProfile} />
          </TouchableOpacity>
        ) : type === 'Projects' ? (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => navigateToProjectDetail(item)}
            onLoadEnd={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}>
            <ProjectGrid
              title={item?.projectTitle}
              images={item?.contentUrl}
            />
          </TouchableOpacity>
        ) : null}
      </>
    );
  };

  const keyExtractor = (item: any, index: number) => {
    if (type === 'Saved') {
      return item?.id + index; // Use item.id for 'Saved' type
    } else {
      return item._id + index; // Use item._id for other types
    }
  };
  // image change dynamically
  const getImageSource = () => {
    switch (type) {
      case 'Catalog':
        return require('../../.././assets/profile/noimgicon/noCatalogPlaceholder.png');
      case 'Projects':
        return require('../../.././assets/profile/noimgicon/noProjectsPlaceholder.png');
      case 'Saved':
        return require('../../.././assets/profile/noimgicon/noSavedPlaceholder.png');
      default:
        return require('../../.././assets/profile/noimgicon/noPostPlaceholder.png'); // Default image
    }
  };

  return (
    <View style={styles.imageGrid}>
      {images.length === 0 ? (
        // <View style={styles.noPostContainer}>
        //   <Image
        //     style={styles.noPostImage}
        //     source={require('../../.././assets/profile/noPostPlaceholder.png')}
        //   />
        //   <Text style={styles.noPostText}>No {type} added yet</Text>
        // </View>
        <View style={styles.noPostContainer}>
          <Image
            style={styles.noPostImage}
            source={getImageSource()}  // Dynamically get the image source based on the type
          />
          <Text style={styles.noPostText}>No {type} yet</Text>
          {isSelfProfile ? (
          <Text style={styles.createText}> Upload your first {type}</Text>
          ) : null}
          
        </View>
      ) : (
        <FlashList
          data={images}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          onEndReached={loadMoreImages}
          onEndReachedThreshold={0.5}
          estimatedItemSize={224}
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator size="small" color={Color.black}/>
            ) : null
          }
          key={images[0]?._id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageGrid: {
    flex: 1,
    marginLeft: 22,
  },
  imageContainer: {
    width: '90%',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
  },
  noPostsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
    marginTop: 20,
  },
  // no post placeholder
  noPostContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    top:0,
  },
  noPostImage: {
    width: 80,
    height: 80,
  },
  noPostText: {
    fontWeight: '400',
    fontSize: FontSizes.medium,
    color: Color.black,
    marginVertical: 12,
    fontFamily:FontFamilies.semibold,
  },
  createText:{
    fontFamily:FontFamilies.medium,
    fontWeight:'400',
    fontSize:FontSizes.small,
    color:Color.primarygrey,

  },
});

export default ImageGrid;
