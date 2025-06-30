import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Color, FontFamilies } from '../../../styles/constants';

const PremiumFeatures = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  return (
    <ImageBackground
      source={require('../../../assets/images/premium-bg.png')}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image 
            source={require('../../../assets/header/backIcon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <Image
            source={require('../../../assets/images/circle-logo.png')}
            style={styles.logo}
          />
          
          <Text style={styles.subtitle}>
            Upgrade to access premium features and get more benefits!
          </Text>

          <View style={styles.featuresContainer}>
            <Image
              source={require('../../../assets/images/premium.png')}
              style={[
                styles.featuresImage,
                { width: width * 0.9, height: height * 0.4 }
              ]}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity 
            style={styles.joinButton} 
            onPress={() => navigation.navigate('Checkout' as never)}
          >
            <Text style={styles.joinButtonText}>JOIN NOW</Text>
          </TouchableOpacity>

          {/* <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By unlocking the benefits, your agree to the Circlespace{' '}
              <Text style={styles.linkText}>Terms of Services</Text>.{'\n'}
              You agree that the information you provide for your Verified subscription is subject to our{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>.
            </Text>
          </View> */}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    width: 37,
    height: 37,
    top: 54,
    left: 20,
    borderRadius: 10,
    padding: 6,
    backgroundColor: Color.black,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    backIcon: {
    width: 24,
    height: 24,
    tintColor: Color.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  logo: {
    width: 180,
    height: 170,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    fontFamily: 'Gilroy-Bold',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0,
    // marginBottom: 40,
  },
  featuresImage: {
    marginBottom: 40,
    alignSelf: 'center',
  },
  featuresContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  joinButton: {
    width: 288,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  joinButtonText: {
    fontSize: 15,
    fontFamily:FontFamilies.extraBold,
    fontWeight: '800',
    color: '#000000',
    
    letterSpacing: 0,
    textAlign: 'center',
  },
  termsContainer: {
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 8,
    fontFamily: 'Gilroy-Medium',
    fontWeight: '400',
    color: '#808080',
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 15,
    letterSpacing: 0,
  },
  linkText: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: 8,
    fontWeight: '400',
    color: '#FFFFFF',
    // textDecorationLine: 'underline',
    lineHeight: 15,
    letterSpacing: 0,
    textAlign: 'center',
  },
});

export default PremiumFeatures; 