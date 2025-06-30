import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Color, FontFamilies, FontSizes, FontWeights, LineHeights, scaleFont } from "../../../styles/constants";
import { createUser } from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 60) / 3; // Adjust grid size

const categories = [
  { id: 1, name: "Architecture", icon: require("../../../assets/onboarding/accountDetails/Category/ar.png") },
  { id: 2, name: "Interior Designing", icon: require("../../../assets/onboarding/accountDetails/Category/interior.png") },
  {id: 3, name: "Carpets & Rugs", icon: require("../../../assets/onboarding/accountDetails/Category/carpets.png") },
  { id: 4, name: "CCTV & Security Systems", icon: require("../../../assets/onboarding/accountDetails/Category/CCTV.png") },
  { id: 5, name: "Curtains", icon: require("../../../assets/onboarding/accountDetails/Category/curtains.png") },
  { id: 6, name: "Electricals", icon: require("../../../assets/onboarding/accountDetails/Category/eletricals.png") },
  { id: 7, name: "Flooring", icon: require("../../../assets/onboarding/accountDetails/Category/flooring.png") },
  { id: 8, name: "Furniture", icon: require("../../../assets/onboarding/accountDetails/Category/fur.png") },
  { id: 9, name: "Gardening & Landscaping", icon: require("../../../assets/onboarding/accountDetails/Category/gardening.png") },
  { id: 10, name: "Painting", icon: require("../../../assets/onboarding/accountDetails/Category/painting.png") },
  { id: 11, name: "Home Automation", icon: require("../../../assets/onboarding/accountDetails/Category/automation.png") },
  { id: 12, name: "Lighting", icon: require("../../../assets/onboarding/accountDetails/Category/lighting.png") },
  { id: 13, name: "Modular Kitchen & Wardrobes", icon: require("../../../assets/onboarding/accountDetails/Category/modular.png") },
  { id: 14, name: "Packers & Movers", icon: require("../../../assets/onboarding/accountDetails/Category/packers.png") },
  { id: 15, name: "Photography", icon: require("../../../assets/onboarding/accountDetails/Category/photographer.png") },
  { id: 16, name: "Publications", icon: require("../../../assets/onboarding/accountDetails/Category/publications.png") },
  { id: 17, name: "Sanitary Fixtures", icon: require("../../../assets/onboarding/accountDetails/Category/sanitry.png") },
  { id: 18, name: "Solar Panels", icon: require("../../../assets/onboarding/accountDetails/Category/solar.png") },
  { id: 19, name: "Stone & Marbles", icon: require("../../../assets/onboarding/accountDetails/Category/stone.png") },
  { id: 20, name: "Theater & Acoustics", icon: require("../../../assets/onboarding/accountDetails/Category/theater.png") },
  { id: 21, name: "Vastu", icon: require("../../../assets/onboarding/accountDetails/Category/vastu.png") },
  { id: 22, name: "Others", icon: require("../../../assets/onboarding/accountDetails/Category/others.png") },
];

type RouteParams = {
  firstName?: string;
  username?: string;
  selectedOption?: string;
  phoneNumber?: string;
  existingCategories?: string[];
  fromProfile?: boolean;
  onSaveCategories?: (categories: string[]) => Promise<void>;
}

type RootStackParamList = {
  Landing: undefined;
  // ... add other routes as needed
}

