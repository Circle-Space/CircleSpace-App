import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  FlatList,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import { Color, FontFamilies } from '../../../styles/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { post, getWithoutToken } from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

// Define the coupon interface
interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'fixed' | 'percentage';
  description: string;
  saveText: string;
}

// Define route params interface
interface RouteParams {
  planId?: string;
  onApplyCoupon?: (coupon: { discount: number; type: 'fixed' | 'percentage' }) => void;
}

// Define NavigationParams to include our route
type RootStackParamList = {
  CouponScreen: RouteParams;
};

const CouponScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CouponScreen'>>();
  const { planId, onApplyCoupon } = route.params || {};
  
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // Fetch available coupons from API
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      
      // Using getWithoutToken which handles the token from AsyncStorage internally
      const response = await getWithoutToken('coupons/get-coupon-codes', {});
      console.log("rrr",response)
      
      if (response?.status === 200 && response?.data) {
        // Transform API response to match our Coupon interface
        const coupons: Coupon[] = response.data.map((item: any) => ({
          id: item._id || String(Math.random()),
          code: item.codeName,
          discount: item.discountValue,
          type: item.discountType || 'fixed',
          description: item.description || `Use code ${item.codeName} and get ${item.discountValue}${item.discountType === 'percentage' ? '%' : '₹'} off on your purchase.`,
          saveText: `Save ${item.discountType === 'percentage' ? item.discountValue + '%' : '₹' + item.discountValue} on your purchase`
        }));
        
        setAvailableCoupons(coupons);
      } else {
        console.error('Failed to fetch coupons:', response?.message);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleCheckCoupon = async () => {
    if (!couponCode.trim()) {
      return;
    }

    setLoading(true);

    try {
      // Check if the coupon exists in available coupons first
      const existingCoupon = availableCoupons.find(
        coupon => coupon.code.toLowerCase() === couponCode.trim().toLowerCase()
      );

      if (existingCoupon) {
        setSelectedCoupon(existingCoupon);
        Alert.alert('Success', 'Coupon code is valid!');
      } else {
        // If not found locally, check with API using post which also handles the token internally
        const response = await post('coupons/coupons/validate', {
          code: couponCode.toUpperCase(),
          subscriptionPlanId: planId || ''
        });

        if (response?.status === 200 && response?.data) {
          const newCoupon: Coupon = {
            id: 'api-' + Date.now(),
            code: response.data.codeName || couponCode.toUpperCase(),
            discount: response.data.discountValue || response.data.discount,
            type: response.data.discountType || 'fixed',
            description: response.data.description || `Apply this coupon and get ${response.data.discountValue || response.data.discount}${response.data.discountType === 'percentage' ? '%' : '₹'} off on your purchase.`,
            saveText: `Save ${response.data.discountType === 'percentage' ? (response.data.discountValue || response.data.discount) + '%' : '₹' + (response.data.discountValue || response.data.discount)} on your purchase`
          };
          
          setAvailableCoupons(prev => [...prev, newCoupon]);
          setSelectedCoupon(newCoupon);
          Alert.alert('Success', 'Coupon code is valid!');
        } else {
          Alert.alert('Invalid Coupon', 'This coupon code is invalid or expired.');
        }
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      Alert.alert('Error', 'Failed to validate coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoupon = (coupon: Coupon) => {
    // Only toggle selection state, don't update the input field
    setSelectedCoupon(coupon === selectedCoupon ? null : coupon);
  };

  const handleApply = () => {
    if (!selectedCoupon) {
      Alert.alert('No Coupon Selected', 'Please select a coupon to apply.');
      return;
    }

    if (onApplyCoupon) {
      onApplyCoupon({
        discount: selectedCoupon.discount,
        type: selectedCoupon.type
      });
    }
    
    navigation.goBack();
  };

  const handleTermsPress = () => {
    Linking.openURL('https://circlespace.in/privacy-policy');
  };

  const renderCouponItem = ({ item }: { item: Coupon }) => {
    const isSelected = selectedCoupon?.id === item.id;
    
    // Format discount text
    const discountText = item.type === 'percentage' 
      ? `${item.discount}% OFF` 
      : `₹${item.discount} OFF`;
    
    // For 100% discount, show FREE instead
    const saveText = item.type === 'percentage' && item.discount === 100 
      ? 'Get it FREE'
      : item.saveText;
    
    // Special discount value to display - for the left side
    const displayValue = item.type === 'percentage' ? `${item.discount}%` : `₹${item.discount}`;
    
    return (
      <View style={styles.couponCard}>
        <View style={styles.couponLeftContainer}>
          <Image
            source={require('../../../assets/settings/subscription/checkoutscreen/couponLeft.png')}
            style={styles.couponLeftImage}
            // resizeMode='contain'
          />
          <Text style={styles.discountTagValue}>{displayValue} OFF</Text>
        </View>
        
        {/* Jagged Edge */}
        {/* <View style={styles.jaggedContainer}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.jaggedCut} />
          ))}
        </View> */}
        
        <View style={styles.couponContent}>
          <View style={styles.couponHeader}>
            <Text style={styles.couponCode}>{item.code}</Text>
            <TouchableOpacity 
              style={[styles.applyButton, isSelected && styles.appliedButton]}
              onPress={() => handleSelectCoupon(item)}
            >
              <Text style={styles.applyButtonText}>
                {isSelected ? 'SELECTED' : 'APPLY'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.saveText}>{saveText}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.couponDescription}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../../../assets/header/backIcon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offers & Coupons</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Coupon Input */}
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
        <Image
              source={require('../../../assets/icons/coupon.png')}
              style={styles.couponIcon}
            />
          <TextInput
            style={styles.input}
            placeholder="Enter coupon code"
            value={couponCode}
            onChangeText={setCouponCode}
            autoCapitalize="characters"
            placeholderTextColor="#656565"
          />
        </View>
        <TouchableOpacity 
          style={styles.checkButton}
          onPress={handleCheckCoupon}
          disabled={loading || !couponCode.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.checkButtonText}>Check</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Coupon List */}
      {loadingCoupons ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading coupons...</Text>
        </View>
      ) : availableCoupons.length === 0 ? (
        <View style={styles.noCouponsContainer}>
          {/* <Icon name="ticket-off" size={50} color="#999" /> */}
          <Text style={styles.noCouponsText}>No coupons available</Text>
        </View>
      ) : (
        <FlatList
          data={availableCoupons}
          renderItem={renderCouponItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.couponList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Apply Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[
            styles.applyAllButton, 
            selectedCoupon ? styles.applyAllButtonActive : styles.applyAllButtonDisabled
          ]}
          onPress={handleApply}
          disabled={!selectedCoupon}
        >
          <Text style={styles.applyAllButtonText}>
            {selectedCoupon ? `Apply Coupon: ${selectedCoupon.code}` : 'Apply'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, I agree to the{' '}
          <Text style={styles.termsLink} onPress={handleTermsPress}>Terms of Use</Text> &{' '}
          <Text style={styles.termsLink} onPress={handleTermsPress}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // iOS shadow properties
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    // Android shadow
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    height: 56,
    paddingHorizontal: 16,
  },
  couponIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  backButton: {
    padding: 8,
    height:40,
    width:40,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#FFFFFF",
    borderRadius: 12,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    flex: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamilies.medium,
    color: '#000000',
  },
  checkButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 24,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: 14,
    fontFamily: FontFamilies.bold,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  couponList: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  couponCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    // iOS shadow properties
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    // Android shadow
    elevation: 5,
    // overflow: 'hidden',
    // position: 'relative',
  },
  couponLeftContainer: {
    width: 40,
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius:8,
    objectFit:"fill",
  },
  couponLeftImage: {
    width: '100%', 
    height: '100%',
    position: 'absolute',
  },
  discountTagValue: {
    width: '200%', // Makes enough room for text when rotated
    transform: [{rotate: '-90deg'}],
    color: '#FFFFFF',
    fontFamily: FontFamilies.bold,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    zIndex: 1, // Ensures text appears above the image
  },
  couponContent: {
    flex: 1,
    padding: 16,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  couponCode: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: '#000000',
    fontWeight: '800',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  appliedButton: {
    backgroundColor: '#E5E5E5',
  },
  applyButtonText: {
    fontSize: 12,
    fontFamily: FontFamilies.bold,
    color: '#000000',
    fontWeight: '800',
  },
  saveText: {
    fontSize: 14,
    fontFamily: FontFamilies.medium,
    color: '#00A36C',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  couponDescription: {
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    color: '#656565',
    lineHeight: 18,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  applyAllButton: {
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  applyAllButtonActive: {
    backgroundColor: '#000000',
    borderWidth: 2,
    
  },
  applyAllButtonDisabled: {
    backgroundColor: '#666666',
  },
  applyAllButtonText: {
    fontSize: 15,
    fontFamily: FontFamilies.bold,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  termsText: {
    fontSize: 8,
    fontFamily: FontFamilies.regular,
    color: '#656565',
    textAlign: 'center',
  },
  termsLink: {
    fontFamily: FontFamilies.medium,
    color: '#000000',
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: FontFamilies.medium,
    color: '#666',
  },
  noCouponsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noCouponsText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: FontFamilies.medium,
    color: '#666',
  },
  jaggedContainer: {
    position: 'absolute',
    left: 0, // Position right at the edge of left container
    top: 8, // Start a bit below the top edge
    bottom: 8, // End a bit above the bottom edge
    width: 6,
    justifyContent: 'space-evenly',
    zIndex: 2,
  },
  jaggedCut: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginLeft: -6, // Half the width to center it on the edge
  },
});

export default CouponScreen; 