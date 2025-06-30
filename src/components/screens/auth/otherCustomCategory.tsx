import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  Color,
  FontFamilies,
  FontSizes,
  LineHeights,
  scaleFont,
} from '../../../styles/constants';
import {createUser} from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import categories from multiSelectCategory
const categories = [
  { id: 1, name: "Architecture" },
  { id: 2, name: "Interior Designing" },
  { id: 3, name: "Carpets & Rugs" },
  { id: 4, name: "CCTV & Security Systems" },
  { id: 5, name: "Curtains" },
  { id: 6, name: "Electricals" },
  { id: 7, name: "Flooring" },
  { id: 8, name: "Furniture" },
  { id: 9, name: "Gardening & Landscaping" },
  { id: 10, name: "Painting" },
  { id: 11, name: "Home Automation" },
  { id: 12, name: "Lighting" },
  { id: 13, name: "Modular Kitchen & Wardrobes" },
  { id: 14, name: "Packers & Movers" },
  { id: 15, name: "Photography" },
  { id: 16, name: "Publications" },
  { id: 17, name: "Sanitary Fixtures" },
  { id: 18, name: "Solar Panels" },
  { id: 19, name: "Stone & Marbles" },
  { id: 20, name: "Theater & Acoustics" },
  { id: 21, name: "Vastu" },
  { id: 22, name: "Others" },
];

