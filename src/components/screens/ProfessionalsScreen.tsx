import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {get} from './../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import placeholder from './../../assets/community/profilePlaceholder2.png';
import noresult from './../../assets/quiz/no-results.png';
import {SafeAreaView} from 'react-native-safe-area-context';
import { Color, FontFamilies, FontSizes, LetterSpacings } from '../../styles/constants';
import { isEmpty } from 'lodash';
import chatRequest, { ChatReqResponse } from '../../services/chatRequest';
import apiEndPoints from '../../constants/apiEndPoints';
import { getInitials,getName, getUsername } from '../../utils/commonFunctions';
import { routeToOtherUserProfile } from './notifications/routingForNotification';
const DEFAULT_IMAGE = placeholder;

interface Professional {
  _id: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  username: string;
  profilePic?: string;
  bio?: string;
  address?: {
    city?: string;
    state?: string;
  };
  isVerified?: boolean;
  servicesProvided?: string[];
}

type RootStackParamList = {
  OtherUserProfile: {userId: string; isSelfProfile: boolean; token: string};
  privateChat: {update: number; roomData: any};
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfessionalCard = ({professional, token}: {professional: Professional; token: string}) => {
  console.log('professional', professional);
  const imageSource = professional.profilePic
    ? {uri: professional.profilePic}
    : (
        <View style={styles.initialsAvatar}>
          <Text style={styles.initialsText}>
            {getInitials(
              professional.username
            )}
          </Text>
        </View>
      );
  const navigation = useNavigation<NavigationProp>();
  const routeToProfile = (id: any, accountType: string) => {
    AsyncStorage.getItem('user').then(userData => {
      if (userData) {
          const currentUser = JSON.parse(userData);
          // Check if viewing own profile
          const isSelf = currentUser._id === id || currentUser.id === id;

          if (isSelf) {
              // Navigate to the bottom tab named "ProfileRewamp" for self profile
              navigation.navigate('BottomBar', {
                  screen: 'ProfileScreen',
                  params: {
                      isSelf: true
                  }
              });
          } else {
              // Use routeToOtherUserProfile for other users
              routeToOtherUserProfile(navigation, id, false, token || null, accountType);
          }
      } else {
          // Fallback in case user data can't be retrieved
          routeToOtherUserProfile(navigation, id, false, token || null, accountType);
      }
  }).catch(error => {
      console.error("Error checking user data:", error);
      // Fallback to other user profile on error
  });
  };
  const handleSendMessage = async () => {
    try {
      const user: any = (await AsyncStorage.getItem('user')) ?? '';
      const token: any = (await AsyncStorage.getItem('userToken')) ?? '';
      console.log('User Token:', token);
      
      const userData = JSON.parse(user);
      console.log('User Data:', userData);

      const payload = new FormData();
      payload.append('receiver_id', professional?._id);
      // payload?.append('receiver_username', professional?.businessName);
      payload.append(
        'receiver_username',
        !isEmpty(professional?.firstName && professional?.lastName)
          ? `${professional?.firstName} ${professional?.lastName}`
          : professional?.businessName || professional?.username
      );
      payload.append(
        'receiver_avatar',
        isEmpty(professional?.profilePic)
          ? 'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png'
          : professional?.profilePic,
      );
      payload.append(
        'user_avatar',
        isEmpty(userData?.profilePic)
          ? 'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png'
          : userData?.profilePic,
      );
      payload.append(
        'user_username',
        !isEmpty(userData?.firstName && userData?.lastName)
          ? `${userData?.firstName}  ${userData?.lastName} `
          : userData?.username,
      );
      console.log('Chat Request Payload:', payload);

      const response = await chatRequest(
        apiEndPoints.createRoom,
        'POST',
        payload,
        'multipart/form-data',
      );
      
      console.log('Chat Response:', response);

      if (!response.error) {
        console.log('Room Data:', response?.data?.results?.room);
        // @ts-ignore
        navigation.navigate('privateChat', {
          update: Date.now(),
          roomData: response?.data?.results?.room,
        });
      } else {
        console.error('Chat Error:', response?.message);
        Alert.alert(response?.message);
      }
    } catch (error) {
      console.error('Send Message Error:', error);
    }
  };

  return (
    <TouchableOpacity activeOpacity={1}
    style={styles.card}
    onPress={() => {
      // routeToProfile(professional?._id);
    }}>
      <Card.Content style={styles.cardContent}>
        {professional.profilePic ? (
          <Image source={{uri: professional.profilePic}} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.initialsAvatar}>
            <Text style={styles.initialsText}>
              {getInitials(
                professional.username
              )}
            </Text>
          </View>
        )}
        <View style={styles.info}>
          <View style={styles.nameContainer}>
            <Text style={styles.title}>{getName(professional.businessName || professional.firstName || '', 15)}</Text>
            {(professional?.isPaid) && (
                <Image
                source={require('../../assets/settings/subscription/VerifiedIcon.png')}
                style={styles.verifiedIcon}
                resizeMode="contain"
                fadeDuration={0}
                // Force rendering priority for iOS
                defaultSource={require('../../assets/settings/subscription/VerifiedIcon.png')}
              />
            )}
          </View>
          <Text style={styles.locationText}>@{getUsername(professional.username, 15)}</Text>
          {(professional?.address?.city || professional?.address?.state) && (
            <View style={styles.location}>
              <Image
                style={{height: 13, width: 13, marginRight: 5}}
                source={require('../../assets/community/location.png')}
              />
              <Text style={styles.locationText}>
                {professional.address?.city}
              </Text>
            </View>
          )}
          <Text style={styles.bio} numberOfLines={2} ellipsizeMode="tail">
            {professional?.bio}
            {/* Services: {professional.servicesProvided.join(', ')} */}
          </Text>
          <View style={styles.buttons}>
            <TouchableOpacity  activeOpacity={1}
              style={[styles.button, styles.outlinedButton]}
              onPress={() => {
                routeToProfile(professional?._id, professional?.accountType);
              }}>
              <Text style={styles.outlinedButtonText}>View Profile</Text> 
            </TouchableOpacity>
          {/* Message Button */}
            {/* <TouchableOpacity
              activeOpacity={1}
              style={[styles.button, styles.messageButton]}
              onPress={handleSendMessage} // Replace with your chat screen navigation logic}
            >
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity> */}

          </View>
        </View>
      </Card.Content>
    </TouchableOpacity>
  );
};

