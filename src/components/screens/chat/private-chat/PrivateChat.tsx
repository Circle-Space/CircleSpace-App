import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  View,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import PrivateChatHeader from './PrivateChatHeader';
import ChatInputCard from './ChatInputCard';
import MessageCard from './MessageCard';
import MessageActionCard from './MessageActionCard';
import {useDispatch, useSelector} from 'react-redux';
import {ApplicationState} from '../../../../redux/store';
import isEmpty from 'lodash/isEmpty';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Room} from '../Chats';
import chatRequest from '../../../../services/chatRequest';
import apiEndPoints from '../../../../constants/apiEndPoints';
import awsConfig from '../../../../services/Aws/awsConfig';
import {API, graphqlOperation} from 'aws-amplify';
import {
  oncreateMessages,
  onupdateMessages,
} from '../../../../services/Graphql/subscriptions';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import useCustomBackHandler from '../../../../hooks/useCustomBackHandler';
import dayjs from 'dayjs';
import {
  setDeleteMessageId,
  setUpdate,
} from '../../../../redux/reducers/chatSlice';
import TodayCard from './TodayCard';
import {InView, IOScrollView} from 'react-native-intersection-observer';

import {uniqBy} from 'lodash';
import { useKeyboardVisible } from '../../../../hooks/useKeyboardVisible';
export interface PrivateMessage {
  body: string;
  created_at: string;
  entity_type: string;
  is_deleted: boolean;
  is_read: boolean;
  payload: null | string;
  room_id: string;
  seller_username: string;
  user_id: string;
  user_username: string;
  message_by: string;
  seller_avatar: string;
  user_avatar: string;
  id: string;
}

export interface roomData {
  id: string;
  seller_avatar: string;
  seller_username: string;
  user_avatar: string;
  user_username: string;
  room_id: string;
}

interface PrivateChatProps {
  route: any;
  navigation: any;
}

