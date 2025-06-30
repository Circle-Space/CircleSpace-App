import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import routes from '../../constants/routes';
import LoginBottomSheet from './loginBottomSheet';
import { Color } from '../../styles/constants';

import CustomIcons from '../../constants/CustomIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { get, post } from '../../services/dataRequest';
import apiEndPoints from '../../constants/apiEndPoints';

const QuizRoute = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Get current route
  const [accountType, setAccountType] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  // Fetch user data from AsyncStorage when the screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      // Fetch data whenever the screen is focused
      const accountType_ = await AsyncStorage.getItem('accountType');
      const isPaid_ = await AsyncStorage.getItem('isPaid');
      setAccountType(accountType_!);
      setIsPaid(isPaid_ === 'true');
    });

    // Clean up the listener when the component is unmounted
    return unsubscribe;
  }, [navigation]);

  const navigateToChat = () => {
    if (accountType === 'temp') {
      setLoginModalVisible(true);
    } else {
      navigation.navigate(routes.chats as never);
    }
  };

  const navigateToNotificationList = () => {
    if (accountType === 'temp') {
      setLoginModalVisible(true);
    } else {
      navigation.navigate(routes.notifications as never);
    }
  };
  const pathname = useRoute()
  const [count, setCount] = useState(0);
  const handleGetUnreadCount = async () => {
    const savedToken = await AsyncStorage.getItem('userToken');
    await get(apiEndPoints.unreadCount, {}, savedToken)
      .then(res => {
        console.log('count', res);
        setCount(res?.count);
      })
      .catch(e => {
        console.log('error', e);
      });
  };
  useEffect(() => {
    handleGetUnreadCount();
  }, [pathname?.name]);
  // console.log('pathname',)
  const handleReadAll = async () => {
    const savedToken = await AsyncStorage.getItem('userToken');
    await get(apiEndPoints.readAllNoti, {}, savedToken)
      .then(res => {
        console.log('reda all', res);
        if (res?.status === 200) {
          setCount(0);
          navigation.navigate(routes.notifications);
        }
      })
      .catch(e => {
        console.log('read all error', e);
      });
  };
  return (
    // <>
    //   {!isPaid && route.name === 'Community' ? (
    //     <ImageBackground
    //       source={require('../../assets/settings/subscription/cardBG.png')}
    //       style={styles.imageBackground}
    //       resizeMode="repeat">
    //       <View
    //         style={{
    //           flexDirection: 'row',
    //           justifyContent: 'space-between',
    //           paddingHorizontal: 10,
    //           width: Dimensions.get('window').width,
    //         }}>
    //         <View>
    //           <Image
    //             source={require('../../assets/header/circlespaceHeaderLogo.png')}
    //             style={styles.icon}
    //           />
    //         </View>

    //         <TouchableOpacity
    //           onPress={navigateToChat}
    //           style={{...styles.messageicon}}>
    //           {/* <Ionicons
    //             name="chatbubbles-outline"
    //             style={{
    //               marginTop: 2,
    //             }}
    //             size={30}
    //             color={'black'}
    //           /> */}
    //         <Image 
    //           source={require('../../assets/icons/message.png')} 
    //           style={styles.messageicon} 
    //         />
    //         </TouchableOpacity>
    //         {loginModalVisible && (
    //           <LoginBottomSheet
    //             visible={loginModalVisible}
    //             onClose={() => {
    //               setLoginModalVisible(false);
    //             }}
    //             showIcon={true}
    //           />
    //         )}
    //       </View>
    //     </ImageBackground>
    // ) : (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: Dimensions.get('window').width,
        paddingHorizontal: 15,
        paddingBottom: Platform.OS === 'ios' ? 10 : 0,
      }}>
      {route.name === 'Home' || route.name === 'FeedWall' || route.name === 'FeedWall2' && (
        <View>
          <Image
            source={require('../../assets/header/circlespaceHeaderLogo.png')}
            style={styles.icon}
          />
        </View>
      )}
      {/* {route.name === 'Community' && (
        <View>
          <Image
            source={require('../../assets/header/CSLogo.png')}
            style={styles.icon2}
          />
        </View>
      )} */}


      {/* <View style={{ flexDirection: 'row' , gap:10}}>
        <TouchableOpacity
          onPress={navigateToChat}
          style={{ ...styles.iconbackground, alignSelf: 'center' }}>
          <Image
            source={require('../../assets/icons/message.png')}
            style={styles.messageicon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={navigateToNotificationList}
          style={{ ...styles.iconbackground, alignSelf: 'center' }}>
          <Image
            source={require('../../assets/icons/notificationIcon.png')}
            style={styles.messageicon}
          />
        </TouchableOpacity>
      </View> */}
      {loginModalVisible && (
        <LoginBottomSheet
          visible={loginModalVisible}
          onClose={() => {
            setLoginModalVisible(false);
          }}
          showIcon={true}
        />
      )}
    </View>
    // )}
    // </>
  );
};

export default QuizRoute;

const styles = StyleSheet.create({
  icon: {
    flexGrow: 1,
    marginTop: 10,
    marginLeft: 5,
    height: 37,
    width: 127,
    justifyContent: 'center',
    objectFit: 'contain'
  },
  icon2: {
    height: 80,
    width: 80,
    left: -15,
    marginTop: 20,
  },
  iconbackground: {
    height: 37,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.white,
    borderRadius: 10,
    padding: 20,
    elevation: Platform.OS === 'android' ? 1 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
    }),
  },
  messageicon: {
    height: 20,
    width: 20,
  },
  imageBackground: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    borderRadius: 10,
  },
  overlayText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
