import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import PopularPlaceCard from '../profile/card';
import { Color, FontFamilies } from '../../../styles/constants';

const PostCardLayout = ({
  posts,
  loading,
  hasMorePosts,
  onRefresh,
  loadMorePosts,
  handleCardPress,
  accountType,
  isCarousel,
  onPostUpdated,
  page,
  handleSearchPress,
  setIsFabOpen,
}: any) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [display, setDisplay] = useState('flex');
  const opacity = useRef(new Animated.Value(1)).current;
  
  const handleScroll = useCallback((event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > scrollOffset ? 'down' : 'up';
    setScrollOffset(currentOffset);

    // Close FAB when scrolling if setIsFabOpen is provided
    if (typeof setIsFabOpen === 'function') {
      setIsFabOpen(false);
    }

    // Increase threshold to reduce unnecessary animations
    if (Math.abs(currentOffset - scrollOffset) < 20) return;

    if (direction === 'down' && isVisible) {
      setIsVisible(false);
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setDisplay('none');
      });
    } else if (direction === 'up' && !isVisible) {
      setDisplay('flex');
      setIsVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [scrollOffset, isVisible, opacity, setIsFabOpen]);

  const handlePostUpdate = useCallback(
    (updatedPosts: any[]) => {
      onPostUpdated(updatedPosts); // Notify parent with updated post data
    },
    [onPostUpdated]
  );
  const renderItem = ({item}: any) => {
    return (
      <Pressable
        style={styles.itemContainer}
        onPress={() => handleCardPress(item)}>
        <PopularPlaceCard
          key={`${item._id}-${item.isLiked}-${item.isSaved}`}  // Ensure unique key to force re-render
          id={item?._id}
          url={item?.contentUrl}
          title={item?.caption}
          liked={item?.isLiked}
          likesCount={item?.likes}
          saved={item?.isSaved} // Updated saved prop
          contentType={item?.contentType}
          contentCount={
            item?.contentType == 'project' ? item?.contentUrl.length : 0
          }
          accountType={accountType}
          isCarousel={isCarousel}
          page={page}
          onPostUpdated={handlePostUpdate} 
        />
      </Pressable>
    );
  };

  return (
    <>
      {/* <Animated.View 
        style={[
          styles.searchBarContainer,
          { 
            opacity,
            display: display
          }
        ]}> */}
        {/* <View style={styles.searchInputWrapper}>
          <Image
            source={require('../../../assets/icons/searchIcon.png')}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search..."
            style={styles.searchInput}
            onPress={handleSearchPress}
            placeholderTextColor="#888"
          />
        </View>
      </Animated.View> */}

      <FlashList
        key={posts[0]?._id}
        data={posts}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item: any) => item._id?.toString()}
        numColumns={2}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        estimatedItemSize={224}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        removeClippedSubviews={Platform.OS === 'android'}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        initialNumToRender={4}
        maxToRenderPerBatch={3}
        windowSize={3}
        getItemLayout={(data: any, index: any) => ({
          length: 224,
          offset: 224 * index,
          index,
        })}
        ListFooterComponent={
          loading && hasMorePosts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Color.black} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsText}>No posts available</Text>
            </View>
          )
        }
        contentContainerStyle={styles.postListContainer}
      />
    </>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPostsText: {
    fontSize: 12,
    color: '#888',
    fontFamily: FontFamilies.regular,
  },
  postListContainer: {
    paddingBottom: 50,
    paddingHorizontal:10,
    gap:10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
    marginTop: 10,
    width: '100%',
    gap: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
    maxWidth: '95%',
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#81919E',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default PostCardLayout;
