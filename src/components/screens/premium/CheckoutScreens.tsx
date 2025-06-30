import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Linking,
} from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Color, FontFamilies } from '../../../styles/constants';
import RazorpayCheckout from 'react-native-razorpay';
import { get, post } from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPlanDates } from '../../../utils/dateUtils';


interface PlanDetails {
  _id: string;
  name: string;
  actualPrice: number;
  displayPrice: number;
  duration: number;
  features: string[];
  description: string;
  billingCycle: string;
  isActive: boolean;
  isPopular: boolean;
  maxUsers: number;
  offerDetails: any;
  offerType: string;
  recommendedFor: string;
  trialPeriod: number;
}

interface ApiResponse {
  data: PlanDetails[];
  message: string;
  status: number;
}

interface CouponType {
  discount: number;
  type: 'fixed' | 'percentage';
}

interface PriceDetails {
  mrp: number;
  discount: number;
  subtotal: number;
  total: number;
}

interface CouponResponse {
  status: number;
  message: string;
  data: {
    discount: number;
    type: 'fixed' | 'percentage';
  };
}

// Update COUPONS with proper typing
const COUPONS: Record<string, CouponType> = {
  'WELCOME50': { discount: 200, type: 'fixed' },
  'CIRCLE25': { discount: 25, type: 'percentage' },
  'FIRST500': { discount: 500, type: 'fixed' },
};

