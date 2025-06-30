import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {PrivateMessage} from './PrivateChat';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import {isEmpty} from 'lodash';
import {truncateText} from '../../jobs/utils/utils';
import MessageTime from './MessageTime';
import {setMessageOptionEnable} from '../../../../redux/reducers/chatSlice';
import {Divider} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import { FontFamilies } from '../../../../styles/constants';
interface ShareProfileMessageProps {
  message: PrivateMessage | any;
  
}
const ShareProfileMessage: React.FC<ShareProfileMessageProps> = ({message}) => {
  const dispatch = useDispatch();
  const userId = useCurrentUserId();
  const navigation = useNavigation();
  const parsedObject = message
    ? isEmpty(message?.payload)
      ? null
      : JSON.parse(message?.payload)
    : null;
  const routeToBusinessDetail = async (profile: any) => {
    console.log('profile head data :', profile);
    // const profile: any = await AsyncStorage.getItem('user');
    // const cleanedProfile = JSON.parse(profile);
    //@ts-ignore
    navigation.navigate('ViewBusinessProfile', profile);
  };
  const handleUsernamePress = async (uid: string,accountType:string) => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const account_ = await AsyncStorage.getItem('user');
      const currentUser = JSON.parse(account_ || '{}')._id;
      const screen = currentUser !== uid ? 'OtherUserProfile' : 'Profile';
      const account_id = uid;
      
      if (uid === currentUser) {
        // If it's the user's own profile, navigate through BottomBar
        navigation.navigate('BottomBar', {
          screen: 'ProfileScreen',
          params: {
            isSelf: true
          }
        });
      } else {
        // Check if the profile is personal or professional
        if (accountType === 'professional') {
          // Navigate to business profile screen
          navigation.navigate('otherBusinessScreen', {
            userId: uid,
            isSelf: false
          });
        } else {
          // Navigate to personal profile screen
          navigation.navigate('otherProfileScreen', {
            userId: uid,
            isSelf: false
          });
        }
      }
    } catch (error) {
      console.error('Error routing to profile:', error);
    }
  };
  return (
    <React.Fragment>
      <Pressable
        onPress={() => {
          handleUsernamePress(parsedObject?.user?.id,parsedObject?.user?.accountType);
        }}
        onLongPress={() => {
          dispatch(setMessageOptionEnable(message));
        }}
        style={{
          //   width: '60%',
          alignSelf: userId === message?.user_id ? 'flex-end' : 'flex-start',
          backgroundColor: userId === message?.user_id ? '#EED7B9' : 'lightgray',
          borderBottomRightRadius: userId === message?.user_id ? 0 : 14,
          borderBottomLeftRadius: userId === message?.user_id ? 14 : 0,
          borderRadius: 18,
          padding: 10,
          gap: 0,
          paddingTop: parsedObject?.user?.servicesProvided?.length > 0 ? 0 : 10,
          paddingBottom:
            parsedObject?.user?.servicesProvided?.length > 0 ? 0 : 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            gap: parsedObject?.user?.servicesProvided?.length > 0 ? 5 : 10,
            alignItems: 'center',
          }}>
          {parsedObject?.user?.servicesProvided?.length > 0 ? null : (
            <Image
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
              }}
              source={{
                uri: parsedObject?.user?.profile,
              }}
            />
          )}
          <View
            style={
              parsedObject?.user?.servicesProvided?.length > 0
                ? {
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                    gap: 5,
                  }
                : {}
            }>
            {parsedObject?.user?.servicesProvided?.length > 0 ? (
            null
            ) : null}
            <Text
              style={{
                fontFamily: FontFamilies.semibold,
                fontWeight: '400',
                fontSize: 14,
                color: '#1E1E1E',
              }}>
              {parsedObject?.user?.profileDetails?.name}
            </Text>
            <Text
              style={{
                fontFamily: FontFamilies.semibold,
                fontWeight: '400',
                fontSize: 13,
                color: '#4A4A4A',
              }}>
              {parsedObject?.user?.username}
            </Text>
          </View>
        </View>

        {parsedObject?.user?.isSeller ? (
          <>
            {parsedObject?.user?.servicesProvided?.length > 0 ? (
              <Divider
                style={{
                  height: 0.5,
                  backgroundColor: 'gray',
                  marginTop: 2,
                  //   borderColor:"gray",borderWidth:1
                }}
              />
            ) : null}
            {parsedObject?.user?.servicesProvided?.length > 0 && (
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  marginTop: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 40,
                  borderRadius: 11,
                  backgroundColor: '#EED7B9',
                }}
                onPress={() => {
                  routeToBusinessDetail(parsedObject?.user?.profileDetails);
                }}
                activeOpacity={1}>
                <View style={{flexDirection: 'row'}}>
                  <Image
                    style={{width: 14, height: 14, marginRight: 8}}
                    source={require('../../../../assets/profile/image.png')}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '400',
                      fontFamily: FontFamilies.semibold,
                      color: '#1E1E1E',
                    }}>
                    {parsedObject?.user?.servicesProvided?.length > 0
                      ? parsedObject?.user.servicesProvided[0]?.toUpperCase()
                      : parsedObject?.user?.professionalType
                      ? parsedObject?.user?.professionalType?.toUpperCase()
                      : 'No data added'}
                  </Text>
                </View>
                <Image
                  source={require('../../../../assets/profile/arrowRight.png')}
                  style={[
                    {width: 14, height: 14, marginRight: 8},
                    {position: 'absolute', right: 0},
                  ]}
                />
              </TouchableOpacity>
            )}
          </>
        ) : null}
      </Pressable>

      <MessageTime
        userId={userId}
        time={message?.created_at as any}
        messageuserid={message?.user_id}
      />
    </React.Fragment>
  );
};
export default ShareProfileMessage;