const PrivateChat: React.FC<PrivateChatProps> = ({route, navigation}) => {
  const room: Room = route?.params?.roomData;
  const flatListRef = useRef(null);
  const [visibleMessageDates, setVisibleMessageDates] = useState(new Set());
  const userId:any = useCurrentUserId();
  const dispatch = useDispatch();
  const isSeller = room?.user_id === userId;
  const [nextToken, setNextToken] = useState<any>('');
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  // console.log('userId', userId);
  const bottomScrollRef = useRef(null);
  const showMessageOptions = useSelector(
    (state: ApplicationState) => state?.chat?.messageOptionEnable,
  );
  const deleteMessageId = useSelector(
    (state: ApplicationState) => state?.chat?.deleteMessageId,
  );
  const update = useSelector(
    (state: ApplicationState) => state?.chat?.update,
  );
  
  const values = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const scrollToBottom = () => {
    // Timeout to allow layout to update before scrolling
    setTimeout(() => {
      //@ts-ignore
      bottomScrollRef.current?.scrollToEnd({animated: true});
    }, 100);
  };
  const handleGetMessages = async () => {
    setLoading(true);
    await chatRequest(
      apiEndPoints.listMessage(room?.room_id, nextToken,isEmpty(room?.deleted_at)?'':room?.deleted_at),
      'GET',
      undefined,
      'application/json',
    )
      .then((res: any) => {
        console.log('data',apiEndPoints.listMessage(room?.room_id, nextToken,isEmpty(room?.deleted_at)?'':room?.deleted_at),);
        if (!res?.error) {
          // set(res);
          setMessages(res?.data?.list?.reverse());
          setNextToken(res?.data?.nextToken);
          scrollToBottom();
        } else {
          console.log('faild to get rooms');
        }
      })
      .catch(e => {})
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (room?.room_id) {
      handleGetMessages();
    }
  }, [update,room?.room_id]);
  const isKeyboardVisible = useKeyboardVisible();
  let messageSubscribe: any;
  let updateSubscribe: any;
  const handleSubscription = () => {
    messageSubscribe = API.graphql(
      graphqlOperation(oncreateMessages, {room_id: room?.room_id}),
      {
        'x-api-key': awsConfig.aws_appsync_apiKey,
      },
      //@ts-ignore
    ).subscribe({
      error: (error: any) => console.log('SUBSCRIPTION error', error?.error),
      next: (todoData: any) => {
        const data: any = todoData?.value?.data?.oncreateMessages;
        console.log('SUBSCRIPTION success', data);
        setMessages((prev: any) => [...prev, data]);
        scrollToBottom();
      },
    });
  };
  const handleUpdateSubscription = () => {
    updateSubscribe = API.graphql(
      graphqlOperation(onupdateMessages, {room_id: room?.room_id}),
      {
        'x-api-key': awsConfig.aws_appsync_apiKey,
      },
      //@ts-ignore
    ).subscribe({
      error: (error: any) =>
        console.log('update SUBSCRIPTION error', error?.error),
      next: (todoData: any) => {
        const messageId: any = todoData?.value?.data?.onupdateMessages?.id;
        console.log(
          'update SUBSCRIPTION success',
          todoData?.value?.data?.onupdateMessages?.payload,
        );
        setMessages(prevMessages =>
          prevMessages.map(message =>
            message.id === messageId
              ? {
                  ...message,
                  is_read: true,
                  payload: todoData?.value?.data?.onupdateMessages?.payload,
                }
              : message,
          ),
        );
      },
    });
  };
  useEffect(() => {
    console.log('room?.room_id', room);
    if (room?.room_id) {
      handleSubscription();
      handleUpdateSubscription();
    }
    return () => {
      messageSubscribe?.unsubscribe();
      updateSubscribe?.unsubscribe();
    };
  }, [room?.room_id]);
  useCustomBackHandler(() => {
    dispatch(setUpdate(Date.now()));
    navigation.goBack();
    return true;
  }, []);

  const onScrollEnd = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any) => {
    return (
      layoutMeasurement.height + contentOffset.y <= contentSize.height - 20
    );
  };
  const handleLoadMore = async () => {
    if (nextToken) {
      setIsLoadMore(true);
      setLoading(true);
      chatRequest(
        apiEndPoints.listMessage(room?.room_id, nextToken,isEmpty(room?.deleted_at)?null:room?.deleted_at),
        'GET',
        undefined,
        'application/json',
      )
        .then((res: any) => {
          if (!res?.error) {
            setNextToken(null);
            // setMessages(res?.data?.list);
            if (!isEmpty(res?.data?.nextToken)) {
              setNextToken(res?.data?.nextToken);
            } else {
              setIsLoadMore(false);
            }
            // console.log('res?.data?.list', res?.data?.list);
            setMessages([...res?.data?.list?.reverse(), ...messages]);
            //@ts-ignore
            bottomScrollRef?.current?.scrollTo({y: 300});
          } else {
          }
        })
        .finally(() => {
          setLoading(false);
          setIsLoadMore(false);
        });
    }
  };
  useEffect(() => {
    if (!isEmpty(deleteMessageId)) {
      const data = messages?.filter((m: any) => m?.id !== deleteMessageId);
      setMessages(data);
      dispatch(setDeleteMessageId(null));
    }
  }, [deleteMessageId]);
  const handleReadMessage = (id: any) => {
    console.log('from read nesage', apiEndPoints.updateMessage(id, true));
    chatRequest(
      apiEndPoints.updateMessage(id, true),
      'POST',
      undefined,
      'application/json',
    )
      .then((res: any) => {
        if (!res?.error) {
          console.log('read suucess', res);
        }
      })
      .catch(e => {});
  };
  const handleVisibilityChange = (
    id: string,
    isVisible: boolean,
    isRead: boolean,
    message_by: string,
    date: any,
  ) => {
    setVisibleMessageDates(prev => {
      const newDates = new Set(prev);
      if (isVisible) {
        // Only add valid dates
        const messageDate = dayjs(date);
        if (messageDate.isValid()) {
          newDates.add(messageDate.format('YYYY-MM-DD'));
        }
      } else {
        const messageDate = dayjs(date);
        if (messageDate.isValid()) {
          newDates.delete(messageDate.format('YYYY-MM-DD'));
        }
      }
      return newDates;
    });
    if (isVisible && !isRead && userId !== message_by) {
      // console.log('from visblity');
      handleReadMessage(id);
      // Update state or send API request to mark the message as read
    }
  };
  const getLatestVisibleDate: any = () => {
    const datesArray = Array.from(visibleMessageDates) as string[];
    if (datesArray.length > 0) {
      // Sort dates and return the most recent visible one
      const sortedDates = datesArray.sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf());
      return sortedDates[0];
    }
    return null;
  };
  const formatDate = (date: any) => {
    if (!date) return '';
    const today = dayjs().startOf('day');
    const messageDate = dayjs(date).startOf('day');
    if (!messageDate.isValid()) return '';
    return today.isSame(messageDate)
      ? 'Today'
      : messageDate.format('MMMM D, YYYY');
  };
  console.log('active room',room)
  useEffect(()=>{
  if(isKeyboardVisible){
    scrollToBottom()
  }
  },[isKeyboardVisible])

  // console.log('messagconses', messages);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1,backgroundColor:'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <View
        style={{
          marginTop: values.top,
          backgroundColor: '#FFFFFF',
          flex: 1,
        }}>
        <View
          style={{
            width: Dimensions.get('window').width,
            flex: 1,
            backgroundColor: '#FFFFFF',
            position: 'relative',
          }}>
          <View
            style={
              {
                // paddingVertical: 10,
              }
            }>
            <PrivateChatHeader roomData={room as any} isSeller={isSeller} />
          </View>
          {!isEmpty(messages) && !loading && !isEmpty(visibleMessageDates) ? (
            <TodayCard date={formatDate(getLatestVisibleDate())} />
          ) : null}

          <View style={{ flex: 1 }}>
            <IOScrollView
              keyboardShouldPersistTaps={'handled'}
              // refreshControl={
              //   <RefreshControl refreshing={refreshing} onRefresh={() => {}} />
              // }
              scrollEnabled={isEmpty(showMessageOptions)}
              onScroll={({nativeEvent}) => {
                // console.log('scrolling');
                // Keyboard.dismiss(); // Dismiss keyboard when scrolling
                setIsScrolling(true);
                if (onScrollEnd(nativeEvent)) {
                  if (nativeEvent?.contentOffset?.y === 0 && !isEmpty(nextToken)) {
                    // console.log('nextToken', nextToken);
                    handleLoadMore();
                  }
                }
              }}
              onMomentumScrollEnd={() => {
                // console.log('scrolling stop');
                setTimeout(() => {
                  setIsScrolling(false);
                }, 1000);
              }}
              onScrollEndDrag={() => {
                setTimeout(() => {
                  setIsScrolling(false);
                }, 1000);
              }}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: 5,
                paddingBottom: Platform.OS === 'ios' ? 20 : 20,
                paddingTop: values?.bottom + 20,
                width: Dimensions.get('window').width,
                position: 'relative',
                padding: 10,
                gap: 8,
                paddingLeft: 15,
                paddingRight: 15,
                backgroundColor: '#FFFFFF',
              }}
              ref={bottomScrollRef}>
              {loading ? (
                <ActivityIndicator />
              ) : !messages?.length ? (
                <Text
                  style={{
                    alignSelf: 'center',
                    color:"black"
                  }}>
                  No messages yet!
                </Text>
              ) : (
                messages?.map(m => {
                  return (
                    <>
                      <InView
                        key={m?.id}
                        onChange={(isVisible: boolean) =>
                          handleVisibilityChange(
                            m?.id,
                            isVisible,
                            m?.is_read,
                            m?.message_by,
                            m?.created_at,
                          )
                        }
                        threshold={0.5} // Trigger if 50% of the message is visible
                      >
                        <MessageCard message={m} roomData={room as any} />
                      </InView>
                    </>
                  );
                })
              )}
            </IOScrollView>
          </View>

          { <ChatInputCard roomData={room as any} />}
          {!isEmpty(showMessageOptions) ? (
            <MessageActionCard
              room={room}
              callBack={(id: any) => {
                const data = messages?.filter((m: any) => m?.id !== id);
                setMessages(data);
              }}
            />
          ) : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
export default PrivateChat;
