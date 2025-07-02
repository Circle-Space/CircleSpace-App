/* eslint-disable react-hooks/exhaustive-deps */
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import LoginBottomSheet from '../commons/loginBottomSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWithoutToken } from '../../services/dataRequest';
import { Color, FontFamilies, FontSizes, LetterSpacings, LineHeights } from '../../styles/constants';
import { moderateScale } from 'react-native-size-matters';
import { Line } from 'react-native-svg';
import GetStartedModal from '../commons/getStartedModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomBarScroll } from '../../hooks/useBottomBarScroll';

const Community = () => {
  const navigation = useNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [accountType, setAccountType] = useState('');
  const { handleScroll } = useBottomBarScroll();
  const [isPaid, setIsPaid] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Focus effect to reset searchTerm and fetch data when component is focused
  useFocusEffect(
    useCallback(() => {
      setSearchTerm('');

      const fetchData = async () => {
        try {
          setIsLoading(true);
          // Fetch categories
          const res = await getWithoutToken('cat/categories', {});
          if (res) setCategories(res);
          console.log('categories', res);

          // Fetch account type
          const accountType = await AsyncStorage.getItem('accountType');
          console.log('accountType', accountType);
          setAccountType(accountType || '');

          // Fetch isPaid status
          const userString = await AsyncStorage.getItem('user');
          console.log("userstring", userString);

          if (userString) {
            const userData = JSON.parse(userString);
            setIsPaid(userData.isPaid);
            console.log('isPaid', userData.isPaid);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, []),
  );

  // Filtered categories based on search term
  const filteredCategories = useMemo(
    () =>
      categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ).map(category => ({
        cid: category.cid,
        name: category.name,
        icon: category.icon,
        relatedKeywords: category.relatedKeywords || [],
        sequence: category.sequence
      })),
    [searchTerm, categories],
  );

  // Predefined category order
  const categoryOrder = [
    'Architecture',
    'Interior Designer',
    'Home Photography',
    'Publications',
    'Home Appliances',
    'Solar Panels',
    'Curtains',
    'Vastu',
    'Home Automation',
    'Electricals',
    'Gardening & Landscaping',
    'Flooring',
    'Gypsum Works',
    'Security & Surveillance',
    'Furniture',
    'Plumbing',
    'Painting',
    'Sanitary Fixtures',
    'Theater & Acoustics',
    'Metal & Steel Works',
    'Packers & Movers',
    'Roofing Solutions',
    'Stones & Marbles',
    'Decor & Furnishings',
    'Glass & Mirrors',
    'Carpentry & Wood Works',
    'Construction Materials',
    'Others',
  ];

  // Sorted and limited categories
  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      // First try to sort by sequence
      if (a.sequence && b.sequence) {
        return a.sequence - b.sequence;
      }
      // Fall back to categoryOrder if sequence is not available
      const indexA = categoryOrder.indexOf(a.name);
      const indexB = categoryOrder.indexOf(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [filteredCategories]);

  // Navigate to detail page or show login modal
  const navigateToDetail = item => {
    if (accountType === 'temp') {
      // if (accountType === 'temp' || isPaid) {
      // navigation.navigate('Landing');
      setIsModalVisible(true);
    } else {
      navigation.navigate('ProfessionalsScreen', {
        categoryId: item.cid,
        title: item.name,
      });
    }
  };

  // Navigate to the "See All" page or show login modal
  const navigateToSeeAll = () => {
    if (accountType === 'temp') {
      // if (accountType === 'temp' || isPaid) {
      // navigation.navigate('Landing');
      setIsModalVisible(true);
    } else {
      navigation.navigate('AllCategories', { categories });
    }
  };

  const renderCategoryItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.categoryItem}
        onPress={() => navigateToDetail(item)}>
        <Image source={{ uri: item.icon }} style={styles.categoryIcon} />
        <Text style={styles.categoryText}>{item.name}</Text>
      </TouchableOpacity>
    ),
    [navigateToDetail],
  );

  const getItemLayout = (data, index) => ({
    length: 116,
    offset: 116 * index,
    index,
  });

  const renderPremiumBanner = () => {
    if (!isPaid && accountType !== 'temp') {
    // if (!isPaid && accountType === 'professional') {
      return (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.premiumBanner}
          onPress={() => navigation.navigate('PremiumFeatures')}>
          <Image
            source={require('../../assets/profile/premium/TheCIRCLE.png')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    }
    return null;
  };

  const toggleSearch = () => {
    navigation.navigate('AllCategories', { categories });
  };

  // Add useEffect to handle search input focus
  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      if (isSearchVisible) {
        setIsSearchVisible(false);
        setSearchTerm('');
      }
    }}>
      <SafeAreaView style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.black} />
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerText}>Professionals</Text>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  if(accountType == 'temp'){
                    // navigation.navigate('Landing');
                    setIsModalVisible(true);
                  }else{
                    setIsSearchVisible(!isSearchVisible);
                    // If we're hiding the search, clear the search term
                    if (isSearchVisible) {
                      setSearchTerm('');
                    }
                  }
                }}>
                <Image
                  source={require('../../assets/icons/searchIcon.png')}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.mainScrollContent}
              bounces={false}
              onScroll={handleScroll}
              onScrollBeginDrag={() => {
                if (isSearchVisible) {
                  setIsSearchVisible(false);
                  setSearchTerm('');
                  Keyboard.dismiss();
                }
              }}
            >
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
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    autoFocus={true}
                  />
                  {searchTerm.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchTerm('')}
                      style={styles.clearButton}>
                      <Image
                        source={require('../../assets/header/cancelIcon.png')} 
                        style={styles.backIcon}/>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Premium Banner */}
              {renderPremiumBanner()}

              {/* Categories Header */}
              {/* <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>Choose a category</Text>
              </View> */}

              {/* Categories Grid */}
              <View style={styles.categoriesGrid}>
                {sortedCategories.length > 0 ? (
                  sortedCategories.map((item, index) => (
                    <View key={item?.cid.toString()} style={styles.categoryItemWrapper}>
                      {renderCategoryItem({ item })}
                    </View>
                  ))
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>No categories found</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </>
        )}

        {/* Render the GetStartedModal */}
        <GetStartedModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 0,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: FontSizes.medium2,
    fontWeight: '800',
    fontFamily: FontFamilies.bold,
    color: Color.black,
    flex: 1,
    textAlign: 'center',
    left: 15,
  },
  searchIcon: {
    width: 22,
    height: 22,
    tintColor: Color.black,
  },
  searchInputWrapper: {
    width: "91%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.secondarygrey,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingLeft: 8,
    paddingRight: 8,
    gap: 10,
  },
  searchIconInsideInput: {
    marginRight: 18,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: Color.black,
  },
  quizBanner: {
    backgroundColor: Color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    height: 140,
    justifyContent: 'center',
  },
  quizText: {
    fontSize: 12,
    color: Color.white,
    marginBottom: 8,
  },
  quizSubText: {
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
    lineHeight: 19.6,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quizButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderColor: Color.white,
    borderWidth: 1,
    marginTop: 8,
  },
  quizButtonText: {
    color: Color.black,
    fontSize: FontSizes.medium,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontFamily: FontFamilies.semibold,
    // letterSpacing:LetterSpacings.wide,
    color: Color.black,
    fontSize: FontSizes.large,
    fontWeight: '400',
  },
  seeAllText: {
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.medium,
    letterSpacing: LetterSpacings.wide,
    fontWeight: '400',
    color: Color.black,
  },
  categoryList: {
    justifyContent: 'space-between',
  },
  categoryRow: {
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    marginBottom: 2,
  },
  categoryText: {
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    fontSize: FontSizes.small, // Scales dynamically based on screen size
    color: Color.black,
    lineHeight: LineHeights.extrasmall,
    // letterSpacing:LetterSpacings.wide,
    textAlign: 'center',
    marginHorizontal: 5,
    paddingBottom: 9,
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    fontFamily: FontFamilies.medium,
  },
  premiumBanner: {
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    width: Dimensions.get('window').width - 32, // Full width minus margins
  },
  bannerImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
  },
  mainScrollContent: {
    paddingBottom: 100,
  },
  categoriesGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  categoryItemWrapper: {
    width: (Dimensions.get('window').width - 48) / 3, // (screen width - (2 * outer padding + 2 * gap)) / 3
    // marginBottom: 8,
  },
  clearButton: {
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Community;
