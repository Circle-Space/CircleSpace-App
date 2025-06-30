import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color, FontFamilies, FontSizes, LetterSpacings, LineHeights } from '../../styles/constants';
import { moderateScale } from 'react-native-size-matters';
import BackButton from '../commons/customBackHandler';
import { SafeAreaView } from 'react-native-safe-area-context';

const AllCategoriesScreen = ({ navigation, route }) => {
  const { categories } = route.params;
  console.log('categories', categories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Memoized filtered categories with "Others" moved to the end
  // const filteredCategories = useMemo(() => {
  //   // Filter the categories based on the search term
  //   const filtered = categories.filter(category =>
  //     category.name.toLowerCase().includes(searchTerm.toLowerCase())
  //   );

  //   // Sort the filtered categories alphabetically
  //   const sortedCategories = filtered.sort((a, b) =>
  //     a.name.localeCompare(b.name)
  //   );

  //   // Find the "Others" category and move it to the end
  //   const othersCategory = sortedCategories.find(cat => cat.name.toLowerCase() === 'others');
  //   if (othersCategory) {
  //     // Remove "Others" from the sorted list
  //     const filteredWithoutOthers = sortedCategories.filter(
  //       cat => cat.name.toLowerCase() !== 'others'
  //     );
  //     // Add "Others" to the end of the list
  //     filteredWithoutOthers.push(othersCategory);
  //     return filteredWithoutOthers;
  //   }

  //   return sortedCategories;
  // }, [searchTerm, categories]);

  const categoryOrder = [
    'Architect',
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
  
  const filteredCategories = useMemo(() => {
    // Filter the categories based on the search term
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    // Sort the filtered categories based on sequence in ascending order
    const sortedCategories = filtered.sort((a, b) => {
      // Sort by sequence if available
      if (a.sequence && b.sequence) {
        return a.sequence - b.sequence;
      }
      // Fall back to alphabetical sorting if sequence is not available
      return a.name.localeCompare(b.name);
    });
  
    return sortedCategories;
  }, [searchTerm, categories]);
  

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        navigation.navigate('ProfessionalsScreen', {
          categoryId: item.cid,
          title: item.name,
        })
      }
    >
      <Image source={{ uri: item.icon }} style={styles.categoryIcon} />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );
  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100); // Delay to ensure the input is visible before focusing
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backbutton}>
        <BackButton/>
        </View>
        <Text style={styles.headerText}>Professionals</Text>
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
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      )}
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        {/* <View style={styles.searchInputWrapper}>
          <Image
            source={require('../../assets/icons/searchIcon.png')}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search for professionals"
            style={styles.searchInput}
            value={searchTerm}
            placeholderTextColor="#888"
            onChangeText={setSearchTerm}
          />
        </View> */}
        {/* <View style={styles.filterIcon}>
        <Image
            source={require('../../assets/community/filterIcon.png')}
            style={styles.searchIcon}
          />
        </View> */}
      </View>

      {/* Display Categories */}
      {filteredCategories.length > 0 ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item?.cid.toString()}
          numColumns={3}
          columnWrapperStyle={styles.categoryRow}
          contentContainerStyle={[styles.categoryList, { paddingBottom: 100 }]}
        />
      ) : (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No categories found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backbutton:{
    left:-24,
  },
  headerText: {
    fontSize: FontSizes.medium2,
    fontWeight: '400',
    fontFamily: FontFamilies.bold,
    color: Color.black,
    flex: 1,
    textAlign: 'center',
    left:-10,
  },
  searchIcon: {
    width: 22,
    height: 22,
    left:5,
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    gap:14,
  },
  // searchInputWrapper: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   flex: 1,
  //   backgroundColor: '#F3F3F3',
  //   borderRadius: 12,
  //   paddingHorizontal: 10,
  //   height: 44,
  // },
  // searchIcon: {
  //   width: 20,
  //   height: 20,
  //   // tintColor: '#828282',
  // },
  filterIcon: {
    backgroundColor:Color.black,
    height:44,
    width:44,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#81919E',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    height: 40,
  },
  categoryList: {
    justifyContent: 'space-between',
  },
  categoryRow: {
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width / 3 - 24,
    height: Dimensions.get('window').width / 3 - 24,
    marginHorizontal: 8,
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
  },
  categoryIcon: {
    width: 64,  
    height: 64,
    marginBottom: 4,
  },
  categoryText: {
    fontFamily:FontFamilies.medium,
    fontWeight: '400',
    fontSize: FontSizes.small, // Scales dynamically based on screen size
    color: Color.black,
    lineHeight:LineHeights.small,
    // letterSpacing:LetterSpacings.wide,
    textAlign: 'center',
    marginHorizontal:5,
    paddingBottom:9,
  },
  noResults: {
    alignItems: 'center',
    marginTop: 50,
  },
  noResultsText: {
    fontSize: 16,
    color: '#AAA',
    fontFamily: FontFamilies.regular,
  },
});

export default AllCategoriesScreen;
