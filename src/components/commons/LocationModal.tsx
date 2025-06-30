import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  PanResponderGestureState,
  ListRenderItemInfo,
} from 'react-native';
import cityData from '../datasets/citydata';
import { FontFamilies, FontSizes } from '../../styles/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;
const DRAG_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.5;
const ITEM_HEIGHT = 72; // Approximate height of each item including padding

interface Location {
  City: string;
  State: string;
  [key: string]: any;
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
}

const LocationModal = ({ visible, onClose, onSelect }: LocationModalProps) => {
  const [search, setSearch] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(cityData);

  const bottom = useRef(new Animated.Value(-MODAL_HEIGHT)).current;
  const dragY = useRef(0);
  const flatListRef = useRef<FlatList<Location>>(null);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(bottom, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // Focus the search input after the animation completes
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      });
    } else {
      Animated.timing(bottom, {
        toValue: -MODAL_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  const handleGestureMove = (gestureState: PanResponderGestureState) => {
    // Calculate new bottom value (negative values move modal down)
    const newBottom = Math.min(0, dragY.current - gestureState.dy);
    bottom.setValue(newBottom);
  };

  const handleGestureRelease = (gestureState: PanResponderGestureState) => {
    const currentBottom = dragY.current - gestureState.dy;
    
    // Check if we should close the modal (dragged down enough or with enough velocity)
    const shouldClose = 
      currentBottom < -DRAG_THRESHOLD || 
      gestureState.vy > VELOCITY_THRESHOLD;

    if (shouldClose) {
      closeModal();
    } else {
      // Return to fully open position
      Animated.timing(bottom, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        // Use a TypeScript-friendly way to get the current value
        let currentValue = 0;
        bottom.addListener(({ value }) => {
          currentValue = value;
        });
        dragY.current = currentValue;
      },
      onPanResponderMove: (_, gestureState) => handleGestureMove(gestureState),
      onPanResponderRelease: (_, gestureState) => handleGestureRelease(gestureState),
      onPanResponderTerminate: (_, gestureState) => handleGestureRelease(gestureState),
    })
  ).current;

  const handleSearch = (text: string) => {
    setSearch(text);
    const lowerText = text.toLowerCase();
    setFilteredLocations(
      cityData.filter(
        loc =>
          loc.City.toLowerCase().includes(lowerText) ||
          loc.State.toLowerCase().includes(lowerText)
      )
    );
  };

  const closeModal = () => {
    Keyboard.dismiss();
    setSearch('');
    setFilteredLocations(cityData);
    Animated.timing(bottom, {
      toValue: -MODAL_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => onClose());
  };

  const handleSelect = (item: Location) => {
    onSelect(item);
    closeModal();
  };

  const getItemLayout = useCallback((data: ArrayLike<Location> | null | undefined, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Location>) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.locationInfo}>
        <Image source={require('../../assets/ugcs/location.png')} style={styles.locationIcon} />
        <Text style={styles.locationName} numberOfLines={2}>
          {item.City}, {item.State}
        </Text>
      </View>
    </TouchableOpacity>
  ), []);

  const keyExtractor = useCallback((item: Location) => `${item.City}-${item.State}`, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFillObject}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.modalContent, { bottom }]}>
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          
          <View style={styles.contentContainer}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Image
                  source={require('../../assets/icons/searchIcon.png')}
                  style={styles.searchIcon}
                />
                <TextInput
                  ref={searchInputRef}
                  placeholder="Search for location"
                  placeholderTextColor="#9E9E9E"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={handleSearch}
                />
              </View>
            </View>
            <FlatList
              ref={flatListRef}
              data={filteredLocations}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              removeClippedSubviews={false}
              maxToRenderPerBatch={5}
              windowSize={5}
              initialNumToRender={10}
              updateCellsBatchingPeriod={100}
              getItemLayout={getItemLayout}
              scrollEventThrottle={32}
              bounces={true}
              decelerationRate="normal"
              contentContainerStyle={styles.listContent}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#CCC',
    borderRadius: 3,
  },
  searchContainer: {
    padding: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#9E9E9E',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E1E1E',
    fontFamily: FontFamilies.medium,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    height: ITEM_HEIGHT,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  locationName: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: FontSizes.medium,
    color: '#1E1E1E',
    fontFamily: FontFamilies.semibold,
  },
  contentContainer: {
    flex: 1,
  },
});

export default LocationModal;