const CheckoutScreens = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [gstNumber, setGstNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponType | null>(null);
  const [loading, setLoading] = useState(true);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [priceDetails, setPriceDetails] = useState<PriceDetails>({
    mrp: 0,
    discount: 0,
    subtotal: 0,
    total: 0,
  });
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { planStartDate, planEndDate } = getPlanDates();

  useEffect(() => {
    fetchPlanDetails();
  }, []);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await get('subscription-plans/get-plans', {}, 'GET');
      console.log("response", response);

      if (response?.data?.length > 0) {
        const plan = response.data[0];
        setPlanDetails(plan);
        setPriceDetails({
          mrp: plan.actualPrice || 4999,
          discount: 0,
          subtotal: plan.displayPrice || 4999,
          total: plan.displayPrice || 4999,
        });
      } else {
        throw new Error('No plan data available');
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
      Alert.alert(
        'Error',
        'Failed to fetch plan details. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (coupon: CouponType | null = null) => {
    const mrp = planDetails?.actualPrice || 4999;
    let discount = 0;

    if (coupon) {
      if (coupon.type === 'fixed') {
        discount = coupon.discount;
      } else {
        discount = Math.floor((mrp * coupon.discount) / 100);
      }
    }

    const subtotal = mrp - discount;
    const total = subtotal;

    setPriceDetails({
      mrp,
      discount,
      subtotal,
      total,
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode || !planDetails?._id) return;

    try {
      setValidatingCoupon(true);
      // Close keyboard
      Keyboard.dismiss();
      
      const response = await post('coupons/coupons/validate', {
        code: couponCode.toUpperCase(),
        subscriptionPlanId: planDetails._id
      });
      console.log("response coupon", response);

      if (response?.status === 200 && response?.data) {
        const couponData = response.data;
        setAppliedCoupon({
          discount: couponData.discount,
          type: couponData.discountType
        });
        calculatePrice({
          discount: couponData.discount,
          type: couponData.type
        });
        Alert.alert('Success', 'Coupon applied successfully!');
      } else if (response?.status === 400) {
        setAppliedCoupon(null);
        calculatePrice(null);
        Alert.alert('Error', 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setAppliedCoupon(null);
      calculatePrice(null);
      Alert.alert('Error', 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleButtonPress = async () => {
    if (priceDetails.total === 0) {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('Token is null');
        
        const payload = {
          userPlan: "paid",
          isPaid: true,
          planDuration: 365,
          planEndDate,
          planStartDate,
          planStatus: "active"
        };
        console.log("payload Checkout", payload);
        
        const apiResponse = await post('user/upgrade-account', payload);
        console.log("apiResponse", apiResponse);
        if (apiResponse.status === 200) {
          const user = apiResponse.user;
          await AsyncStorage.setItem('user', JSON.stringify(user));
          await AsyncStorage.setItem('isPaid', JSON.stringify(user.isPaid));
          await AsyncStorage.setItem('accountType', user.accountType);
          
          // If GST number is provided, update it
          if (gstNumber.trim()) {
            try {
              const gstResponse = await post('user/update-user-gstin', {
                GSTIN: gstNumber
              });
              
              if (gstResponse?.status !== 200) {
                console.error('Failed to update GST:', gstResponse?.message);
              }
            } catch (gstError) {
              console.error('Error updating GST:', gstError);
            }
          }

          // Show popup first
          setShowPopup(true);
        } else {
          throw new Error(apiResponse.message || 'Failed to upgrade account');
        }
      } catch (error) {
        console.error('Error upgrading account:', error);
        Alert.alert('Error', 'Failed to upgrade account. Please try again.');
      }
    } else {
      handlePayment();
    }
  };
  const handlePress = () => {
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'Profile' }],
    // });
    navigation.navigate('BottomBar', {
      screen: 'ProfileScreen',
      params: {
        isSelf: true
      }
    });
  };

  const navigateToCouponScreen = () => {
    // Navigate to the coupon screen with parameters
    navigation.navigate('CouponScreen', {
      planId: planDetails?._id,
      onApplyCoupon: (coupon: CouponType) => {
        setAppliedCoupon(coupon);
        calculatePrice(coupon);
      }
    });
  };

  const handlePayment = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('Token is null');
      
      const options: any = {
        description: 'The Circle Premium Subscription',
        image: 'https://your-app-logo-url.png',
        currency: 'INR',
        key: 'rzp_live_gWoW6nDNTMFQMp',
        amount: String(priceDetails.total * 100),
        name: 'CircleSpace',
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'User Name'
        },
        theme: { color: '#000000' }
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          try {
            console.log("203 :: payment ::",data);
            const payload = {
              userPlan: "paid",
              isPaid: true,
              planDuration: 365,
              planEndDate,
              planStartDate,
              planStatus: "active"
            };
            
            const apiResponse = await post('user/upgrade-account', payload);
            console.log("apirespo ::", apiResponse);
            
            if (apiResponse.status === 200) {
              const user = apiResponse.user;
              await AsyncStorage.setItem('user', JSON.stringify(user));
              await AsyncStorage.setItem('isPaid', JSON.stringify(user.isPaid));
              await AsyncStorage.setItem('accountType', user.accountType);
              

              // If GST number is provided, update it
              if (gstNumber.trim()) {
                try {
                  const gstResponse = await post('user/update-user-gstin', {
                    GSTIN: gstNumber
                  });
                  
                  if (gstResponse?.status !== 200) {
                    console.error('Failed to update GST:', gstResponse?.message);
                  }
                } catch (gstError) {
                  console.error('Error updating GST:', gstError);
                }
              }

              Alert.alert('Success', 'Payment Successful', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Reload the app by navigating to Home
                    navigation.navigate('ProfileRewamp');
                  }
                }
              ]);
            } else {
              throw new Error(apiResponse.message || 'Failed to upgrade account');
            }
          } catch (error) {
            console.error('Error upgrading account:', error);
            Alert.alert('Error', 'Payment successful but account upgrade failed. Please contact support.');
          }
        })
        .catch((error: any) => {
          Alert.alert('Error', `Payment Failed: ${error.code} - ${error.description}`);
        });
    } catch (error) {
      console.error('Error during payment:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleTermsPress = () => {
    Linking.openURL('https://circlespace.in/privacy-policy');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust as needed
  >
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      {/* GST Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GST Details</Text>
        <View style={styles.inputContainer}>
          <Image
            source={require('../../../assets/icons/document.png')}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter GST"
            value={gstNumber}
            onChangeText={setGstNumber}
            placeholderTextColor="#656565"
          />
        </View>
        <Text style={styles.helperText}>Enter GST number to claim input credit</Text>
      </View>

      {/* Coupon Section - UPDATED */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.couponButton}
          onPress={navigateToCouponScreen}
        >
          <View style={styles.couponButtonLeft}>
            <Image
              source={require('../../../assets/icons/coupon.png')}
              style={styles.couponIcon}
            />
            <Text style={styles.couponButtonText}>Offers & Coupons</Text>
          </View>
          <Icon name="chevron-right" size={24} color={Color.black} />
        </TouchableOpacity>
        
        {appliedCoupon && (
          <View style={styles.appliedCouponContainer}>
            <Text style={styles.couponApplied}>
              Coupon applied: 
              {appliedCoupon.type === 'percentage' 
                ? ` ${appliedCoupon.discount}% off`
                : ` ₹${appliedCoupon.discount} off`}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setAppliedCoupon(null);
                calculatePrice(null);
              }}
            >
              <Text style={styles.removeCouponText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Price Breakdown */}
      <View style={styles.priceBreakdown}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>MRP Total</Text>
          <Text style={styles.priceValue}>₹{priceDetails.mrp.toLocaleString()}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Discount</Text>
          <Text style={[styles.priceValue, styles.discountText]}>
            {priceDetails.discount > 0 ? '-' : ''}₹{priceDetails.discount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>₹{priceDetails.subtotal.toLocaleString()}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{priceDetails.total.toLocaleString()}.00</Text>
        </View>
      </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.proceedButton}
          onPress={handleButtonPress}
        >
          <Text style={styles.proceedButtonText}>
            {priceDetails.total === 0 ? 'Join TheCIRCLE' : 'Proceed to Pay'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By continuing, I agree to the{' '}
          <Text style={styles.termsLink} onPress={handleTermsPress}>Terms of Use</Text> &{' '}
          <Text style={styles.termsLink} onPress={handleTermsPress}>Privacy Policy</Text>
        </Text>
      </View>
      </SafeAreaView>

      {showPopup && (
          <TouchableOpacity style={styles.popupContainer} onPress={handlePress}>
          <Image
            source={require('../../../assets/images/sucess.png')}
            style={styles.popupImage}
          />
        </TouchableOpacity>
      )}
  </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
    backgroundColor: '#000000',
    borderBottomWidth: 0,
    height: 56,
    paddingHorizontal: 16
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
    // marginTop: 20,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  premiumCard: {
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    margin: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  circleIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  cardInfo: {
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 16,
    letterSpacing: 0,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    color: '#656565',
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 16,
    letterSpacing: 0,
  },
  durationText: {
    fontSize: 12,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    color: '#656565',
  },
  cardFooter: {
    marginTop: 4,
  },
  renewalText: {
    fontSize: 12,
    fontFamily: FontFamilies.semibold,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '400',

  },
  cancelText: {
    fontSize: 10,
    fontFamily: FontFamilies.medium,
    color: '#666666',
    fontWeight: '400',
  },
  termsLink: {
    fontSize: 8,
    fontFamily: FontFamilies.medium,
    color: '#000000',
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    color: '#000000',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 12,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
  },
  helperText: {
    fontSize: 10,
    fontFamily: FontFamilies.medium,
    color: '#656565',
    marginTop: 8,
    fontWeight: '400',
  },
  couponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  applyButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingHorizontal: 24,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 12,
    fontFamily: FontFamilies.bold,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  priceBreakdown: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: FontFamilies.semibold,
    color: '#000000',
    fontWeight: '800',
  },
  priceValue: {
    fontSize: 12,
    fontFamily: FontFamilies.bold,
    color: '#000000',
    fontWeight: '800',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: '#000000',
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: FontFamilies.bold,
    color: '#000000',
    fontWeight: '800',
  },
  bottomSection: {
    padding: 16,
    marginTop: 'auto',
  },
  proceedButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  proceedButtonText: {
    fontSize: 15,
    fontFamily: FontFamilies.bold,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  termsText: {
    fontSize: 8,
    fontFamily: FontFamilies.semibold,
    color: '##656565',
    textAlign: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#666666',
  },
  couponApplied: {
    fontSize: 12,
    fontFamily: FontFamilies.medium,
    color: '#00A36C',
    marginTop: 8,
    fontWeight: '400',
  },
  discountText: {
    color: '#00A36C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  popupContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
  },
  popupImage: {
    width: Dimensions.get('window').width*0.8,
    height: Dimensions.get('window').width*0.8,
  },
  couponButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    height: 52,
    // Convert Figma box-shadow to React Native shadow properties
    shadowColor: '#1D242A',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 5, // for Android
    alignSelf: 'center', // To center the button horizontally
  },
  couponButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  couponButtonText: {
    fontSize: 14,
    fontFamily: FontFamilies.semibold,
    color: '#000000',
    fontWeight: '600',
  },
  chevronIcon: {
    width: 16,
    height: 16,
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  removeCouponText: {
    fontSize: 12,
    fontFamily: FontFamilies.medium,
    color: '#FF3B30',
    textDecorationLine: 'underline',
  },
});

export default CheckoutScreens;