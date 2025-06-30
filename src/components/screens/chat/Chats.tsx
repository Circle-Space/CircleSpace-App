import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import ChatHeaderCard from './ChatHeaderCard';
import ChatSearchCard from './ChatSearchCard';
import DeleteChatCard from './DeleteChatCard';
import {SafeAreaView} from 'react-native-safe-area-context';
import chatRequest from '../../../services/chatRequest';
import apiEndPoints from '../../../constants/apiEndPoints';
import {useDispatch, useSelector} from 'react-redux';
import {ApplicationState} from '../../../redux/store';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import {isEmpty} from 'lodash';
import {Amplify} from 'aws-amplify';
import config from '../../../services/Aws/awsConfig';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCurrentUserId } from '../../../redux/reducers/chatSlice';

Amplify.configure(config);
interface ChatProps {
  navigation: any;
  route: any;
  refreshing?: boolean;
  onRefresh?: () => void;
}
export interface ChatRooms {
  data: Data;
  error: boolean;
  message: string;
  status_code: number;
}

export interface Data {
  list: Room[];
}
export interface Room {
  deleted_at: string;
  is_deleted: any;
  created_at: string;
  created_by: string;
  id: string;
  is_user_online: string;
  last_message_sent: string;
  name: string;
  room_id: string;
  status_id: string;
  updated_at: string;
  user_avatar: string;
  user_id: string;
  user_unread_message_count: number;
  user_username: string;
  receiver_id: string;
  blocked_by: string;
}

const Chats: React.FC<ChatProps> = ({
  navigation,
  route,
  refreshing: parentRefreshing,
  onRefresh: parentOnRefresh,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  // console.log('route', route);
  const accountType = useSelector(
    (state: ApplicationState) => state?.chat?.accountType,
  );
  const [query, setQuery] = useState('');
  const type = accountType === 'personal' ? 'user_id' : 'seller_id';
  const currentUserId = useCurrentUserId();
  const dispatch=useDispatch()
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<ChatRooms>();
  const handleGetRooms = async () => {
    const [profile, accountType, userInfo, paidStatus] = await Promise.all([
      AsyncStorage.getItem('profile'),
      AsyncStorage.getItem('accountType'),
      AsyncStorage.getItem('user'),
      AsyncStorage.getItem('isPaid')
    ]);
    const id =  JSON.parse(userInfo)?._id;
  
    dispatch(setCurrentUserId(id))
    if (id) {
      await chatRequest(
        apiEndPoints.listRoom(id),
        'GET',
        undefined,
        'application/json',
      )
        .then(async (res: any) => {
          if (!res?.error) {
           console.log( res?.data?.list?.[0])
            setRooms(res);
          } else {
            Alert.alert('faild to get rooms');
          }
        })
        .catch(e => {})
        .finally(() => {
          setLoading(false);
        });
    }else{
      console.error('id not found',id)
    }
  };
  const update = useSelector((state: ApplicationState) => state?.chat?.update);
  const handleRefresh = () => {
    setRefreshing(true);
    handleGetRooms().finally(() => {
      setRefreshing(false);
    });
  };

  useEffect(() => {
    handleGetRooms();
  }, [update]);

  // Use parent's refreshing state if provided
  useEffect(() => {
    if (parentRefreshing) {
      handleGetRooms();
    }
  }, [parentRefreshing]);

  return (
    <SafeAreaView style={{
      backgroundColor:"white"
    }}>
      <View
        style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
          backgroundColor: 'white',
        }}>
       
        <ChatHeaderCard />
        <ChatSearchCard
          callBack={(e: string) => {
            setQuery(e);
          }}
        />
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={
                parentRefreshing !== undefined ? parentRefreshing : refreshing
              }
              onRefresh={parentOnRefresh || handleRefresh}
            />
          }
          onScroll={() => {}}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 10,
            paddingBottom: Platform.OS === 'ios' ? 120 : 100,
            width: Dimensions.get('window').width,
            backgroundColor: 'white',
          }}>
          {/* <PinnedChats navigation={navigation} /> */}
          {/* <NormalChats navigation={navigation} /> */}
          {loading && !parentRefreshing ? (
            <ActivityIndicator />
          ) : isEmpty(rooms?.data?.list) ? (
            <Text
              style={{
                alignSelf: 'center',
                fontWeight: '400',
                fontSize: 13,
                color: '#1E1E1E',
                marginVertical: 12,
              }}>
              No chats added yet
            </Text>
          ) : (
            rooms?.data?.list?.filter((room:Room)=>!room?.is_deleted)
              ?.sort(
                (a: any, b: any) =>
                  //@ts-ignore
                  new Date(b?.updated_at) - new Date(a?.updated_at),
              )
              ?.filter(
                item =>
                  item?.name?.toLowerCase().includes(query?.toLowerCase()) ||
                  item?.last_message_sent
                    ?.toLowerCase()
                    ?.includes(query?.toLowerCase()),
              )
              ?.map(room => {
                return (
                  <DeleteChatCard
                    callBack={() => {
                      setShowChatOptions(true);
                    }}
                    room={room}
                    key={room?.id}
                  />
                );
              })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
export default Chats;
