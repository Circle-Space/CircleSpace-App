/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable prettier/prettier */
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  AppState,
  Dimensions,
  ViewStyle,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {BlurView} from '@react-native-community/blur';
import Community from '../screens/community';
import Jobs from '../screens/jobs/jobs';
import Events from '../screens/events';
import Home from '../screens/home';
// import Profile from '../screens/profile/profile';
import SelfProfilePage from '../screens/profile/profile';
import ImageUploadPage from '../screens/fileUpload';
import BackButton from './customBackHandler';
import SettingRoute from './settingRouteHandler';
import CustomHome from '../screens/postedPost/customHome';
import QuizRoute from './quizRoute';
import profileContentScreen from '../screens/newProfile/profileContent';
import usePushNotification from '../../hooks/usePushNotification';
import SubscriptionScreen from '../screens/profile/setting/subscriptionScreen';
import DiscoverTeamScreen from '../screens/community/discoverTeam';
import {Color, FontFamilies, FontSizes} from '../../styles/constants';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import More from '../screens/more/More';
import GetStartedModal from './getStartedModal';
import ProfileLayout from '../screens/profile/profileRewamp/profileLayout';
import Profile from '../screens/profile/profile';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ProfileHeader from '../screens/profile/profileRewamp/profileHeader';
import FeedWallRewamped from '../screens/rewampedScreens/feedWallRewamped';
import FeedWallExp from '../screens/rewampedExp/feedWallExp';
import ProfileScreen from '../profile/ProfileScreen';
import BusinessPageScreen from '../profile/BusinessPageScreen';
import routes from '../../constants/routes';
import NotificationDebugPanel from '../debug/NotificationDebugPanel';
import PostDetailRewamped from '../screens/rewampedScreens/postDetailRewamped';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const TAB_WIDTH = 140; 


// Icon and label mapping for tabs
const tabIcons: { [key: string]: { active: any; inactive: any } } = {
  FeedWall2: {
    active: require('../../assets/bottombarIcons/activeHomeIcon.png'),
    inactive: require('../../assets/bottombarIcons/homeInactive.png'),
  },
  Community: {
    active: require('../../assets/bottombarIcons/activeProfessionalIcon.png'),
    inactive: require('../../assets/bottombarIcons/TheCIRCLE.png'),
  },
  Events: {
    active: require('../../assets/bottombarIcons/activeEventsIcon.png'),
    inactive: require('../../assets/bottombarIcons/eventsInactive.png'),
  },
  Notifications: {
    active: require('../../assets/bottombarIcons/notificationBlack.png'),
    inactive: require('../../assets/bottombarIcons/notificationBorder.png'),
  },
  ProfileScreen: {
    active: require('../../assets/bottombarIcons/activeProfileIcon.png'),
    inactive: require('../../assets/bottombarIcons/profileInactive.png'),
  },
};
const tabLabels: { [key: string]: string } = {
  FeedWall2: 'Home',
  Community: 'Professionals',
  Events: 'Events',
  Notifications: 'Notification',
  ProfileScreen: 'Profile',
};

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation, bottomBarAnimation }: BottomTabBarProps & { bottomBarAnimation: Animated.Value }) {
  return (
    <Animated.View 
      style={[
        styles.customTabBarContainer,
        {
          transform: [{
            translateY: bottomBarAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0], // Slide up from bottom when hidden
            })
          }],
          opacity: bottomBarAnimation,
        }
      ]}
    >
      <BlurView
        style={styles.blurBackground}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.6)"
      />
      <View style={styles.overlay} />
      <View style={styles.customTabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          if (isFocused) {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.activeTab}
                activeOpacity={0.8}
              >
                <Image source={tabIcons[route.name]?.active || tabIcons[route.name]?.inactive} style={styles.activeIcon} />
                <Text style={styles.activeLabel}>{tabLabels[route.name]}</Text>
              </TouchableOpacity>
            );
          } else {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.inactiveTab}
                activeOpacity={0.8}
              >
                <Image source={tabIcons[route.name]?.inactive} style={styles.inactiveIcon} />
              </TouchableOpacity>
            );
          }
        })}
      </View>
    </Animated.View>
  );
}

