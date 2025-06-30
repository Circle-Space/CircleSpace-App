import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { FontFamilies } from '../../../../styles/constants';
const AboutUsPage = ({navigation}: any) => {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.contentContainer}>
        <Image
          source={require('../../../../assets/header/circlespaceHeaderLogo.png')} // replace with your logo path
          style={styles.logo}
        />
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>
            India’s Interior Design SuperApp
          </Text>
          <Text style={styles.descriptionText}>
            Whether you’re a professional looking to expand your business or a
            homeowner seeking the perfect design partner, CircleSpace makes it
            all possible.
          </Text>

          <View style={styles.keyFeaturesContainer}>
            <Text style={styles.keyFeature}>
              <Text style={styles.keyTitle}>Discover Inspiration: </Text>
              <Text style={styles.keySubTitle}>
              Browse through a vast collection of design ideas and photos to
              find the perfect inspiration for your next project.
            </Text></Text>
            <Text style={styles.keyFeature}>
              <Text style={styles.keyTitle}>Professional Network: </Text>
              <Text style={styles.keySubTitle}>
              Connect and collaborate with architects, interior designers,
              vendors, brands and other professionals to bring your design
              visions to life.
              </Text>
            </Text>
            <Text style={styles.keyFeature}>
              <Text style={styles.keyTitle}>Personalised Profiles: </Text>
              <Text style={styles.keySubTitle}>
              Create and showcase your unique design style with a custom profile
              that reflects your creative identity.</Text>
            </Text>
            <Text style={styles.keyFeature}>
              <Text style={styles.keyTitle}>Job Portal: </Text>
              <Text style={styles.keySubTitle}>Find and post job
              opportunities tailored to the interior design and architecture
              industry. Connect with the right talent for your projects.</Text>
            </Text>
            <Text style={styles.keyFeature}>
              <Text style={styles.keyTitle}>Events: </Text>
              <Text style={styles.keySubTitle}>Stay updated with the
              latest events and trends in the architecture and interior design
              industry.</Text>
            </Text>
            <Text style={styles.keyFeature}>
              <Text style={styles.keyTitle}>Project Management Tools: </Text>
              <Text style={styles.keySubTitle}>
              Coming soon!</Text>
            </Text>
          </View>
        </View>
        <Text style={styles.query}>
          For any questions or concerns, please reach out to us at{'\n'}
          <Text
            style={[
              styles.query,
              {
                color: 'blue',
                textDecorationLine: 'underline',
                textAlign: 'center',
                lineHeight: 20,
              },
            ]}
            onPress={() => Linking.openURL('mailto:info@circlespace.in')}>
            info@circlespace.in
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
  },
  contentContainer: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  logo: {
    width: 165,
    height: 134,
    marginVertical: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: FontFamilies.extraBold,
    color: 'black',
  },
  version: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 40,
    fontFamily: FontFamilies.regular,
  },
  descriptionContainer: {
    backgroundColor: '#F9F8F8',
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  descriptionTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    color: '#1E1E1E',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight:14,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 20,
  },
  keyFeature: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'left',
    marginBottom: 10,
  },
  keyTitle: {
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    color: '#1E1E1E',
    fontSize: 13,
    lineHeight:16,
  },
  keySubTitle: {
    fontSize: 12,    
    color: '#4A4A4A',
    fontWeight: '400',
    lineHeight:16,
    fontFamily: FontFamilies.medium,
  },
  query: {
    fontSize: 12,
    fontWeight:'400',
    color:'#4A4A4A',
    marginVertical: 15,
    fontFamily: FontFamilies.medium,
    textAlign: 'center',
  },
});

export default AboutUsPage;
