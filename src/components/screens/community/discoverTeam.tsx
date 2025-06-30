import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import { FontFamilies } from '../../../styles/constants';
const DiscoverTeamScreen = () => {
  const discoverImage = require('../../../assets/community/discoverTeam.png');
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Image Section */}
      <Image source={discoverImage} style={styles.image} />

      {/* Text Section */}
      <Text style={styles.title}>Discover Your Dream Team!</Text>
      <Text style={styles.description}>
        Connect, collaborate, and expand your professional network to bring your
        vision to life or grow your business with meaningful partnerships.
      </Text>

      {/* Button Section */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.navigate('SubscriptionScreen' as never);
        }}>
        <Text style={styles.buttonText}>Start Exploring Now!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 350,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: FontFamilies.bold,
    color: '#1E1E1E',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    margin: 20,
    fontFamily: FontFamilies.medium,
    color: '#88888A',
  },
  button: {
    backgroundColor: '#1E1E1E',
    width: '95%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    margin: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
  },
});

export default DiscoverTeamScreen;
