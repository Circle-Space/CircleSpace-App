import React, {useState} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import {Notification} from './NotificationList';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import {useNavigation} from '@react-navigation/native';
import routes from '../../../constants/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {post} from '../../../services/dataRequest';
import {useDispatch} from 'react-redux';
import {setUpdate} from '../../../redux/reducers/chatSlice';
import RealtiveTime from './RelativeTime';
import CustomIcons from '../../../constants/CustomIcons';
import { FontFamilies } from '../../../styles/constants';
interface NewJobsNotificationCardProps {
  notification: Notification;
}
const NewJobsNotificationCard: React.FC<NewJobsNotificationCardProps> = ({
  notification,
}) => {
  // console.log('NewJobsNotificationCard', notification);
  const navigation = useNavigation();
  const userId = useCurrentUserId();
  const [isFollowing, setisFollowing] = useState(
    notification?.data?.isFollowing,
  );
  const routeToProfile = async (id: any) => {
    try {
      const account_ = await AsyncStorage.getItem('user');
      const currentUser = JSON.parse(account_ || '{}')._id;
      const savedToken = await AsyncStorage.getItem('userToken');
      // Determine which profile screen to navigate to
      const screen = userId !== id ? 'OtherUserProfile' : 'Profile';
      if (screen == 'OtherUserProfile') {
        navigation.navigate('OtherUserProfile', {
          userId: id,
          isSelfProfile: false,
          token: savedToken,
        });
      }
      // Navigate to the appropriate screen
      navigation.navigate(screen, {id});
    } catch (error) {
      console.error('Error routing to profile:', error);
    }
  };
  const dispatch = useDispatch();
  const followUser = async () => {
    try {
      const action = isFollowing ? 'unfollow' : 'follow';
      const response = await post(
        `user/toggle-follow/${notification?.data?.followerId}`,
        {},
      );
      if (response.status === 200) {
        console.log('follow usccs', response);
        Alert.alert(response?.message);
        setisFollowing(!isFollowing);
      }
      if (!response) {
        throw new Error(`Failed to ${action} the user`);
      }
    } catch (error) {
      console.error(
        `Error trying to ${isFollowing ? 'unfollow' : 'follow'} the user:`,
        error,
      );
    }
  };
  return (
    <Pressable
      onPress={() => {
        routeToProfile(notification?.data?.followerId);
      }}
      style={{
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        alignSelf: 'center',
      }}>
      {/* <Image
        style={{
          backgroundColor: '#D9D9D9',
          width: 36,
          height: 36,
          borderRadius: 72,
        }}
        source={{
          uri:
            notification?.data?.profilePicture ??
            'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
        }}
      /> */}
      <CustomIcons type='JOB' width={36} height={36}/>
      <Text
        numberOfLines={3}
        style={{
          fontFamily: FontFamilies.medium,
          fontWeight: '400',
          fontSize: 13,
          maxWidth: '65%',
          width: '60%',
          lineHeight: 18,
          color:"#111",
        }}>
        <Text
          style={{
            fontFamily: FontFamilies.semibold,
            fontWeight: '500',
          }}>
       {notification?.title}
        </Text>{' '}
        {notification?.message??'Explore and apply to relevant jobs 🔍'}  {<RealtiveTime updatedAt={notification?.createdAt} />}
      </Text>
      <TouchableOpacity
        onPress={() => {
        //   followUser();
        navigation.navigate('JobsScreeen')
        }}
        style={{
          backgroundColor: '#EBEBEB',
          width: '26%',
          height: 36,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
        }}>
        <Text
          style={{
            color: '#1E1E1E',
            fontFamily: FontFamilies.semibold,
            fontWeight: '400',
            fontSize: 12,
            
          }}>
          {'View Jobs'}
        </Text>
      </TouchableOpacity>
    </Pressable>
  );
};
export default NewJobsNotificationCard;
