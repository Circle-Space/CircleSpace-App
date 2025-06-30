import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  ScrollView, // Add ScrollView
} from 'react-native';
import {get} from '../../../../services/dataRequest';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../../styles/constants';
import RazorpayCheckout from 'react-native-razorpay';

const SubscriptionScreen = () => {
  const cLogo = require('../../../../assets/settings/subscription/companyLogo.png');
  const  rCard = require('../../../../assets/settings/subscription/ratecard3.png');
  const vBadge = require('../../../../assets/settings/subscription/verifiedBadge1.png');
  const backgroundImage = require('../../../../assets/settings/subscription/cardBG.png');
  const tickImage = require('../../../../assets/settings/subscription/tickIcon1.png');
  const flareIcon = require('../../../../assets/settings/subscription/unlock2.png');
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  useEffect(() => {
    // Fetch user data from AsyncStorage
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const token: any = await AsyncStorage.getItem('userToken');
        setToken(token);
        console.log('userdata ::', userData);
        if (userData) {
          setUser(JSON.parse(userData)); // Parse the JSON data
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    fetchUserData();
  }, []);
  // const navigation = useNavigation();

  const checkout = async () => {
    try {
      const apiResponse = await get('user/upgrade-account', {}, token);
      console.log('apiResponse ::', apiResponse);
      if (apiResponse.status === 200) {
        // Update user data in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(apiResponse.user));
        await AsyncStorage.setItem('isPaid', JSON.stringify(apiResponse.user?.isPaid));
        
        // Navigate back to home
        navigation.navigate('Home' as never);
      } else {
        console.error('Upgrade failed:', apiResponse.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      // Handle error appropriately
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          {/* <ImageBackground
            source={backgroundImage}
            style={styles.imageBackground}
            resizeMode="cover"> */}
            {/* Back Button */}
            

            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
              <Image
          source={require('../../../../assets/profile/defaultAvatar.png')}
          style={styles.profileImage}
        />
                  
                
                
              </View>
              <View style={styles.nameView}>
                <Text style={styles.profileName}>
                  {user?.username || 'User Name'}
                </Text>
                <Image
                  source={vBadge} // Replace with actual verified badge image URL
                  style={styles.verifiedBadge}
                />
              </View>
            </View>

            {/* Subscription Rate Card */}
            <View style={styles.rateCardContainer}>
              <Image source={rCard} style={styles.rateCardImage} />
            </View>
          {/* </ImageBackground> */}

          {/* Benefits */}
          <Text style={styles.benefitsTitle}>
            What you get with your subscription
          </Text>
          {[
            'Category Listing',
            'Unlimited Job Postings',
            'Unlimited Shared Collections',
            'Premium Identity',
            'A Verified badge',
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Image source={tickImage} style={styles.tickImage} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            By unlocking the benefits, you agree to the Circlespace{' '}
            <Text style={styles.linkText}>Terms of Services</Text>. You agree
            that the information you provide for your Verified subscription is
            subject to our <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>

        {/* Unlock Button as Image */}
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={() => checkout()}>
          <Image source={flareIcon} style={styles.flareIcon} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Optional: semi-transparent background for better visibility
    borderRadius: 20,
    padding: 10,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  profileSection: {
    paddingTop: 60,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth:2,
    borderColor:Color.white,
    // backgroundColor: '#FFF',
    borderRadius: 15,
    // padding: 5,
  },
  companyLogo: {
    width: 20,
    height: 20,
    borderRadius: 15,
  },
  nameView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  profileName: {
    fontSize: FontSizes.extraLarge,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
    color: '#1E1E1E',
    marginRight: 5,
  },
  verifiedBadge: {
    height: 22,
    width: 22,
  },
  rateCardContainer: {
    alignItems: 'center',
  },
  rateCardImage: {
    width: '100%',
    height: 125,
  },
  benefitsTitle: {
    fontSize: FontSizes.medium2,
    textAlign: 'center',
    color: '#1E1E1E',
    fontFamily: FontFamilies.bold,
    fontWeight: '400',
    marginBottom: 20,
    paddingBottom:10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  tickImage: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#1E1E1E',
    fontFamily: 'Gilroy-SemiBold',
    lineHeight:LineHeights.large,
  },
  termsText: {
    fontSize: 12,
    color: '#81919E',
    textAlign: 'center',
    margin: 25,
    lineHeight:LineHeights.medium,
  },
  linkText: {
    color: '#4A4A4A',
    textDecorationLine: 'underline',
    fontFamily:FontFamilies.semibold,
  },
  unlockButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    width: '100%',
    marginBottom: 40,
    marginLeft:10,
  },
  flareIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default SubscriptionScreen;
