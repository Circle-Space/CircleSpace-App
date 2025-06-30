/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const logoSize = Math.min(width * 0.7, 300); // 70% of screen width, max 300px

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkToken = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'BottomBar' }],
        });
      } else {
        const timeout = setTimeout(() => {
          navigation.navigate('Landing');
        }, 1500);
        return () => clearTimeout(timeout);
      }
    };
    checkToken();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/splash-icon.png')} 
          style={[styles.logo, { width: logoSize, height: logoSize }]}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    alignSelf: 'center',
  },
});

export default SplashScreen;
