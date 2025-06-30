import React,{useState} from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet,TextInput,} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ScrollView } from "react-native-gesture-handler";
import CSlogo from '../../../../assets/settings/subscription/checkoutscreen/CSlogo.png';
import CSFullLogo from '../../../../assets/settings/subscription/checkoutscreen/CSFullLogo.png';
import { Color, FontFamilies, FontSizes, LetterSpacings, LineHeights } from "../../../../styles/constants";
import pointerIcon from '../../../../assets/settings/subscription/checkoutscreen/pointerIcon.png';
import Svg, { Circle, Line } from 'react-native-svg';

const validCoupons = {
  "CSFIRST100": { discount: 500, message: "₹500.00 off" },
  "DISCOUNT30": { discount: 300, message: "₹300.00 off" },
};

const CheckoutScreen = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const navigation = useNavigation();

  // Get today's date
  const today = new Date();

  // Calculate the date 1 year from today
  const nextYearDate = new Date(today);
  nextYearDate.setFullYear(today.getFullYear());

  // Format the date as "DD MMM YYYY"
  const formattedNextYearDate = nextYearDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState("");

  const productPrice = 2999.00;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalPrice = productPrice - discount;

  const applyCoupon = () => {
    if (validCoupons[couponCode]) {
      setAppliedCoupon(validCoupons[couponCode]);
      setError("");
    } else {
      setAppliedCoupon(null);
      setError("The promo code has expired");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setError("");
  };
  return (
    <ScrollView style={styles.container1}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={{ height:37,width:37,justifyContent:'center', alignItems:'center', backgroundColor: 'white', borderRadius: 12, padding: 4 }}>
          <MaterialIcons name="close" size={18} color="black" />
        </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Circlespace Checkout</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {/* Checkout Details */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <Image 
            source={CSFullLogo} 
            style={styles.logo} 
          />
        </View>

        <Text style={styles.checkoutText}>Checkout</Text>

        {/* Product Details */}
        <View style={styles.productCard}>
          <View style={styles.productRow}>
            <Image 
              source={CSlogo} 
              style={styles.productIcon} 
            />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>Premium Individual</Text>
              <Text style={styles.productSubText}>1 Premium account</Text>
            </View>
            <View style={styles.priceContainer}>
                <Text style={styles.productPrice}>₹2999.00</Text>
                <Text style={styles.productDuration}>For 1 Year</Text>
            </View>
          </View>

          {/* Subscription Details */}
          <View style={styles.subscriptionDetails}>
            {/* <Image 
              source={pointerIcon} 
              style={styles.productIcon} 
            /> */}
            <Text style={styles.todayText}>● Today: 1 year for ₹2999.00</Text>
            <Text style={styles.renewText}>
              ● Starting on {formattedNextYearDate}: ₹2999.00/year
            </Text>
            <Text style={styles.cancelText}>• Cancel anytime online. <Text style={styles.linkText}>Terms apply</Text></Text>
          </View>
        </View>
      </View>
      <View style={styles.container2}>
      <Text style={styles.checkoutText}>Payment Method</Text>
      <View style={styles.card}>
        {/* UPI Payment Option */}
        <TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedMethod("upi")}>
          <View style={styles.radioCircle}>{selectedMethod === "upi" && <View style={styles.selectedCircle} />}</View>
          <View>
            <Text style={styles.optionText}>Pay by any UPI app</Text>
            <Image source={require("../../../../assets/settings/subscription/checkoutscreen/bhimupi.png")} style={styles.bhimupilogo} />
            {selectedMethod === "upi" && (
              <View style={{}}>
                <Text style={styles.label}>UPI ID</Text>
                <TextInput style={styles.inputContainer} placeholder="user@upihandle" keyboardType="email-address" />
                <Text style={styles.infoText}>A UPI ID consists of your user ID and bank handle in the following format: user@upihandle</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Credit/Debit Card Payment Option */}
        <TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedMethod("card")}>
          <View style={styles.radioCircle}>{selectedMethod === "card" && <View style={styles.selectedCircle} />}</View>
          <View>
            <Text style={styles.optionText}>Credit or Debit Card</Text>
            <View style={styles.cardLogos}>
              <Image source={require("../../../../assets/settings/subscription/checkoutscreen/visa.png")} style={styles.logos} />
              <Image source={require("../../../../assets/settings/subscription/checkoutscreen/mastercard.png")} style={styles.logos} />
              <Image source={require("../../../../assets/settings/subscription/checkoutscreen/amex.png")} style={styles.logos} />
            </View>
            {selectedMethod === "card" && (
              <View style={styles.inputContainer}>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput style={styles.input} placeholder="First Name" />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput style={styles.input} placeholder="Last Name" />
                  </View>
                </View>
                <Text style={styles.label}>Card Number</Text>
                <TextInput style={styles.input} placeholder="1234 5678 9012 3456" keyboardType="numeric" />
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <TextInput style={styles.input} placeholder="MM/YY" keyboardType="numeric" />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput style={styles.input} placeholder="***" keyboardType="numeric" secureTextEntry={true} />
                  </View>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.container2}>
      <Text style={styles.checkoutText}>Summary</Text>

      {/* Product Details */}
      <View style={styles.summarycard}>
      <View style={styles.summarycard}>
      <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.productRow}>
          <Image 
            source={CSlogo} 
            style={styles.productIcon} 
          />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>Premium Individual</Text>
            <Text style={styles.productSubText}>1 Premium account</Text>
          </View>
          <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>₹2999.00</Text>
          </View>
        </View>

        {/* Subscription Details */}
        <View style={styles.subscriptionDetails}>
          <Text style={styles.todayText}>● Today: 1 year for ₹2999.00</Text>
          <Text style={styles.renewText}>
            ● Starting on {formattedNextYearDate}: ₹2999.00/year
          </Text>
        </View>
      </View>

        {/* Coupon Section */}
        <Text style={styles.promoTitle}>Promo code/ coupon</Text>

        {appliedCoupon ? (
          <View style={styles.appliedCoupon}>
            <MaterialIcons name="check-circle" size={20} color="black" />
            <View>
              <Text style={styles.couponText}>{couponCode} applied</Text>
              <Text style={styles.discountText}>-{appliedCoupon.message}</Text>
            </View>
            <TouchableOpacity onPress={removeCoupon} style={styles.removeButton}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.promoRow}>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Enter promo code"
                placeholderTextColor="#888"
                value={couponCode}
                onChangeText={setCouponCode}
              />
              <TouchableOpacity onPress={applyCoupon} style={styles.applyButton}>
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
            {error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={18} color="red" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Subtotal */}
        {appliedCoupon && (
          <>
            <View style={styles.line} />
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalText}>Subtotal</Text>
              <Text style={styles.subtotalPrice}>₹{productPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.subtotalRow}>
              <MaterialIcons name="local-offer" size={18} color="black" />
              <Text style={styles.discountApplied}> {couponCode} </Text>
              <Text style={styles.discountPrice}>-₹{appliedCoupon.discount.toFixed(2)}</Text>
            </View>
          </>
        )}

        {/* Total */}
        <View style={styles.line} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total now</Text>
          <Text style={styles.totalAmount}>₹{totalPrice.toFixed(2)}</Text>
        </View>
      </View>
      <View>
        <Text>By placing this order, you agree to CircleSpace's Terms of Service and Privacy Policy. You will be charged Rs. 2,999. Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period. You can manage your subscription and turn off auto-renew from your settings.</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Continue Purchase</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    top:0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Color.black,
    backgroundColor:Color.black,
  },
  headerTitle: {
    fontSize: FontSizes.large,
    fontFamily:FontFamilies.bold,
    color:Color.white,
    fontWeight: "400",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 143,
    height: 26,
  },
  checkoutText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: '400',
    marginVertical: 10,
    fontFamily:FontFamilies.bold,
    color:Color.black,
  },
  productCard: {
    // backgroundColor: "#F9F9F9",
    gap:10,
    paddingVertical: 18,
    // borderRadius: 12,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    borderTopWidth:1,
    borderTopColor:'#E0E0E0'
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    gap:2,
  },
  productTitle: {
    fontSize: FontSizes.medium2,
    fontFamily:FontFamilies.bold,
    color:Color.black,
    fontWeight: "400",
  },
  productSubText: {
    fontSize: FontSizes.medium,
    fontFamily:FontFamilies.medium,
    color:'#656565',
  },
  priceContainer: {
    alignItems: "center", // Ensures text is centered one below the other
    gap:2,
  },
  productPrice: {
    fontSize: FontSizes.medium2,
    fontFamily:FontFamilies.bold,
    letterSpacing:LetterSpacings.wide,
    color:Color.black,
    fontWeight: "400",
  },
  productDuration: {
    fontSize: FontSizes.medium,
    fontFamily:FontFamilies.medium,
    color:'#656565',
  },
  
  subscriptionDetails: {
    marginTop: 10,
  },
  todayText: {
    fontFamily:FontFamilies.semibold,
    color:Color.black,
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
  },
  renewText: {
    fontFamily:FontFamilies.semibold,
    color:Color.black,
    fontSize: 12,
    marginBottom: 5,
  },
  cancelText: {
    fontFamily:FontFamilies.semibold,
    color:Color.black,
    fontSize: 12,
  },
  linkText: {
    color: Color.black,
    textDecorationLine: "underline",
  },
  container2: {
     padding: 20 
    },
  header2: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  card: { 
    padding: 15, 
    borderWidth: 1, 
    borderRadius: 10, 
    borderColor: "#ddd" 
  },
  radioContainer: { 
    flexDirection: "row", 
    marginVertical: 10 
  },
  radioCircle: { 
    width: 20, 
    height: 20,
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: "#000", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 10 
  },
  selectedCircle: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: "#000" 
  },
  optionText: { 
    fontSize: 16, 
    fontWeight: "400" ,
    fontFamily:FontFamilies.medium,
    lineHeight:LineHeights.medium,
  },
  bhimupilogo: { 
    width: 170, 
    height: 36, 
    marginTop: 5 
  },
  cardLogos: { flexDirection: "row", marginTop: 5 },
  logos: { width: 40, height: 25, marginRight: 5 },
  inputContainer: { 
    padding:10,
    marginTop: 10, 
    width:'96%',
    backgroundColor:'#f3f3f3',
    borderRadius:12,
   },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfWidth: { width: "48%" },
  label: { 
    fontSize: 14, 
    fontWeight: "400", 
    marginTop: 10,
    fontFamily:FontFamilies.medium,
    color:Color.black,
    marginBottom:5,
  },
  input: {  
    borderRadius: 12, 
    padding: 10, 
    marginTop: 5 ,
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  infoText: { 
    fontSize: 12, 
    color: "#656565", 
    marginTop: 5 ,
    margin:10,
    fontFamily:FontFamilies.medium,
  },
  button: { 
    backgroundColor: "#000", 
    padding: 15, 
    borderRadius: 12, 
    alignItems: "center", 
    marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summarycard: {
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily:FontFamilies.medium,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subscriptionDetails: {
    marginBottom: 10,
  },
  dot: {
    fontSize: 14,
    color: "#555",
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 5,
  },
  promoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  // input: {
  //   flex: 1,
  //   backgroundColor: "#FFF",
  //   borderRadius: 5,
  //   paddingHorizontal: 10,
  //   height: 40,
  //   marginRight: 10,
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  // },
  inputError: {
    borderColor: "red",
  },
  applyButton: {
    backgroundColor: Color.black,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  applyText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  errorText: {
    color: "red",
    marginLeft: 5,
  },
  appliedCoupon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  couponText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10,
  },
  discountText: {
    fontSize: 12,
    color: "#555",
    marginLeft: 10,
  },
  removeButton: {
    marginLeft: "auto",
    backgroundColor: "#FF4444",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    marginVertical: 10,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  subtotalPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  discountApplied: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
  discountPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "red",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CheckoutScreen;
