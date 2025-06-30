import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';
import { FontFamilies } from '../../styles/constants';

const CustomFAB = ({
  accountType,
  isOpen = false,
  onToggle,
}: {
  accountType: any;
  isOpen?: boolean;
  onToggle: any;
}) => {
  const [menuOpen, setMenuOpen] = useState(isOpen);
  const animation = new Animated.Value(0);
  useEffect(() => {
    if (menuOpen !== isOpen) {
      setMenuOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    const toValue = menuOpen ? 1 : 0;
    // Trigger animation whenever `menuOpen` changes
    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, []);

  // const toggleMenu = () => {
  //   const newState = !menuOpen;
  //   setMenuOpen(newState);
  //   if (onToggle) onToggle(); // Notify parent
  // };
  const toggleMenu = () => {
    if (accountType?.trim().toLowerCase() === 'temp') {
      if (onToggle) onToggle(true); // Notify parent to open login bottom sheet
      return; // Stop further execution
    }
  
    const newState = !menuOpen;
    setMenuOpen(newState);
    if (onToggle) onToggle(false); // Notify parent to toggle FAB menu
  };
  

  // const toggleMenu = () => {
  //   const toValue = menuOpen ? 0 : 1;

  //   Animated.timing(animation, {
  //     toValue,
  //     duration: 300,
  //     easing: Easing.linear,
  //     useNativeDriver: true,
  //   }).start();

  //   setMenuOpen(!menuOpen);
  //   if (onToggle) onToggle();
  // };

  const button1Style = {
    right: 10,
    bottom: 100,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
    ],
  };

  const button2Style = {
    right: 60,
    bottom: 60,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -100],
        }),
      },
    ],
  };

  const button3Style = {
    right: 60,
    top: 60,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 70],
        }),
      },
    ],
  };

  const button4Style = {
    right: 10,
    top: 100,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140],
        }),
      },
    ],
  };

  const addIconBG = require('../../assets/profile/postIcons/plus.png');
  const postIcon = require('../../assets/profile/postIcons/posts.png');
  const projectIcon = require('../../assets/profile/postIcons/Project.png');
  const catalogIcon = require('../../assets/profile/postIcons/catalog.png');
  const downloadIcon = require('../../assets/profile/postIcons/draft.png');

  const navigation = useNavigation();
  return accountType && accountType.accountType?.trim().toLowerCase() !== 'temp' ? (
    <View style={styles.container}>
      {menuOpen && (
        <>
          {/* Circular overlay for the menu */}
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={toggleMenu}
          >
          {/* Blur Effect */}
          <BlurView
            style={styles.blurEffect}
            blurType="light" // Options: "light", "dark", "extraLight"
            blurAmount={5} // Adjust for stronger blur
            reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.3)"
          />
          </TouchableOpacity>

          {accountType == 'professional' ? (
            <>
              <Animated.View style={[styles.buttonContainer, button1Style]}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate('UploadFile' as never);
                  }}>
                  <Image source={postIcon} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.label}>Post</Text>
              </Animated.View>
              <Animated.View style={[styles.buttonContainer, button2Style]}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate('UploadProjects' as never);
                  }}>
                  <Image source={projectIcon} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.label}>Project</Text>
              </Animated.View>
              <Animated.View style={[styles.buttonContainer, button3Style]}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate('UploadCatalog' as never);
                  }}>
                  <Image source={catalogIcon} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.label}>Catalog</Text>
              </Animated.View>
              <Animated.View style={[styles.buttonContainer, button4Style]}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate('GetDrafts' as never);
                  }}>
                  <Image source={downloadIcon} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.label}>Drafts</Text>
              </Animated.View>
            </>
          ) : (
            <>
              <Animated.View style={[styles.buttonContainer, button2Style]}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate('UploadFile' as never);
                  }}>
                  <Image source={postIcon} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.label}>Post</Text>
              </Animated.View>
              <Animated.View style={[styles.buttonContainer, button3Style]}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate('GetDrafts' as never);
                  }}>
                  <Image source={downloadIcon} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.label}>Drafts</Text>
              </Animated.View>
            </>
          )}
        </>
      )}

      <TouchableOpacity style={styles.menuButton1} onPress={toggleMenu}>
        <ImageBackground source={addIconBG} style={styles.backgroundImage}>
          <Icon name="add" style={styles.icon1} size={20} color="white" />
        </ImageBackground>
      </TouchableOpacity>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  // container: {
  //   position: 'absolute',
  //   bottom: '22%',
  //   right: 0,
  //   zIndex: 1,
  //   alignItems: 'center',
  // },
  // menuOverlay: {
  //   position: 'absolute',
  //   width: 235,
  //   height: 250,
  //   borderRadius: 125,
  //   // backgroundColor: 'rgba(255, 255, 255,1)',
  //   top: -72,
  //   right: -105,
  //   zIndex: 0,
  //   opacity: 0.9,
  // },
  container: {
    position: 'absolute',
    bottom: '22%',
    right: 0,
    zIndex: 1,
    alignItems: 'center',
  },
  menuOverlay: {
    position: 'absolute',
    width: 235, // Adjust based on UI size
    height: 250,
    borderRadius: 125, // Ensures circular effect
    top: -72,
    right: -105,
    zIndex: 0,
    overflow: 'hidden', // Ensures blur does not extend outside
  },
  blurEffect: {
    ...StyleSheet.absoluteFillObject, // Expands to fit menuOverlay
    borderRadius: 125,
  },
  buttonContainer: {
    // margin:5,
    // paddingTop: 5,
    height: 56,
    width: 50,
    position: 'absolute',
    alignItems: 'center',
    // zIndex: 1,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 11.2,
    padding: 11.2,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    marginTop: 5,
    color: '#1E1E1E',
    fontSize: 12,
    fontFamily: FontFamilies.medium,
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: '#232323',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    width: 20,
    height: 20,
  },
  menuButton1: {
    height: 101,
    width: 40,
    justifyContent: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  icon1: {
    marginRight: 10,
    marginLeft: 15,
  },
});

export default CustomFAB;
