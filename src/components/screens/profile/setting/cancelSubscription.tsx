import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  ScrollView, // Add ScrollView
} from 'react-native';
import {get} from '../../../../services/dataRequest';

const CancelSubscriptionScreen = () => {
  const cLogo = require('../../../../assets/settings/subscription/companyLogo.png');
  const vBadge = require('../../../../assets/settings/subscription/verifiedBadge.png');
  const backgroundImage = require('../../../../assets/settings/subscription/unsubCadBg.png');
  const cancelIcon = require('../../../../assets/settings/subscription/cancelIcon.png');
  const navigate = useNavigation();

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
  const navigation = useNavigation();

  const navigateToUnsubscribe = async () => {
    navigation.navigate('CancelSubscriptionConfirmationScreen' as never);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <ImageBackground
          source={backgroundImage}
          style={styles.imageBackground}
          resizeMode="cover">
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigate.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: user?.profilePic || 'https://via.placeholder.com/100',
                }}
                style={styles.profileImage}
              />
              <View style={styles.logoContainer}>
                <Image source={cLogo} style={styles.companyLogo} />
              </View>
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
        </ImageBackground>

        {/* Benefits */}
        <Text style={styles.benefitsTitle}>
          Canceling your subscription means {'\n'} losing:
        </Text>
        {[
          'Category Listing',
          'Unlimited Job Postings',
          'Unlimited Shared Collections',
          'Premium Identity',
          'A Verified badge',
        ].map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Image source={cancelIcon} style={styles.tickImage} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {/* Unlock Button as Image */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={() => navigateToUnsubscribe()}>
          <Text style={styles.unlockText}>Cancel Subscription</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  container: {
    width: '100%',
    alignItems: 'center', // Ensure container items are centered
  },
  imageBackground: {
    width: '100%',
    height: 300,
    paddingBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 10,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10, // Add space between profile image and logo
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  logoContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 5,
  },
  companyLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  nameView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Gilroy-Bold',
    fontWeight: '400',
    color: '#1E1E1E',
    marginRight: 5,
  },
  verifiedBadge: {
    height: 22,
    width: 22,
  },
  benefitsTitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#1E1E1E',
    fontFamily: 'Gilroy-Bold',
    fontWeight: '400',
    marginBottom: 40,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
  },
  tickImage: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#1E1E1E',
    fontFamily: 'Gilroy-SemiBold',
  },
  termsText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    margin: 25,
  },
  linkText: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center', // Centers vertically
    alignItems: 'center', // Centers horizontally
    marginTop: 100, // Add some spacing before the button
  },
  unlockButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    width: '85%',
    backgroundColor: '#ED4956',
  },
  unlockText: {
    color: '#FFF',
    fontFamily: 'Gilroy-SemiBold',
    fontSize: 15,
    fontWeight: '400',
  },
});

export default CancelSubscriptionScreen;
