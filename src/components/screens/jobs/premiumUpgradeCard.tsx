import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {get} from '../../../services/dataRequest';
import { Color, FontFamilies } from '../../../styles/constants';

const PremiumUpgradeCard = (token: any) => {
  const flareIcon = require('../../../assets/settings/subscription/unlockButton.png');
  const verifiedTick = require('../../../assets/jobs/verifiedTick.png');
  const navigation = useNavigation();
  const upgradeToPremium = async () => {
    const apiResponse = await get('user/upgrade-account', {}, token);
    if (apiResponse.status === 200) {
      AsyncStorage.setItem('user', JSON.stringify(apiResponse?.user));
      AsyncStorage.setItem('isPaid', JSON.stringify(apiResponse?.user?.isPaid));
      navigation.navigate('Home' as never);
    } else {
      // Alert.alert(data.message);
    }
  };

  const confirmationAlert = () => {
    Alert.alert(
      'Confirm Subscription Upgrade',
      'Are you sure you want to upgrade to the premium subscription?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {text: 'Yes', onPress: () => upgradeToPremium()},
      ],
      {cancelable: false},
    );
  };

  return (
    // <LinearGradient
    //   colors={['#FBE67B', '#F7D14E', '#D4A041']}
    //   start={{x: 0, y: 0}}
    //   end={{x: 1, y: 1}}
    //   style={styles.container}>
     <View style={styles.container}> 
      <Text style={styles.title}>Upgrade to premium</Text>
      <Text style={styles.subtitle}>Enjoy unlimited job posting including</Text>

      <View style={styles.content}>
        <View style={styles.featureContainer}>
          <View style={styles.featureBox}>
            <Image source={verifiedTick} style={styles.verifiedTick} />
            <Text style={styles.featureText}>Category Listing</Text>
          </View>

          <View style={styles.featureBox}>
            <Image source={verifiedTick} style={styles.verifiedTick} />
            <Text style={styles.featureText}>Shared Collections</Text>
          </View>

          <View style={styles.featureBox}>
            <Image source={verifiedTick} style={styles.verifiedTick} />
            <Text style={styles.featureText}>Premium Identity</Text>
          </View>

          <View style={styles.featureBox}>
            <Image source={verifiedTick} style={styles.verifiedTick} />
            <Text style={styles.featureText}>A Verified Badge</Text>
          </View>
        </View>
        <View>
          <TouchableOpacity
            style={styles.unlockButton}
            onPress={() => confirmationAlert()}>
            <Image source={flareIcon} style={styles.flareIcon} />
          </TouchableOpacity>
        </View>
      </View>
      </View>
    // </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
    backgroundColor:Color.black,
  },
  title: {
    fontSize: 18,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
    color: Color.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    color: Color.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 10,
  },
  featureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    margin: 5,
    borderRadius: 10,
    width: '45%',
  },
  verifiedTick: {
    height: 20,
    width: 20,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 11,
    color: '#75644B',
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 15,
  },
  buttonText: {
    color: 'gold',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  unlockButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    width: '100%',
  },
  flareIcon: {
    width: '100%',
    height: '100%',
  },
});

export default PremiumUpgradeCard;
