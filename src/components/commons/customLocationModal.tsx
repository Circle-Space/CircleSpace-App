import React, {useState, useRef, useEffect} from 'react';
import {
  View,
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
import { Color, FontFamilies, FontSizes } from '../../styles/constants';

const {height: screenHeight} = Dimensions.get('window');
const DRAG_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.5;

interface CustomLocationModalProps {
  visible: boolean;
  location: string;
  onClose: () => void;
}

const CustomLocationModal: React.FC<CustomLocationModalProps> = ({
  visible,
  location,
  onClose,
}) => {
  // Animation related values
  const translateY = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);
  
  // PanResponder setup for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        lastGestureY.current = translateY._value;
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = lastGestureY.current + gestureState.dy;
        if (newY >= 0) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAG_THRESHOLD || gestureState.vy > VELOCITY_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: screenHeight,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
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

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
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
            height: '50%',
            transform: [{ translateY }]
          }
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
          <View style={styles.dragRow}>
            <View style={styles.dragIndicator} />
          </View>

          <View style={styles.header}>
            <Text style={styles.modalTitle}>Location</Text>
          </View>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.locationContainer}>
          <Image
            source={require('../../assets/postcard/Location.png')}
            style={styles.locationIcon}
          />
          <Text style={styles.locationText}>{location}</Text>
        </View>
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  locationIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  locationText: {
    fontSize: 16,
    color: '#1E1E1E',
    fontFamily: FontFamilies.regular,
    flex: 1,
  },
});

export default CustomLocationModal; 