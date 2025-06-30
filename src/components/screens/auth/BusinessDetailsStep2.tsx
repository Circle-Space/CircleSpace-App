import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../styles/constants';
import BackButton from '../../commons/customBackHandler';
import cityData from '../../datasets/citydata';
import Icon from 'react-native-vector-icons/MaterialIcons';

const categories = [
  { id: 1, name: 'Architecture', icon: require('../../../assets/onboarding/accountDetails/Category/ar.png') },
  { id: 2, name: 'Interior Designing', icon: require('../../../assets/onboarding/accountDetails/Category/interior.png') },
  { id: 3, name: 'Carpets & Rugs', icon: require('../../../assets/onboarding/accountDetails/Category/carpets.png') },
  { id: 4, name: 'CCTV & Security Systems', icon: require('../../../assets/onboarding/accountDetails/Category/CCTV.png') },
  { id: 5, name: 'Curtains', icon: require('../../../assets/onboarding/accountDetails/Category/curtains.png') },
  { id: 6, name: 'Electricals', icon: require('../../../assets/onboarding/accountDetails/Category/eletricals.png') },
  { id: 7, name: 'Flooring', icon: require('../../../assets/onboarding/accountDetails/Category/flooring.png') },
  { id: 8, name: 'Furniture', icon: require('../../../assets/onboarding/accountDetails/Category/fur.png') },
  { id: 9, name: 'Gardening & Landscaping', icon: require('../../../assets/onboarding/accountDetails/Category/gardening.png') },
  { id: 10, name: 'Painting', icon: require('../../../assets/onboarding/accountDetails/Category/painting.png') },
  { id: 11, name: 'Home Automation', icon: require('../../../assets/onboarding/accountDetails/Category/automation.png') },
  { id: 12, name: 'Lighting', icon: require('../../../assets/onboarding/accountDetails/Category/lighting.png') },
  { id: 13, name: 'Modular Kitchen & Wardrobes', icon: require('../../../assets/onboarding/accountDetails/Category/modular.png') },
  { id: 14, name: 'Packers & Movers', icon: require('../../../assets/onboarding/accountDetails/Category/packers.png') },
  { id: 15, name: 'Photography', icon: require('../../../assets/onboarding/accountDetails/Category/photographer.png') },
  { id: 16, name: 'Publications', icon: require('../../../assets/onboarding/accountDetails/Category/publications.png') },
  { id: 17, name: 'Sanitary Fixtures', icon: require('../../../assets/onboarding/accountDetails/Category/sanitry.png') },
  { id: 18, name: 'Solar Panels', icon: require('../../../assets/onboarding/accountDetails/Category/solar.png') },
  { id: 19, name: 'Stone & Marbles', icon: require('../../../assets/onboarding/accountDetails/Category/stone.png') },
  { id: 20, name: 'Theater & Acoustics', icon: require('../../../assets/onboarding/accountDetails/Category/theater.png') },
  { id: 21, name: 'Vastu', icon: require('../../../assets/onboarding/accountDetails/Category/vastu.png') },  
  { id: 22, name: 'Others', icon: require('../../../assets/onboarding/accountDetails/Category/others.png') },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

const ITEM_SIZE = (Dimensions.get('window').width - 60) / 3;

const BusinessDetailsStep2 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [category, setCategory] = useState('');
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [location, setLocation] = useState('');
  const [locationDropdown, setLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [activeSince, setActiveSince] = useState('');
  const [activeSinceDropdown, setActiveSinceDropdown] = useState(false);
  const [activeSinceSearch, setActiveSinceSearch] = useState('');

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  const filteredLocations = cityData.filter(l => 
    l.City.toLowerCase().includes(locationSearch.toLowerCase()) || 
    l.State.toLowerCase().includes(locationSearch.toLowerCase())
  );
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear + 0 - i).toString());
  const filteredYears = years.filter(y => y.includes(activeSinceSearch));

  const handleNext = () => {
    if (!category || !location || !activeSince) return;
    // Pass data to next step
    console.log('data ::',route.params,category,location,activeSince);
    (navigation.navigate as any)('BusinessDetailsStep3', {
      ...route.params,
      category,
      location,
      activeSince,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{top:10,marginBottom:15}}>
        <BackButton/>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Progress Bar and Step */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
          <View style={styles.stepBox}>
            <Text style={styles.stepText}>1/3</Text>
          </View>
        </View>
        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {/* Category Dropdown */}
          <Text style={styles.label}>What category best describes your business? <Text style={{color: 'black'}}>*</Text></Text>
          <Text style={styles.hint}>Your business will be listed under this category.</Text>
          <View style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryDropdownBtn}
              onPress={() => setCategoryDropdown(!categoryDropdown)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Image source={require('../../../assets/profile/editProfile/categoryIcon.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                <Text style={[styles.dropdownText, !category && { color: '#000' }]}>{category || 'Select Category'}</Text>
              </View>
              <Icon name={categoryDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#222" />   
            </TouchableOpacity>
            {categoryDropdown && (
              <View style={styles.categoryDropdownBox}>
                <View style={styles.categorySearchBarWrapper}>
                  <Image source={require('../../../assets/profile/editProfile/searchIcon.png')} style={{ width: 18, height: 18, marginRight: 8 }} />
                  <TextInput
                    style={styles.categorySearchInput}
                    placeholder="Search"
                    placeholderTextColor="#888"
                    value={categorySearch}
                    onChangeText={setCategorySearch}
                  />
                </View>
                <ScrollView style={styles.categoryDropdownScrollView}
                  contentContainerStyle={{ flexGrow: 0 }}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled">
                  {filteredCategories.map(option => (
                    <TouchableOpacity
                      key={option.name}
                      style={[
                        styles.categoryDropdownOption,
                        category === option.name && styles.categoryDropdownOptionSelected,
                      ]}
                      onPress={() => {
                        setCategory(option.name);
                        setCategoryDropdown(false);
                        setCategorySearch('');
                      }}
                    >
                      <Text style={[styles.categoryDropdownOptionText, category === option.name && styles.categoryDropdownOptionTextSelected]}>{option.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          {/* Location Dropdown */}
          <Text style={styles.label}>Location <Text style={{color: 'black'}}>*</Text></Text>
          <View style={styles.locationCard}>
            <TouchableOpacity
              style={styles.locationDropdownBtn}
              onPress={() => setLocationDropdown(!locationDropdown)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Image source={require('../../../assets/profile/editProfile/locationIcon.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                <Text style={[styles.dropdownText, !location && { color: '#000' }]}>{location || 'Select Location'}</Text>
              </View>
              <Icon name={locationDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#222" />
            </TouchableOpacity>
            {locationDropdown && (
              <View style={styles.locationDropdownBox}>
                <View style={styles.locationSearchBarWrapper}>
                  <Image source={require('../../../assets/profile/editProfile/searchIcon.png')} style={{ width: 18, height: 18, marginRight: 8 }} />
                  <TextInput
                    style={styles.locationSearchInput}
                    placeholder="Search"
                    placeholderTextColor="#888"
                    value={locationSearch}
                    onChangeText={setLocationSearch}
                  />
                </View>
                <FlatList
                  data={filteredLocations}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.locationDropdownOption,
                        location === `${item.City}, ${item.State}` && styles.locationDropdownOptionSelected,
                      ]}
                      onPress={() => {
                        setLocation(`${item.City}`);
                        setLocationDropdown(false);
                        setLocationSearch('');
                      }}
                    >
                      <Text style={[styles.locationDropdownOptionText, location === `${item.City}, ${item.State}` && styles.locationDropdownOptionTextSelected]}>
                        {item.City}, {item.State}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.City}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  removeClippedSubviews={true}
                  getItemLayout={(data, index) => ({
                    length: 60,
                    offset: 60 * index,
                    index,
                  })}
                  style={{ maxHeight: 200 }}
                  contentContainerStyle={{ paddingBottom: 4 }}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                />
              </View>
            )}
          </View>
          {/* Active Since Dropdown */}
          <Text style={styles.label}>Active Since <Text style={{color: 'black'}}>*</Text></Text>
          <View style={styles.activeSinceCard}>
            <TouchableOpacity
              style={styles.activeSinceDropdownBtn}
              onPress={() => setActiveSinceDropdown(!activeSinceDropdown)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Image source={require('../../../assets/profile/editProfile/activeSinceIcon.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                <Text style={[styles.dropdownText, !activeSince && { color: '#000' }]}>{activeSince || 'Select Year'}</Text>
              </View>
              <Icon name={activeSinceDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#222" />
            </TouchableOpacity>
            {activeSinceDropdown && (
              <View style={styles.activeSinceDropdownBox}>
                <View style={styles.activeSinceSearchBarWrapper}>
                  <Image source={require('../../../assets/profile/editProfile/searchIcon.png')} style={{ width: 18, height: 18, marginRight: 8 }} />
                  <TextInput
                    style={styles.activeSinceSearchInput}
                    placeholder="Search"
                    placeholderTextColor="#888"
                    value={activeSinceSearch}
                    onChangeText={setActiveSinceSearch}
                  />
                </View>
                <ScrollView
                  style={styles.activeSinceDropdownScrollView}
                  contentContainerStyle={{ flexGrow: 0 }}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                >
                  {filteredYears.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.activeSinceDropdownOption,
                        activeSince === option && styles.activeSinceDropdownOptionSelected,
                      ]}
                      onPress={() => {
                        setActiveSince(option);
                        setActiveSinceDropdown(false);
                        setActiveSinceSearch('');
                      }}
                    >
                      <Text style={[styles.activeSinceDropdownOptionText, activeSince === option && styles.activeSinceDropdownOptionTextSelected]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>
        {/* Next/Previous Buttons Footer */}
        <View style={styles.footerBtnRow}>
          <TouchableOpacity style={styles.prevBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={20} color="#111" style={{ marginRight: 8 }} />
            <Text style={styles.prevBtnText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.nextBtn, (!category || !location || !activeSince) && styles.disabledButton]} onPress={handleNext} disabled={!category || !location || !activeSince}>
            <Text style={styles.nextBtnText}>Next</Text>
            <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    marginHorizontal: 20,
  },
  progressBarBg: {
    flex: 1,
    height: 7,
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
    marginRight: 10,
  },
  progressBarFill: {
    width: '33.33%', // 2/6th progress
    height: 7,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  stepBox: {
    backgroundColor: '#000',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stepText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    marginBottom: 10,
    marginTop: 10,
    marginRight: 20,
  },
  dropdownBtn: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: FontSizes.small,
    color: Color.black,
    marginBottom: 5,
  },
  dropdownText: {
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  dropdownBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownOptionSelected: {
    backgroundColor: '#000',
  },
  dropdownOptionText: {
    color: Color.black,
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.regular,
  },
  dropdownOptionTextSelected: {
    color: Color.white,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    color: Color.primarygrey,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    marginBottom: 10,
    marginLeft: 2,
  },
  categoryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 0,
    marginBottom: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
    zIndex: 999,
  },
  categoryDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
  },
  categoryDropdownBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginTop: 0,
    paddingBottom: 4,
    maxHeight: 220,
    overflow: 'hidden',
    zIndex: 1000,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  categorySearchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    marginBottom: 4,
    paddingHorizontal: 8,
    height: 38,
  },
  categorySearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  categoryDropdownScrollView: {
    maxHeight: 150,
    flexGrow: 0,
  },
  categoryDropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: 'transparent',
    height: 48,
    justifyContent: 'center',
    borderRadius: 12,
  },
  categoryDropdownOptionSelected: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  categoryDropdownOptionText: {
    fontSize: FontSizes.medium,
    color: Color.black,
    fontFamily: FontFamilies.regular,
  },
  categoryDropdownOptionTextSelected: {
    color: Color.black,
    fontFamily: FontFamilies.regular,
  },
  locationCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 0,
    marginBottom: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
    zIndex: 999,
  },
  locationDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
  },
  locationDropdownBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginTop: 0,
    paddingBottom: 4,
    maxHeight: 220,
    overflow: 'hidden',
    zIndex: 1000,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  locationSearchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    marginBottom: 4,
    paddingHorizontal: 8,
    height: 38,
  },
  locationSearchInput: {
    flex: 1,
    fontSize: FontSizes.medium,
    color: Color.black,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  locationDropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: 'transparent',
    height: 60,
    justifyContent: 'center',
    borderRadius: 12,
  },
  locationDropdownOptionSelected: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  locationDropdownOptionText: {
    fontSize: FontSizes.medium,
    color: Color.black,
    fontFamily: FontFamilies.regular,
  },
  locationDropdownOptionTextSelected: {
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  activeSinceCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 0,
    marginBottom: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
    zIndex: 999,
  },
  activeSinceDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
  },
  activeSinceDropdownBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginTop: 0,
    paddingBottom: 4,
    maxHeight: 220,
    overflow: 'hidden',
    zIndex: 1000,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  activeSinceSearchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    marginBottom: 4,
    paddingHorizontal: 8,
    height: 38,
  },
  activeSinceSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  activeSinceDropdownScrollView: {
    maxHeight: 150,
    flexGrow: 0,
  },
  activeSinceDropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: 'transparent',
    height: 48,
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeSinceDropdownOptionSelected: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  activeSinceDropdownOptionText: {
    fontSize: FontSizes.medium,
    color: Color.black,
    fontFamily: FontFamilies.regular,
  },
  activeSinceDropdownOptionTextSelected: {
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  footerBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginRight: 8,
    flex: 1,
    justifyContent: 'center',
  },
  prevBtnText: {
    color: Color.black,
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.semibold,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginLeft: 8,
    flex: 1,
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BusinessDetailsStep2; 