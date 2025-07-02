import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
  Modal,
  Pressable,
  Button,
  Dimensions,
  TouchableOpacity,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get} from '../../services/dataRequest';
import {useIsFocused, useRoute} from '@react-navigation/native';
import EventCard from './events/EventCard';
import Icon from 'react-native-vector-icons/Ionicons';
import {subDays, subMonths, addDays, addMonths} from 'date-fns';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';
import { ScaledSheet, scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';
import GetStartedModal from '../commons/getStartedModal';
import { useBottomBarScroll } from '../../hooks/useBottomBarScroll';

const Events = ({navigation}) => {
  const route = useRoute();
  const isFocused = useIsFocused();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('-1');
  const [accountType, setAccountType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { handleScroll: handleBottomBarScroll } = useBottomBarScroll();
  const selectedCity = route?.params?.selectedCity || null;
  const selectedDate = route?.params?.selectedDate || null;

  // const { width, height } = Dimensions.get('window');
  const width = Dimensions.get('window');
  const height = Dimensions.get('window');
  const isSmallDevice = width < 360; // Detect small screens
  const numColumns = width < 400 ? 1 : 2;

  const calculateDateRange = filter => {
    const currentDate = new Date();
    let endDate;

    switch (filter) {
      case 'next_week':
        endDate = addDays(currentDate, 7);
        break;
      case 'next_15_days':
        endDate = addDays(currentDate, 15);
        break;
      case 'next_month':
        endDate = addMonths(currentDate, 1);
        break;
      case 'next_3_months':
        endDate = addMonths(currentDate, 3);
        break;
      default:
        return {currentDate: null, endDate: null}; // No filter applied
    }

    return {currentDate, endDate};
  };

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const accountType_ = await AsyncStorage.getItem('accountType');
      setToken(savedToken || 'No token found');
      setAccountType(accountType_!);
    } catch (error) {
      console.error('Failed to fetch token:', error);
    }
  }, []);

  const fetchEvents = async (page = 1, month = selectedMonth) => {
    if (!token) return;

    try {
      const limit = 100;
      const data = await get(
        `events/get-events?page=${page}&limit=${limit}&month=${month}`,
        {},
        token,
      );
      if (data && data.events) {
        const newEvents = page === 1 ? data.events : [...events, ...data.events];
        setEvents(newEvents);
        // Initialize filteredEvents with all events
        setFilteredEvents(newEvents);
      } else if (page === 1) {
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (error) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchToken();
    setSelectedMonth('-1');
  }, [fetchToken]);

  useEffect(() => {
    if (isFocused) {
      fetchEvents(1);
      setSearchQuery('');
    }
  }, [token, isFocused]);
  useEffect(() => {
    if (!Array.isArray(events)) return;
  
    let filtered = [...events];
  
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      console.log("Search Query:", query);
      console.log("Total Events:", events.length);
      
      filtered = filtered.filter(event => {
        if (!event) return false;
        
        const eventTitle = String(event.eventName || '').toLowerCase();
        const eventCity = String(event.city || '').toLowerCase();
        
        const matches = eventTitle.includes(query) || eventCity.includes(query);
        return matches;
      });
      
      console.log("Filtered Events:", filtered.length);
    }
  
    // Check for selected city
    if (selectedCity?.City) {
      const selectedCityName = selectedCity.City.toLowerCase().trim();
      filtered = filtered.filter(event => {
        if (!event?.city) return false;
        return event.city.toLowerCase().trim() === selectedCityName;
      });
    }
  
    // Check for selected date range
    if (selectedDate?.value) {
      const { currentDate, endDate } = calculateDateRange(selectedDate.value);
  
      if (currentDate && endDate) {
        filtered = filtered.filter(event => {
          if (!event?.eventStartDate) return false;
          const eventDate = new Date(event.eventStartDate);
          return !isNaN(eventDate.getTime()) && eventDate >= currentDate && eventDate <= endDate;
        });
      }
    }
    
    // Update filteredEvents only if there are changes
    if (JSON.stringify(filtered) !== JSON.stringify(filteredEvents)) {
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events, selectedCity, selectedDate, filteredEvents]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchEvents(1, selectedMonth);
  };

  const handleLoadMore = () => {
    fetchEvents(page + 1);
    setPage(prevPage => prevPage + 1);
  };

  const handleMonthChange = month => {
    setSelectedMonth(month);
    setPage(1);
    fetchEvents(1, month);
    setModalVisible(false);
  };

  const handleResetFilters = () => {
    setSelectedMonth('-1');
    setPage(1);
    setSearchQuery('');
    navigation.setParams({selectedCity: null, selectedDate: null});
    // Reset to show all events
    setFilteredEvents(events);
  };

  // Check if any filter is applied
  const isFilterApplied = selectedCity || selectedDate;

  const handleScroll = (event: any) => {
    Keyboard.dismiss();
    handleBottomBarScroll(event);
  };

  const clearSearch = () => {
    setSearchQuery('');
    // Reset only the search filter, keep other filters
    let filtered = [...events];
    
    // Reapply other filters if they exist
    if (selectedCity?.City) {
      const selectedCityName = selectedCity.City.toLowerCase().trim();
      filtered = filtered.filter(event => {
        if (!event?.city) return false;
        return event.city.toLowerCase().trim() === selectedCityName;
      });
    }
  
    if (selectedDate?.value) {
      const { currentDate, endDate } = calculateDateRange(selectedDate.value);
      if (currentDate && endDate) {
        filtered = filtered.filter(event => {
          if (!event?.eventStartDate) return false;
          const eventDate = new Date(event.eventStartDate);
          return !isNaN(eventDate.getTime()) && eventDate >= currentDate && eventDate <= endDate;
        });
      }
    }
    
    setFilteredEvents(filtered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.black} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  const toggleSearch = () => {
    if(accountType == 'temp'){
      // navigation.navigate('Landing');
      setIsModalVisible(true);
    }else{
      setIsSearchVisible(!isSearchVisible);
      if (!isSearchVisible) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100); // Delay to ensure the input is visible before focusing
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Events</Text>
        <TouchableOpacity onPress={toggleSearch}>
        <Image
            source={require('../../assets/icons/searchIcon.png')}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>
      {isSearchVisible && (
        <View style={styles.searchInputWrapper}>
          <Image
            source={require('../../assets/icons/searchIcon.png')}
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search for Category"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
                          <Image
                    source={require('../../assets/header/cancelIcon.png')} 
                    style={styles.backIcon}/>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.searchBarContainer}>
        
        {/* <View style={styles.searchInputWrapper}>
          <Image
            source={require('../../assets/icons/searchIcon.png')}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search for events"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Icon name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View> */}
        {/* <TouchableOpacity 
          style={styles.filterIcon}
          onPress={() => setModalVisible(true)}>
          <Image
            source={require('../../assets/community/filterIcon.png')}
            style={styles.searchIcon}
          />
        </TouchableOpacity> */}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <View style={styles.monthGrid}>
              <Pressable
                style={[
                  styles.modalOption,
                  selectedMonth === '-1' && styles.selectedOption,
                ]}
                onPress={() => handleMonthChange('-1')}>
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedMonth === '-1' && styles.selectedOptionText,
                  ]}>
                  All
                </Text>
              </Pressable>
              {Array.from({length: 12}, (_, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.modalOption,
                    selectedMonth === index.toString() && styles.selectedOption,
                  ]}
                  onPress={() => handleMonthChange(index.toString())}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedMonth === index.toString() &&
                        styles.selectedOptionText,
                    ]}>
                    {new Date(2024, index).toLocaleString('default', {
                      month: 'long',
                    })}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredEvents}
        extraData={filteredEvents}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item?.id?.toString() || Math.random().toString()}
        numColumns={numColumns}
        onScroll={handleScroll}
        renderItem={({item}) => (
          <EventCard
            event={item}
            navigation={navigation}
            accountType={accountType}
          />
        )}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={numColumns === 2 ? { justifyContent: 'space-between' } : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events found.</Text>
            <Button title="View All Events" onPress={handleResetFilters} />
          </View>
        }
        ListFooterComponent={
          isFilterApplied && filteredEvents.length > 0 ? (
            <Pressable
              onPress={handleResetFilters}
              style={styles.resetButton}>
              <Text style={styles.resetText}>Reset Filters</Text>
            </Pressable>
          ) : null
        }
      />
    {/* Render the GetStartedModal */}
     <GetStartedModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingBottom: 40,
    paddingTop:10,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: FontSizes.medium2,
    fontWeight: '800',
    fontFamily: FontFamilies.bold,
    color: Color.black,
    flex: 1,
    textAlign: 'center',
    left:15,
  },
  searchIcon: {
    width: 22,
    height: 22,
    tintColor:Color.black,
  },
  searchInputWrapper: {
    width:"98%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    backgroundColor: Color.secondarygrey,
    borderRadius: 12,
    // margin: 16,
    margin:10,
    paddingLeft: 8,
    gap:10,
  },
  searchIconInsideInput: {
    marginRight: 18,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: Color.black,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: moderateScale(15),
    marginTop: verticalScale(10),
    gap: moderateScale(10),
  },
  // searchInputWrapper: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   flex: 1,
  //   backgroundColor: '#F3F3F3',
  //   borderRadius: moderateScale(12),
  //   paddingHorizontal: moderateScale(10),
  //   height: verticalScale(40),
  // },
  // searchIcon: {
  //   width: scale(18),
  //   height: scale(18),
  //   marginRight: moderateScale(8),
  // },
  filterIcon: {
    backgroundColor: '#000',
    height: verticalScale(40),
    width: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(10),
  },
  // searchInput: {
  //   flex: 1,
  //   fontSize: moderateScale(12),
  //   paddingRight: moderateScale(8),
  // },
  eventCard: {
    width: Dimensions.get('window') / 2 - moderateScale(20), // Adjust grid layout
  },
  buttonText: {
    fontSize: moderateScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(18),
  },
  modalOptionText: {
    fontSize: moderateScale(14),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ED4956',
    fontSize: 16,
    fontFamily: FontFamilies.regular,
  },
  listContainer: {
    paddingBottom: 50,
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 18,
    marginBottom: 10,
  },
  resetButton: {
    padding: 15,
    marginTop: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  resetText: {
    fontSize: 16,
    color: '#81919E',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  monthGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalOption: {
    width: '48%',
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: '#007BFF',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: FontFamilies.semibold,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#fff',
  },
  clearButton: {
    padding: moderateScale(4),
  },
  backIcon: {
    width: 24,
    height: 24,
  },
});

export default Events;
