import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomIcons from '../../../constants/CustomIcons';
import {SwipeableView} from 'react-native-swipeable-container';
import ChatCard from './ChatCard';
import {Room} from './Chats';
import {useSelector} from 'react-redux';
import {ApplicationState} from '../../../redux/store';
import {omit} from 'lodash';
import {sensitiveString} from 'aws-sdk/clients/frauddetector';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import { FontFamilies } from '../../../styles/constants';
export interface SellerRoomData {
  seller_avatar: string;
  seller_id: number;
  seller_unread_message_count: number;
  seller_username: string;
  is_seller_online: boolean;
  last_message_sent: string;
  status_id: number;
  id: number;
  created_at: string;
  updated_at: string;
}

export interface UserRoomData {
  user_avatar: string;
  user_id: number;
  user_unread_message_count: number;
  user_username: string;
  is_user_online: boolean;
  last_message_sent: string;
  status_id: number;
  id: number;
  created_at: string;
  updated_at: string;
}

interface DeleteChatCardProps {
  callBack: any;
  room: Room;
}
const DeleteChatCard: React.FC<DeleteChatCardProps> = ({callBack, room}) => {
  const swipeAnim = useRef(new Animated.Value(0)).current; // Animation
  const [isSwiping, setIsSwiping] = useState(false);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Limit swipe to a certain distance for better control
        if (gestureState.dx < -50 && !isSwiping) {
          setIsSwiping(true);
          swipeAnim.setValue(gestureState.dx / -100); // Map dx to scale
        }
      },
      onPanResponderRelease: () => {
        Animated.spring(swipeAnim, {toValue: 0, useNativeDriver: true}).start();
        setIsSwiping(false);
      },
    }),
  ).current;
  const Content = (
    <>
      <View
        style={{
          alignItems: 'center',

          width: '100%',

          backgroundColor: 'white',
        }}>
        <View
          style={{
            gap: 10,
            width: '60%',
          }}>
          <Text
            style={{
              color: '#1E1E1E',
              fontFamily: FontFamilies.semibold,
              fontWeight: '800',
              fontSize: 16,
            }}>
            Tourist Preet
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: '#81919E',
              fontFamily: FontFamilies.medium,
              fontWeight: '400',
              fontSize: 12,
              maxHeight: 100,
            }}>
            Are You free today evening , snjsnsjjnjsnjnjn
          </Text>
        </View>
        <View
          style={{
            gap: 10,
            width: '30%',
          }}>
          <Text
            style={{
              color: '#828282',
              fontFamily: FontFamilies.medium,
              fontWeight: '400',
              fontSize: 12,
              textAlign: 'right',
            }}>
            2 min ago
          </Text>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 8,

              justifyContent: 'flex-end',
            }}>
            <CustomIcons type="CHATPIN" width={15} height={15} />

            <View
              style={{
                padding: 6,
                borderRadius: 20,
                paddingLeft: 8.5,
                paddingRight: 8.5,
                paddingTop: 7,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1E1E1E',
              }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontFamily: FontFamilies.medium,
                  fontWeight: '400',
                  fontSize: 10,
                }}>
                3
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
  const DeleteButton = (
    <TouchableOpacity
      onPress={callBack}
      style={{
        // gap: 10,
        width: '120%',
        backgroundColor: '#FFF4F4',
        justifyContent: 'center',
        alignItems: 'center',
        right: 85,
        borderRadius: 20,
        height: 75,
      }}>
      <CustomIcons type="DELETE" />
    </TouchableOpacity>
  );
  const deleteAction = () => {
   
  };
  const [moving, setMoving] = useState(false);
  const userId = useCurrentUserId();

  return (
    <ChatCard room={room} isLast={false} navigation={null} />
    // <SwipeableView
    //   key={room?.id}
    //   onOpen={() => {
    //     setMoving(!moving);
    //   }}
    //   width={Dimensions.get('window').width}
    //   deleteButton={DeleteButton}
    //   editButton={<></>}
    //   onDelete={() => {}}
    //   deleteThreshold={150}
    //   borderRadius={0}
    //   swipeableHint={false}
    //   autoOpened={false}
    //   onEdit={deleteAction}>
    //   <ChatCard room={room} isLast={false} navigation={null} />
      
    // </SwipeableView>
  );
};
export default DeleteChatCard;