const OtherCategory = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get previously selected categories
  const {
    selectedCategories = [],
    firstName,
    username,
    selectedOption,
    phoneNumber,
    existingCategories = [],
    fromProfile = false,
  } = route.params || {};
  console.log("38 ::",{
    selectedCategories,
    firstName,
    username,
    selectedOption,
    phoneNumber,
    existingCategories,
    fromProfile,
  });

  // Store all categories (previously selected + custom)
  const [allCategories, setAllCategories] = useState([...selectedCategories]);
  const [customCategory, setCustomCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);

  // Add new category
  const handleAddCategory = () => {
    if (customCategory.trim() && !allCategories.includes(customCategory)) {
      setAllCategories([...allCategories, customCategory]);
      setCustomCategory(''); // Clear input
      setFilteredCategories([]);
    }
  };

  // Remove category (either previously selected or custom)
  const handleRemoveCategory = (category: string) => {
    setAllCategories(allCategories.filter(item => item !== category));
  };

  // Add this validation function
  const validateInput = (text: string) => {
    // Allow letters, spaces, and hyphens
    if (/^[a-zA-Z\s-]*$/.test(text)) {
      setCustomCategory(text);
      setInputError('');
    } else {
      setInputError('Only letters, spaces, and hyphens are allowed');
    }
  };

  // Add this function to filter categories based on input
  const handleSearch = (text: string) => {
    validateInput(text);
    if (text.trim() === '') {
      setFilteredCategories([]);
      return;
    }
    // Filter categories that match the search text and are not already selected
    const filtered = categories
      .map(cat => cat.name)
      .filter(category => 
        category.toLowerCase().includes(text.toLowerCase()) && 
        !allCategories.includes(category)
      );
    setFilteredCategories(filtered);
  };

  // Add this function to handle adding a suggested category
  const handleAddSuggestedCategory = (category: string) => {
    if (!allCategories.includes(category)) {
      setAllCategories([...allCategories, category]);
      setCustomCategory('');
      setFilteredCategories([]);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      setIsLoading(true); // Start loading
      // Separate existing categories from custom ones
      const customCategories = allCategories.filter(
        cat => !existingCategories.includes(cat),
      );
      const payload = {
        phoneNumber: phoneNumber,
        accountType: selectedOption,
        password: '', // You'll need to get this from previous steps
        username: username,
        firstName: firstName?.split(' ')[0],
        lastName: firstName?.split(' ')[1] || '',
        email: '', // You'll need to get this from previous steps
        businessName: '', // You'll need to get this from previous steps
        address: {
          line1: '', // You'll need to get this from previous steps
          city: '', // You'll need to get this from previous steps
          state: '', // You'll need to get this from previous steps
          pincode: '', // You'll need to get this from previous steps
        },
        locationServed: [], // You'll need to get this from previous steps
        minBudget: '', // You'll need to get this from previous steps
        maxBudget: '', // You'll need to get this from previous steps
        professionalType: 'Other', //allCategories[0], // Using first category as primary type
        professionalCategory: selectedCategories, // Using all selected categories
        servicesProvided: allCategories,
        website: '', // You'll need to get this from previous steps
        otherServices: customCategories, // Add custom categories to otherServices
      };
      const responseData = await createUser('user/create', payload);
      console.log('response ::', responseData);
      if (responseData.status === 200) {
        // Alert.alert(
        //   'Thank You!',
        //   'For sending in your request. We will notify you soon.',
        //   [{ text: 'OK' }]
        // );
        await AsyncStorage.setItem('userToken', responseData?.authToken);
        await AsyncStorage.setItem(
          'accountType',
          responseData?.user?.accountType,
        );
        setTimeout(() => {
          setIsLoading(false);
          navigation.navigate('BottomBar' as never);
        }, 3000);
      } else {
        setIsLoading(false);
        Alert.alert(
          'Error',
          responseData.message || 'Failed to create user. Please try again.',
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Title & Subtitle */}
        <Text style={styles.title}>Cannot find your category?</Text>
        <Text style={styles.subtitle}>Request to get your category added</Text>

        {/* Input Field for Custom Category */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="add-outline"
            size={14}
            color={Color.white}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search or add your category"
            placeholderTextColor={Color.primarygrey}
            value={customCategory}
            onChangeText={handleSearch}
          />
          {customCategory.trim() !== '' && (
            <TouchableOpacity
              onPress={handleAddCategory}
              style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}

        {/* Category Suggestions */}
        {filteredCategories.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={filteredCategories}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleAddSuggestedCategory(item)}>
                  <Text style={styles.suggestionText}>{item}</Text>
                  <TouchableOpacity
                    style={styles.suggestionAddButton}
                    onPress={() => handleAddSuggestedCategory(item)}>
                    <Text style={styles.suggestionAddButtonText}>Add</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Show All Selected Categories (Previous + Custom) */}
        <View style={styles.tagContainer}>
          {allCategories.map((category, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{category}</Text>
              <TouchableOpacity onPress={() => handleRemoveCategory(category)}>
                <Ionicons
                  name="close"
                  size={16}
                  color="black"
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <View style={{flex: 1, justifyContent: 'flex-end'}}>
          <View style={[styles.submitContainer, allCategories.length === 0 && styles.disabledButton]}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={allCategories.length === 0}>
              <Text style={styles.submitText}>{fromProfile ? 'Update' : 'Create Account'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Color.black} />
              <Text style={styles.loadingText}>Setting up your account...</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: FontSizes.large2,
    fontWeight: '800',
    fontFamily: FontFamilies.bold,
    lineHeight: LineHeights.large,
    textAlign: 'center',
    marginTop: 20,
    color: '#000',
  },
  subtitle: {
    fontSize: FontSizes.small,
    textAlign: 'center',
    color: Color.primarygrey,
    fontFamily: FontFamilies.medium,
    lineHeight: LineHeights.large,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
  },
  icon: {
    verticalAlign: 'middle',
    textAlign: 'center',
    backgroundColor: '#130F26',
    borderRadius: 6,
    height: 20,
    width: 20,
    tintColor: Color.white,
    justifyContent: 'center',
    alignItems: 'center',
    lineHeight: 20,
  },
  closeIcon: {
    textAlign: 'center',
    backgroundColor:Color.secondarygrey,
    borderRadius: 60,
    height: 20,
    width: 20,
    tintColor: Color.white,
    justifyContent: 'center',
    alignItems: 'center',
    lineHeight: 20,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    color: Color.black,
  },
  addButton: {
    backgroundColor: 'black',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: Color.white,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
    height: 38,
  },
  tagText: {
    color: Color.white,
    fontSize: 12,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    marginRight: 5,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  submitButton: {
    backgroundColor: '#000',
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    fontSize: FontSizes.medium2,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    color: Color.white,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.medium,
    color: Color.black,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    fontFamily: FontFamilies.medium,
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  suggestionText: {
    fontSize: FontSizes.small,
    color: Color.black,
    fontFamily: FontFamilies.medium,
  },
  suggestionAddButton: {
    backgroundColor: Color.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  suggestionAddButtonText: {
    color: Color.white,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
  },
});

export default OtherCategory;