const MultiSelectCategory = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  
  const { 
    firstName, 
    username, 
    selectedOption, 
    phoneNumber,
    existingCategories = [],
    fromProfile = false,
    onSaveCategories
  } = (route.params as RouteParams) || {};

  // Log initial route params
  console.log('Route Params:', {
    firstName,
    username,
    selectedOption,
    phoneNumber,
    existingCategories,
    fromProfile
  });

  const [selectedCategories, setSelectedCategories] = useState(existingCategories);
  const [search, setSearch] = useState("");
  const [selectionError, setSelectionError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      setSelectionError("Please select at least one category");
      return;
    }

    if (fromProfile) {
      console.log('Updating profile categories:', selectedCategories);
      if (onSaveCategories) {
        await onSaveCategories(selectedCategories);
        navigation.goBack();
      }
    } else {
      try {
        setIsLoading(true); // Start loading
        const payload = {
          phoneNumber,
          accountType: selectedOption,
          password: "",
          username,
          firstName: firstName || '',
          lastName: "",
          email: "",
          businessName: "",
          address: {
            line1: "",
            city: "",
            state: "",
            pincode: ""
          },
          locationServed: [],
          minBudget: "",
          maxBudget: "",
          professionalType: selectedCategories[0],
          professionalCategory: selectedCategories,
          servicesProvided: selectedCategories,
          website: "",
          otherServices: []
        };

        const responseData = await createUser('user/create', payload);
        if (responseData.status === 200) {
          console.log("responseData", responseData);
          await AsyncStorage.setItem('userToken', responseData?.authToken);
          await AsyncStorage.setItem('accountType', responseData?.user?.accountType);
          setTimeout(() => {
            setIsLoading(false);
            // navigation.navigate('BottomBar');
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'BottomBar',
                  params: { index: 0 },
                },
              ],
            });
          }, 3000);
        } else {
          setIsLoading(false);
          Alert.alert(
            "Error",
            responseData.message || "Failed to create user. Please try again."
          );
        }
      } catch (error) {
        setIsLoading(false);
        console.error('Registration Error:', error);
        Alert.alert(
          "Error",
          "An unexpected error occurred. Please try again."
        );
      }
    }
  };

  const toggleSelection = (id: string, name: string) => {
    if (name === "Others") {
      navigation.navigate("OtherCategory" as never, {
        selectedCategories: selectedCategories,
        firstName,
        username,
        selectedOption,
        phoneNumber,
        existingCategories: selectedCategories,
        fromProfile
      } as never);
      return;
    }

    setSelectedCategories((prev) => {
      const filteredPrev = prev.filter(item => typeof item === 'string');
      
      // Check if trying to deselect
      if (filteredPrev.includes(name)) {
        return filteredPrev.filter((item) => item !== name);
      }

      // Special handling for Architecture and Interior Designing
      if (name === "Architecture" || name === "Interior Designing") {
        // If selecting Architecture or Interior Designing
        if (filteredPrev.length > 0 && 
            !filteredPrev.includes("Architecture") && 
            !filteredPrev.includes("Interior Designing")) {
          setSelectionError("Architecture and Interior Designing can't be combined with other categories");
          return filteredPrev;
        }
        
        // Allow only Architecture and Interior Designing to be selected together
        if (name === "Architecture" && !filteredPrev.includes("Interior Designing")) {
          return ["Architecture"];
        }
        if (name === "Interior Designing" && !filteredPrev.includes("Architecture")) {
          return ["Interior Designing"];
        }
      } else {
        // For other categories
        if (filteredPrev.includes("Architecture") || filteredPrev.includes("Interior Designing")) {
          setSelectionError("Other categories can't be combined with Architecture or Interior Designing");
          return filteredPrev;
        }
        
        // Check if trying to select more than 3 categories
        if (filteredPrev.length >= 3) {
          setSelectionError("You can't select more than 3 categories");
          return filteredPrev;
        }
      }

      setSelectionError(""); // Clear error if selection is valid
      return [...filteredPrev, name];
    });
  };

  const filteredCategories = categories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <View style={styles.container}>
      {/* Title and Subtitle */}
      <Text style={styles.title}>Select your category</Text>
      <Text style={styles.subtitle}>( Can select multiple options )</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image
          source={require("../../../assets/icons/searchIcon.png")}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for names"
          placeholderTextColor={Color.primarygrey}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {selectionError ? (
        <Text style={styles.errorText}>{selectionError}</Text>
      ) : null}

      {/* Categories Grid */}
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategories.includes(item.name) && styles.selectedCategory,
            ]}
            onPress={() => toggleSelection(item.id, item.name)}
          >
            <Image source={item.icon} style={styles.icon} />
            <Text
              style={[
                styles.categoryText,
                selectedCategories.includes(item.name) && styles.selectedText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Submit Button (Fixed at Bottom) */}
      <View style={styles.submitContainer}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            selectedCategories.length === 0 && styles.disabledButton
          ]} 
          onPress={handleSubmit}
          disabled={selectedCategories.length === 0}
        >
          <Text style={styles.submitText}>
            {fromProfile ? 'Update' : 'Create Account'}
          </Text>
        </TouchableOpacity>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    fontSize: FontSizes.large2,
    fontFamily: FontFamilies.bold,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 20,
    color: "#000",
  },
  subtitle: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    textAlign: "center",
    color: "#A0A0A0",
    marginBottom: 20,
  },
  searchContainer: {
    backgroundColor: Color.secondarygrey,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
    width: "91%",
  },
  searchIcon: {
    height: 18,
    width: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: Color.black,
  },
  gridContainer: {
    paddingBottom: 100, // Space for Submit Button
  },
  categoryItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: "#F3F3F3",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
    paddingHorizontal: 5,
  },
  selectedCategory: {
    backgroundColor: "#000",
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    lineHeight: LineHeights.extrasmall,
    fontWeight: FontWeights.normal,
    fontFamily: FontFamilies.medium,
    color: Color.black,
    textAlign: "center",
  },
  selectedText: {
    color: "#fff",
  },
  submitContainer: {
    position: "absolute",
    bottom: 0,
    paddingVertical: 20,
    width: "100%",
    alignItems: "center",
    backgroundColor: Color.white,
  },
  submitButton: {
    backgroundColor: Color.black,
    width: "90%",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: FontFamilies.semibold,
    color: "#fff",
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
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
});

export default MultiSelectCategory;