const ProfessionalsScreen = ({route}: any) => {
  const {categoryId, title} = route.params;
  console.log('categoryId', categoryId);
  const [token, setToken] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Add this state


  const navigation = useNavigation();
  useEffect(() => {
    // Set the title dynamically
    navigation.setOptions({title: title});
  }, [title]);
  useEffect(() => {
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfessionals();
    }
  }, [token, page]);

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      setToken(savedToken || 'No token found');
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setToken('Error fetching token');
    }
  }, []);

  const fetchProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await get(
        `quiz/get-professionals/${categoryId}?page=${page}&limit=50`,
        {},
        token,
      );
      // if (response && response.professionals.length > 0) {
      //   setProfessionals(prev => [...prev, ...response.professionals]);
      //   setTotalPages(response.totalPages);
      // }
      if (response && response.professionals.length > 0) {
        setProfessionals((prev) => {
          // Remove duplicate professionals
          const existingIds = new Set(prev.map((p: any) => p._id));
          const newProfessionals = response.professionals.filter((p: any) => !existingIds.has(p._id));
  
          return [...prev, ...newProfessionals]; // Append only new items
        });
  
        setTotalPages(response.totalPages);
        
        // Set hasMore based on the total pages and current page
        setHasMore(page + 1 < response.totalPages);
      } else {
        setHasMore(false); // No more professionals to load
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, page, token]);
  

  const loadMoreProfessionals = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  if (loading && professionals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.black} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {professionals.length > 0 ? (
          professionals.map((professional, index) => (
            <ProfessionalCard
              key={index}
              professional={professional}
              token={token}
            />
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Image source={noresult} style={styles.noResultsImage} />
            <Text style={styles.noResultsText}>
              No professionals found for this category
            </Text>
          </View>
        )}
      {/* {professionals.length > 0 && page < totalPages && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={loadMoreProfessionals}>
            <Text style={styles.seeAllButtonText}>Load More Professionals</Text>
          </TouchableOpacity>
        </View>
      )} */}
      {professionals.length > 0 && hasMore && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.seeAllButton} onPress={loadMoreProfessionals}>
            <Text style={styles.seeAllButtonText}>Load More Professionals</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
    // paddingTop: 20, // Added padding to move the content down
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  backButton: {
    backgroundColor: '#FFFFFFCC',
    borderRadius: 10,
    elevation: 2,
    padding: 4,
    justifyContent: 'center',
  },
  scrollViewContent: {
    padding: 15,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    // iOS Shadow Properties
    shadowColor: '#17191B', // Shadow color
    shadowOffset: {width: 0, height: 4}, // Shadow offset: 0px x-axis, 4px y-axis
    shadowOpacity: 0.08, // Opacity equivalent to #17191B14 (14 in hex is around 0.08 in decimal)
    shadowRadius: 12, // Shadow blur radius equivalent to 24px spread in CSS
    // Android Shadow Property
    elevation: 24, // Elevation property for Android
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 50,
    backgroundColor: '#F3F3F3',
  },
  initialsAvatar: {
    width: 72,
    height: 72,
    borderRadius: 50,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 20,
    color: Color.white,
    fontFamily: FontFamilies.semibold,
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: FontSizes.medium2, // Slightly increased font size for better readability
    color: Color.black,
    fontWeight: '800',
    // marginBottom: 4,
    fontFamily: FontFamilies.semibold,
    letterSpacing:LetterSpacings.wide,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locationText: {
    fontSize: FontSizes.small,
    fontWeight: '400',
    color: Color.black,
    fontFamily: FontFamilies.regular,
  },
  bio: {
    color: '#4A4A4A',
    marginTop: 8,
    fontFamily: FontFamilies.regular,
    fontWeight: '400',
    fontSize:FontSizes.small,
    // letterSpacing:LetterSpacings.wide

  },
  buttons: {
    marginTop: 12,
    flexDirection: 'row',
    gap:15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    height: 35,
    paddingHorizontal: 14,
  },
  outlinedButton: {
    // marginRight: 14,
    // borderWidth:1,
    backgroundColor: Color.secondarygrey,
    justifyContent:'center',
    alignItems:'center',
    borderRadius: 12,
    paddingVertical: 8,
    height: 35,
    paddingHorizontal: 14,
  },
  containedButton: {
    backgroundColor: Color.black,
  },
  outlinedButtonText: {
    color: Color.black,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    fontSize: FontSizes.small,
    textAlign: 'center',
  },
  messageButton: {
    backgroundColor: '#1E1E1E', // Customize the background color
  },
  messageButtonText: {
    color: Color.white,
    fontSize: FontSizes.small,
    fontWeight: '400',
    fontFamily:FontFamilies.medium,
  },

  buttonContainer: {
    // position: 'absolute',
    // bottom: 10,
    left: 0,
    right: 0,
    // padding: 15,
    paddingVertical:10,
    paddingHorizontal:5,
    backgroundColor: Color.white,
    borderRadius:12,
  },
  seeAllButton: {
    borderColor: Color.black,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
  },
  seeAllButtonText: {
    color: Color.black,
    fontSize: FontSizes.medium2,
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '20%',
  },
  noResultsImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#4A4A4A',
    fontFamily: FontFamilies.regular,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedIcon: {
    height: 12,
    width: 12,
  },
});

export default ProfessionalsScreen;
