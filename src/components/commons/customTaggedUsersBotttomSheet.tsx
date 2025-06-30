import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  PanResponder
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import {getInitials} from '../../utils/commonFunctions';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';

const {height: screenHeight} = Dimensions.get('window');
const DRAG_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.5;

const CustomTaggedUsersBottomSheet = ({
  visible,
  taggedUsers,
  title,
  onTagSelect,
  onClose,
  showLocationModal,
}: any) => {
  // Animation related values
  const translateY = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);
  
  // PanResponder setup for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5; // Small threshold to start capturing
      },
      onPanResponderGrant: () => {
        lastGestureY.current = translateY._value;
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow dragging in both directions with limits
        const newY = lastGestureY.current + gestureState.dy;
        // Only allow downward dragging (positive values)
        if (newY >= 0) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Check for closing threshold or high velocity
        if (gestureState.dy > DRAG_THRESHOLD || gestureState.vy > VELOCITY_THRESHOLD) {
          // Animation to close
          Animated.timing(translateY, {
            toValue: screenHeight,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          // Spring back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  // Reset translateY when modal becomes visible
  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible]);

  const renderItem = ({item}: any) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => onTagSelect(item)}>
      {item?.profilePic ? (
        <Image source={{uri: item.profilePic}} style={styles.profilePic} />
      ) : (
        <View style={styles.initialsAvatar}>
          <Text style={styles.initialsText}>
            {getInitials(item?.username)}
          </Text>
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.businessName
            ? item.businessName
            : `${item.firstName} ${item.lastName}`}
        </Text>
        <Text style={styles.userHandle}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      // Remove onSwipeComplete to avoid conflicts with our PanResponder
      propagateSwipe={false}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
      useNativeDriver
      statusBarTranslucent
      onBackButtonPress={onClose}
    >
      <Animated.View 
        style={[
          styles.modalContent,
          {
            // Fix height to 50% of screen
            height: '50%',
            transform: [{ translateY }]
          }
        ]}
      >
        {/* Add panResponder to the drag area */}
        <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
          <View style={styles.dragRow}>
            <View style={styles.dragIndicator} />
          </View>

          <View style={styles.header}>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        
        <FlatList
          data={taggedUsers}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  dragHandleArea: {
    width: '100%',
    zIndex: 10,
  },
  dragRow: {
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#CECECE',
    borderRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 16,
    color: '#1E1E1E',
    fontWeight: '600',
    fontFamily: FontFamilies.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  scrollViewContent: {
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  initialsAvatar: {
    width: 36,
    height: 36,
    borderRadius: 25,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  initialsText: {
    color: Color.white,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 13,
    fontWeight: '400',
    color: '#1E1E1E',
    fontFamily: FontFamilies.medium,
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 11,
    color: '#B9B9BB',
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
  },
});

export default CustomTaggedUsersBottomSheet;
