import React, {useCallback, useEffect, useRef, useState} from 'react';
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
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated,
  PanResponder,
  PanResponderGestureState,
  KeyboardAvoidingView,
} from 'react-native';
import {get} from '../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getInitials} from '../../utils/commonFunctions';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;
const DRAG_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.5;

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  username: string;
  profilePic?: string;
}

interface MentionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (users: User[]) => void;
  selectedUsers: User[];
}

const MentionModal = ({visible, onClose, onSelect, selectedUsers}: MentionModalProps) => {
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [selected, setSelected] = useState<User[]>([]);
  const bottom = useRef(new Animated.Value(-MODAL_HEIGHT)).current;
  const dragY = useRef(0);
  
  // Sync selected state with selectedUsers prop when it changes
  useEffect(() => {
    setSelected(selectedUsers || []);
  }, [selectedUsers]);
  
  useEffect(() => {
    if (visible) {
      Animated.timing(bottom, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(bottom, {
        toValue: -MODAL_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);
  
  useEffect(() => {
    fetchToken();
  }, []);
  
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
  
  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        setToken(savedToken);
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
    }
  }, []);
  
  const handleSearch = async (text: string) => {
    console.log("search", text);
    setSearch(text);
    setLoading(true);
    try {
      if (text !== '') {
        const data = await get(
          `search/users?query=${text}&page=1&limit=50`,
          {},
          token,
        );
        
        setFilteredUsers(data.users);
        console.log("filtered users:", data.users);
      } else {
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelect = (user: User) => {
    setSelected(prevSelected => {
      const isAlreadySelected = prevSelected.some(item => item._id === user._id);
      if (isAlreadySelected) {
        return prevSelected.filter(item => item._id !== user._id);
      } else {
        return [...prevSelected, user];
      }
    });
  };
  
  const isSelected = (user: User) => selected.some(item => item._id === user._id);
  
  const getSortedUsers = useCallback(() => {
    const uniqueIds = new Set<string>();
    const result: User[] = [];
    
    // First add selected users
    selected.forEach(user => {
      if (!uniqueIds.has(user._id)) {
        uniqueIds.add(user._id);
        result.push(user);
      }
    });
    
    // Then add filtered users that aren't already selected
    filteredUsers.forEach(user => {
      if (!uniqueIds.has(user._id)) {
        uniqueIds.add(user._id);
        result.push(user);
      }
    });
    
    return result;
  }, [selected, filteredUsers]);
  
  const sortedUsers = getSortedUsers();
  
  const renderItem = ({item, index}: any) => {
    // Remove marginRight for the last item in the row
    const isLastInRow = (index + 1) % 3 === 0;
    return (
      <TouchableOpacity
        style={[styles.userItem, isLastInRow && { marginRight: 0 }]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}>
        <View style={styles.userSquare}>
          {item?.profilePic ? (
            <Image source={{uri: item.profilePic}} style={styles.avatar} />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>
                {getInitials(item?.username)}
              </Text>
            </View>
          )}
          {isSelected(item) && (
            <View style={styles.checkContainer}>
              <Icon name="check" size={14} color="#FFF" />
            </View>
          )}
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {item?.businessName || `${item?.firstName} ${item?.lastName}`}
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            {item.username}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  const handleDone = () => {
    onSelect(selected);
    closeModal();
  };
  
  const closeModal = () => {
    Keyboard.dismiss();
    setSearch('');
    setFilteredUsers([]);
    Animated.timing(bottom, {
      toValue: -MODAL_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => onClose());
  };
  
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
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.contentContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 120}
          >
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Image
                  source={require('../../assets/icons/searchIcon.png')}
                  style={styles.searchIcon}
                />
                <TextInput
                  placeholder="Search for people"
                  placeholderTextColor="#9E9E9E"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={handleSearch}
                />
              </View>
            </View>
            {loading ? (
              <ActivityIndicator style={styles.loader} color="#1E1E1E" />
            ) : (
              <FlatList
                data={sortedUsers}
                renderItem={renderItem}
                keyExtractor={item => item?._id}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                numColumns={3}
                columnWrapperStyle={styles.row}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                scrollEventThrottle={16}
                windowSize={21}
                removeClippedSubviews={Platform.OS === 'ios'}
                maxToRenderPerBatch={12}
                extraData={selected}
              />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>
                  Done {selected.length > 0 ? `(${selected.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    fontSize: FontSizes.medium,
    color: '#1E1E1E',
    fontFamily: FontFamilies.medium,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 90,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  userItem: {
    width: (Dimensions.get('window').width - 64) / 3,
    alignItems: 'center',
    marginRight: 12,
  },
  userSquare: {
    width: (Dimensions.get('window').width - 80) / 3,
    height: (Dimensions.get('window').width - 80) / 3,
    borderRadius: 100,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  initialsAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 20,
    color: Color.white,
    fontFamily: FontFamilies.medium,
  },
  nameContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  name: {
    fontSize: FontSizes.small,
    color: '#1E1E1E',
    fontFamily: FontFamilies.semibold,
    textAlign: 'center',
    marginBottom: 2,
  },
  username: {
    fontSize: FontSizes.extraSmall,
    color: '#9E9E9E',
    fontFamily: FontFamilies.medium,
    textAlign: 'center',
  },
  checkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  doneButton: {
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.semibold,
  },
});

export default MentionModal;