const CustomBottomBar = () => {
  const [active, setActive] = useState<string>('Home');
  const [hideBottomBar, setHideBottomBar] = useState(false);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [isSelf, setIsSelf] = useState<boolean | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Scroll-based visibility state
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const bottomBarAnimation = useRef(new Animated.Value(1)).current;
  
  // Add state to track pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStartY, setRefreshStartY] = useState(0);

  // Track if we're currently fetching data to prevent duplicate calls
  const [isFetchingData, setIsFetchingData] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  // const bottomBarHeight = screenHeight * 0.09; // 8% of the screen height
  const bottomBarHeight = Platform.select({
    ios: screenHeight * 0.09, // 9% of the screen height for iOS
    android: screenHeight * 0.1, // Slightly reduced for Android
  });

  // Scroll event listener for bottom bar visibility
  useEffect(() => {
    const handleScroll = (event: any) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      
      // Detect pull-to-refresh gesture (negative scroll values on iOS)
      const isPullToRefresh = currentScrollY < 0;
      
      // If this is a pull-to-refresh gesture, don't hide the bottom bar
      if (isPullToRefresh) {
        // Ensure bottom bar is visible during refresh
        if (!isBottomBarVisible) {
          setIsBottomBarVisible(true);
          Animated.timing(bottomBarAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
        return;
      }
      
      // Only trigger animation if scroll difference is significant and not during refresh
      if (Math.abs(currentScrollY - lastScrollY) > 10 && !isRefreshing) {
        setScrollDirection(direction);
        setLastScrollY(currentScrollY);
        
        if (direction === 'down' && isBottomBarVisible) {
          // Hide bottom bar when scrolling down
          setIsBottomBarVisible(false);
          Animated.timing(bottomBarAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else if (direction === 'up' && !isBottomBarVisible) {
          // Show bottom bar when scrolling up
          setIsBottomBarVisible(true);
          Animated.timing(bottomBarAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }
    };

    // Add global scroll event listener
    const addScrollListener = () => {
      // This will be handled by individual screens
      (global as any).handleScrollForBottomBar = handleScroll;
    };

    addScrollListener();

    return () => {
      // Cleanup
      delete (global as any).handleScrollForBottomBar;
    };
  }, [lastScrollY, isBottomBarVisible, bottomBarAnimation, isRefreshing]);

  // Add global refresh state management
  useEffect(() => {
    // Set up global refresh state handlers
    (global as any).setRefreshState = (refreshing: boolean) => {
      setIsRefreshing(refreshing);
      if (refreshing) {
        // Ensure bottom bar is visible when refresh starts
        setIsBottomBarVisible(true);
        Animated.timing(bottomBarAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    };

    return () => {
      delete (global as any).setRefreshState;
    };
  }, [bottomBarAnimation]);

  // Function to fetch all data - moved to a standalone function for reuse
  const fetchAllData = useCallback(async () => {
    if (isFetchingData) return;
    setIsFetchingData(true);

    try {
      // console.log("Fetching fresh data for tab");

      // Fetch all required data in parallel
      const [profile, accountType, userInfo, paidStatus] = await Promise.all([
        AsyncStorage.getItem('profile'),
        AsyncStorage.getItem('accountType'),
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('isPaid'),
      ]);
      console.log('accountType customBottomBar', accountType);

      // Update user data
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        console.log('userDatacustomBottomBar', userData._id);
        setUserData(userData);
        setUsername(userData.username);
      }

      // Update account type
      if (accountType !== null) {
        setAccountType(accountType);
      }

      // Update paid status
      setIsPaid(paidStatus === 'true');

      // Update profile
      if (profile) {
        setProfile(JSON.parse(profile));
      }

      // Fetch unread notifications count
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        // Refresh notification count
        const apiEndPoints = require('../../constants/apiEndPoints').default;
        const {get} = require('../../services/dataRequest');
        const res = await get(apiEndPoints.unreadCount, {}, savedToken);
        if (res?.count !== undefined) {
          const count = parseInt(res.count, 10) || 0;
          setUnreadNotifications(count);
        }

        // For profile tab, also refresh profile data
        if (active === 'ProfileRewamp' && userInfo) {
          try {
            // Get user ID safely with null check
            const userData = JSON.parse(userInfo);
            const userId = userData?._id;

            if (userId) {
              const profileRes = await get(
                `user/get-user-info/${userId}`,
                {},
                savedToken,
              );
              if (profileRes?.user) {
                await AsyncStorage.setItem(
                  'profile',
                  JSON.stringify(profileRes.user),
                );
                setProfile(profileRes.user);
              }
            }
          } catch (profileError) {
            console.error('Error fetching profile data:', profileError);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsFetchingData(false);
    }
  }, [active, isFetchingData]);

  // Update useFocusEffect to use the centralized fetchAllData function
  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, []),
  );

  // Get new data when tab changes
  const getTitle = (route: any) => {
    const previousTab = active;
    setActive(route.name);
    logTabName(route.name); // Log the tab name
    console.log('route.name', route.name);

    // Reset unread notifications when navigating to Notifications tab
    if (route.name === 'Notifications') {
      setUnreadNotifications(0);
    }

    // Fetch fresh data when tab changes
    if (previousTab !== route.name) {
      fetchAllData();
    }
  };

  const screenOptions: BottomTabNavigationOptions = {
    tabBarShowLabel: false,
    tabBarHideOnKeyboard: true,
    headerShown: true,
    // headerTitleAlign: 'left',
    // tabBarStyle: {
    //   position: 'absolute',
    //   bottom: 0,
    //   right: 0,
    //   left: 0,
    //   height: bottomBarHeight,
    //   elevation: 0,
    //   paddingTop: 10,
    //   backgroundColor: '#fff',
    // },
    tabBarStyle: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
      height: bottomBarHeight,
      elevation: 0,
      backgroundColor: 'transparent',
      borderTopLeftRadius: 34,
      borderTopRightRadius: 34, 
      borderTopWidth: 1,
      borderTopColor: 'rgba(241, 241, 241, 0.3)',
      paddingTop: Platform.select({
        ios: 10,
        android: 5,
      }),
      paddingBottom: Platform.select({
        ios: 25,
        android: 5,
      }),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    } as ViewStyle,
  };

  const logTabName = async (tabName: any) => {
    const flag = await AsyncStorage.getItem('hideBottomBar');
    if (flag !== null) {
      setHideBottomBar(JSON.parse(flag));
    }
    if (tabName == 'Profile') {
      await AsyncStorage.setItem('selfProfile', 'false');
    }
  };

  const headerHeight = Platform.select({
    ios: 110,
    android: 70,
  });
  const paddingTop = Platform.select({
    ios: 0,
    android: 70,
  });
  const navigation = useNavigation();
  const {requestUserPermission, getFCMToken} = usePushNotification(navigation);

  const setupNotifications = useCallback(async () => {
    try {
      const hasPermission = await requestUserPermission();
      if (hasPermission) {
        await getFCMToken();
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  }, [requestUserPermission, getFCMToken]);

  useEffect(() => {
    setupNotifications();
  }, [setupNotifications]);
  // Import the UsernameWithBadge component or create it here
  const UsernameWithBadge = ({username, isProfessional, isPaid}) => {
    const truncatedUsername =
      username?.length > 15 ? `${username.slice(0, 15)}...` : username;

    return (
      <View style={styles.usernameRow}>
        <Text style={styles.username}>{truncatedUsername}</Text>
        {isProfessional && isPaid && (
          <Image
            source={require('../../assets/settings/subscription/VerifiedIcon.png')}
            style={styles.verifiedBadge2}
          />
        )}
      </View>
    );
  };

  // Add this function to handle tab press
  const handleTabPress = (route: string) => {
    if (
      accountType === 'temp' &&
      route !== 'FeedWall2' &&
      route !== 'Community' &&
      route !== 'Events'
    ) {
      // Show the modal instead of navigating
      setIsModalVisible(true);
      return true; // Prevent default navigation
    }
    return false; // Allow default navigation
  };

  const handleSearchPress = () => {
    if (accountType === 'temp') {
      setIsModalVisible(true);
    } else {
      navigation.navigate('feedSearchScreen' as never);
    }
  };
  const navigateToChat = () => {
    if (accountType === 'temp') {
      // setLoginModalVisible(true);
    } else {
      navigation.navigate(routes.chats as never);
    }
  };

  const renderTabIcon = (
    tabName: string,
    label: string
  ) => {
    const isActive = active === tabName;
    const icons = tabIcons[tabName];
    
    if (isActive) {
      return (
        <View style={styles.activeTabContainer}>
          <Image source={icons?.active || icons?.inactive} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{label}</Text>
        </View>
      );
    }
    return (
      <View style={styles.inactiveTabContainer}>
        <Image source={icons?.inactive} style={styles.tabIcon} />
      </View>
    );
  };

  return (
    <>
    {/* <NotificationDebugPanel visible={__DEV__} /> */}
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} bottomBarAnimation={bottomBarAnimation} />}
        screenOptions={screenOptions}
        screenListeners={{
          state: e => {
            AsyncStorage.flushGetRequests();
            const routeName = e.data.state.routes[e.data.state.index].name;
            getTitle({name: routeName});
          },
          tabPress: e => {
            // Check if we should prevent navigation
            if (handleTabPress(e.target?.split('-')[0])) {
              e.preventDefault();
            }
          },
        }}>
        {/* <Tab.Screen
          name="Home"
          // component={Home}
          component={CustomHome}
          options={{
            tabBarIcon: ({focused}) => (
              <View>
                <View
                  style={[
                    styles.container,
                    active === 'Home' && styles.activeBar,
                  ]}>
                  <Image
                    source={
                      active === 'Home'
                        ? require('../../assets/bottombarIcons/homeActive.png')
                        : require('../../assets/bottombarIcons/homeInactive.png')
                    }
                    style={styles.image}
                  />
                </View>
                <Text
                  style={[
                    styles.textStyle,
                    active === 'Home' && styles.textStyle,
                  ]}>
                  Home
                </Text>
              </View>
            ),
            headerLeft: () => <QuizRoute />,
            headerRight: () => (
              
              <TouchableOpacity 
                style={styles.searchIconContainer}
                onPress={handleSearchPress}
              >
                <Image
                  source={require('../../assets/icons/searchIcon.png')}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>
              
            ),
            headerShadowVisible: false,
            headerTitle: '',
            headerStyle: {
              height: headerHeight,
            },
          }}
        /> */}

        {/* new home screen */}
        {/* <Tab.Screen
          name="FeedWall"
          // component={Home}
          component={FeedWallRewamped}
          options={{
            tabBarIcon: ({focused}) => (
              <View>
                <View
                  style={[
                    styles.container,
                    active === 'FeedWall' && styles.activeBar,
                  ]}>
                  <Image
                    source={
                      active === 'FeedWall'
                        ? require('../../assets/bottombarIcons/homeActive.png')
                        : require('../../assets/bottombarIcons/homeInactive.png')
                    }
                    style={styles.image}
                  />
                </View>
                <Text
                  style={[
                    styles.textStyle,
                    active === 'FeedWall' && styles.textStyle,
                  ]}>
                  Feed
                </Text>
              </View>
            ),
            headerLeft: () => <QuizRoute />,
            headerRight: () => (
              
              <TouchableOpacity 
                style={styles.searchIconContainer}
                onPress={handleSearchPress}
              >
                <Image
                  source={require('../../assets/icons/searchIcon.png')}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>
              
            ),
            headerShadowVisible: false,
            headerTitle: '',
            headerStyle: {
              height: headerHeight,
            },
          }}
        /> */}

        {/* new experiemtn screen */}
        <Tab.Screen
          name="FeedWall2"
          component={FeedWallExp}
          options={{
            tabBarIcon: () =>
              renderTabIcon(
                'FeedWall2',
                'Home'
              ),
            headerLeft: () => <QuizRoute />,
            headerRight: () => (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: Platform.OS==="ios"?10:0,
                  //  backgroundColor:'red',
                   width:Platform.OS==="ios"?60:100,
                   justifyContent:"center",
                   alignItems:"center"
                }}>
              {accountType !== 'temp' && (
                <TouchableOpacity
                  onPress={navigateToChat}
                  style={{
                    marginTop:Platform.OS==="ios"?0:7
                  }}
                 >
                      <Ionicons
                  name="chatbubbles-outline"
                  
                  size={20}
                  color={'black'}
                />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.searchIconContainer}
                  onPress={handleSearchPress}>
                  <Image
                    source={require('../../assets/icons/searchIcon.png')}
                    style={styles.searchIcon}
                  />
                </TouchableOpacity>
              </View>
            ),
            headerShadowVisible: false,
            headerTitle: '',
            headerStyle: {
              height: headerHeight,
            },
          }}
        />

        {/* {(accountType === 'admin' || isSelf) && ( */}
        <Tab.Screen
          name="Community"
          component={Community}
          // component={isPaid ? Community : DiscoverTeamScreen}
          // component={DiscoverTeamScreen}
          options={{
            tabBarIcon: () =>
              renderTabIcon(
                'Community',
                'Professionals'
              ),
            headerShown: false,
            headerLeft: () => <QuizRoute />,
            headerTitleAlign: 'center',
            headerTitle: '',
            headerTitleStyle: {
              fontSize: FontSizes.medium2,
              fontFamily: FontFamilies.bold,
              textAlign: 'center',
              marginTop: 10,
              fontWeight: '800',
              color: Color.black,
            },
            headerShadowVisible: false,
            headerStyle: {
              height: headerHeight,
            },
          }}
        />
        {/* )} */}
        <Tab.Screen
          name="Events"
          component={Events}
          options={{
            tabBarIcon: () =>
              renderTabIcon(
                'Events',
                'Events'
              ),
            headerShown: false,
            headerLeft: () => <QuizRoute />,
            headerTitle: 'Events',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: FontSizes.medium2,
              fontFamily: FontFamilies.bold,
              textAlign: 'center',
              marginTop: 10,
              fontWeight: '800',
              color: Color.black,
            },
            headerShadowVisible: false,
            headerStyle: {
              height: headerHeight,
            },
          }}
        />
        {/* {accountType != 'temp' ? (
          <Tab.Screen
            name="Upload"
            component={ImageUploadPage}
            options={{
              tabBarIcon: ({focused}) => (
                <View>
                  <View
                    style={[
                      styles.container,
                      active === 'Upload' && styles.activeBar,
                    ]}>
                    <Image
                      source={
                        active === 'Upload'
                          ? require('../../assets/bottombarIcons/fileUploadActive.png')
                          : require('../../assets/bottombarIcons/fileUploadInactive.png')
                      }
                      style={styles.image}
                    />
                  </View>
                </View>
              ),
            }}
          />
        ) : null} */}

        {/* <Tab.Screen
          name="More"
          component={More}
          options={{
            tabBarIcon: ({focused}) => (
              <View>
                <View
                  style={[
                    styles.container,
                    active === 'More' && styles.activeBar,
                  ]}>
                  <Image
                    source={
                      active === 'More'
                        ? require('../../assets/bottombarIcons/moreWhite.png')
                        : require('../../assets/bottombarIcons/moreBorder.png')
                    }
                    style={styles.image}
                  />
                </View>
                <Text
                  style={[
                    styles.textStyle,
                    active === 'More' && styles.textStyle,
                  ]}>
                  More
                </Text>
              </View>
            ),
            headerTitle: '',
            headerShadowVisible: false,
            headerStyle: {
              height: headerHeight,
            },
            // headerLeft: () => <QuizRoute />,
          }}
        /> */}

        {/* <Tab.Screen
          name="Jobs"
          component={Jobs}
          options={{
            tabBarIcon: ({focused}) => (
              <View>
                <View
                  style={[
                    styles.container,
                    active === 'Jobs' && styles.activeBar,
                  ]}>
                  <Image
                    source={
                      active === 'Jobs'
                        ? require('../../assets/bottombarIcons/jobsActive.png')
                        : require('../../assets/bottombarIcons/jobsInactive.png')
                    }
                    style={styles.image}
                  />
                </View>
                <Text
                  style={[
                    styles.textStyle,
                    active === 'Jobs' && styles.textStyle,
                  ]}>
                  Jobs
                </Text>
              </View>
            ),
            headerTitle: '',
            headerShadowVisible: false,
            headerStyle: {
              height: headerHeight,
            },
            headerLeft: () => <QuizRoute />,
          }}
        /> */}
        {accountType != '' && (
          <Tab.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
                          tabBarIcon: () =>
              renderTabIcon(
                'Notifications',
                'Notification'
              ),
              headerShown: false,
              // headerLeft: () => <QuizRoute />,
              // headerShadowVisible: false,
              // headerTitle: 'Notifications',
              // headerTitleAlign: 'center',
              // headerTitleStyle: {
              //   fontSize: FontSizes.medium2,
              //   fontFamily: FontFamilies.bold,
              //   textAlign: 'center',
              //   marginTop: 10,
              //   fontWeight: '800',
              //   color: Color.black,
              // },
            }}
          />
        )}
        {/* {accountType != '' && (
          <Tab.Screen
            name="Profile"
            component={SelfProfilePage}
            initialParams={{ tab: 'Posts' }}  // Add default tab parameter
            options={{
              tabBarIcon: ({focused}) => (
                <View>
                  <View
                    style={[
                      styles.container,
                      active === 'Profile' && styles.activeBar,
                    ]}>
                    <Image
                      source={
                        active === 'Profile'
                          ? require('../../assets/bottombarIcons/profileActive.png')
                          : require('../../assets/bottombarIcons/profileInactive.png')
                      }
                      style={styles.image}
                    />
                  </View>
                  <Text
                    style={[
                      styles.textStyle,
                      active === 'Profile' && styles.textStyle,
                    ]}>
                    Profile
                  </Text>
                </View>
              ),
              headerShown: true,
              headerStyle:{
                height:headerHeight,
              },
              headerTitleAlign:'left',
              headerLeft: () => (
                  <View style={{
                    flexDirection:'row', 
                    justifyContent:'center',
                    alignItems:'center',
                    gap: -8, // Reduced gap between image and text
                  }}>
                  <Image 
                    source={require('../../assets/header/CSLogo.png')} 
                    style={{
                      width:45,
                      height:45,
                    }}
                  />
                  <UsernameWithBadge 
                    username={username}
                    isProfessional={userData?.accountType === 'professional'}
                    isPaid={userData?.isPaid}
                  />
                  </View>
              ),
              headerLeftContainerStyle: {
                flexDirection:'row',
                paddingLeft: 10,
                justifyContent:'center',
                alignItems:'center',
              },
              headerTitle: '',
              // headerTitle: () => (
              //   <View style={{flexDirection: 'row', gap:5, alignItems:'center'}}>
              //     <View style={{width:20,height:20,backgroundColor:'red',borderRadius:10, justifyContent:'center',alignItems:'center'}}>
              //       <Image source={require('../../assets/header/CSLogo.png')} style={{width:'100%',height:'100%'}}/>
              //     </View>
              //     <Text style={{ fontSize: 18, fontWeight: '400', fontFamily: FontFamilies.bold,color:Color.black}}>{username}</Text>
              //   </View>
              // ),
              headerShadowVisible: false,
              headerRight: () =>
                accountType == 'temp' ? null : <SettingRoute profile={userData}/>,
              // headerLeft: () => <BackButton />,
            }}
            
            
          />
        )} */}
        {/* {accountType != '' && (
          <Tab.Screen
            name="ProfileRewamp"
            component={ProfileLayout}
            initialParams={{tab: 'Posts'}} // Add default tab parameter
            options={{
              tabBarIcon: ({focused}) => (
                <View>
                  <View
                    style={[
                      styles.container,
                      active === 'ProfileRewamp' && styles.activeBar,
                    ]}>
                    <Image
                      source={
                        active === 'ProfileRewamp'
                          ? require('../../assets/bottombarIcons/profileActive.png')
                          : require('../../assets/bottombarIcons/profileInactive.png')
                      }
                      style={styles.image}
                    />
                  </View>
                  <Text
                    style={[
                      styles.textStyle,
                      active === 'ProfileRewamp' && styles.textStyle,
                    ]}>
                    Profile
                  </Text>
                </View>
              ),
              headerShown: true,
              headerStyle: {
                height: headerHeight,
              },
              headerTitleAlign: 'left',
              headerLeft: () => (
                <ProfileHeader
                  username={username}
                  userData={userData}
                  setOpenShare={() => {}}
                  setShowProfileOptions={() => {}}
                />
              ),
              headerLeftContainerStyle: {
                flexDirection: 'row',
                paddingLeft: 10,
                justifyContent: 'center',
                alignItems: 'center',
              },
              headerTitle: '',
              headerShadowVisible: false,
              headerRight: () =>
                accountType == 'temp' ? null : (
                  <SettingRoute profile={userData} />
                ),
            }}
          />
        )} */}
        {accountType != '' && (
          <Tab.Screen
            name="ProfileScreen"
            component={
              accountType === 'professional'
                ? BusinessPageScreen
                : ProfileScreen
            }
            initialParams={{isSelf: true}}
            options={{
              tabBarIcon: () =>
                renderTabIcon(
                  'ProfileScreen',
                  accountType === 'professional' ? 'Profile' : 'Profile'
                ),
              headerShown: false,
              headerStyle: {
                height: headerHeight,
              },
              headerTitleAlign: 'left',
              headerLeft: () => (
                <ProfileHeader
                  username={username}
                  userData={userData}
                  setOpenShare={() => {}}
                  setShowProfileOptions={() => {}}
                />
              ),
              headerLeftContainerStyle: {
                flexDirection: 'row',
                paddingLeft: 10,
                justifyContent: 'center',
                alignItems: 'center',
              },
              headerTitle: '',
              headerShadowVisible: false,
              headerRight: () =>
                accountType == 'temp' ? null : (
                  <SettingRoute profile={userData} />
                ),
            }}
            
          />
          
        )}
        {/* <Tab.Screen
          name="PostDetailRewamped"
          component={PostDetailRewamped}
          options={{
            tabBarButton: () => null, // Hides the screen from the bottom tab bar
            headerShown: false, // Customize header as needed
          }}
        /> */}
      </Tab.Navigator>

      {/* Render the GetStartedModal */}
      <GetStartedModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
};

export default CustomBottomBar;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginHorizontal: 'auto',
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
  },
  image: {
    width: 25,
    height: 25,
    alignSelf: 'center',
  },
  textStyle: {
    fontSize: FontSizes.extraSmall,
    color: Color.black,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    textAlign: 'center',
    marginTop: 0,
    width: 75, // Fixed width for text container
    alignSelf: 'center',
  },
  activeTextStyle: {
    marginTop: 0,
    color: Color.black,
  },
  activeBar: {
    backgroundColor: 'rgba(30, 30, 30, 1)',
    borderRadius: Platform.OS === 'ios' ? 25 : 30,
    alignSelf: 'center',
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: FontFamilies.semibold,
  },
  username: {
    fontSize: FontSizes.medium2,
    fontWeight: '800',
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  verifiedBadge2: {
    height: 12,
    width: 12,
    marginLeft: 2,
    // tintColor: Color.white,
  },
  searchIconContainer: {
    padding: Platform.OS === 'ios' ? 0 : 20,
    marginTop: Platform.OS === 'ios' ? 0 : 8,
    marginRight: 30,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: Color.black,
  },
  tabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabContainer: {
    width: TAB_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignSelf: 'center',
  },
  inactiveTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  customTabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: 'hidden',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  customTabBar: {
    flexDirection: 'row',
    // backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingVertical: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  inactiveTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginHorizontal: 4,
  },
  activeIcon: {
    width: 27,
    height: 27,
    marginRight: 8,
  },
  inactiveIcon: {
    width: 27,
    height: 27,
  },
  activeLabel: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: Color.black,
  },
});
