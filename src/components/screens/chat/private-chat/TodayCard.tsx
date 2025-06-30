import React from 'react';
import {Text, View} from 'react-native';
import dayjs from 'dayjs'
import { FontFamilies } from '../../../../styles/constants';
interface TodayCardProps {
  date:any
  messages?:any
}
const TodayCard: React.FC<TodayCardProps> = ({messages,date}) => {
  // const groupMessagesByDate = (messages: any) => {
  //   return messages.reduce((acc: any, message: any) => {
  //     const messageDate = dayjs(message.created_at).format('YYYY-MM-DD');
  //     if (!acc[messageDate]) {
  //       acc[messageDate] = [];
  //     }
  //     acc[messageDate].push(message);
  //     return acc;
  //   }, {});
  // };
  // const groupedMessages = groupMessagesByDate(messages);
  // const data = Object.keys(groupedMessages).flatMap(date => [
  //   {type: 'date', date}, // Add date item
  //   ...groupedMessages[date].map((message: any) => ({...message})), // Add messages
  // ]);
  // const formatDateHeader = (date: any) => {
  //   const today = dayjs().format('YYYY-MM-DD');
  //   const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  //   if (date === today) return 'Today';
  //   if (date === yesterday) return 'Yesterday';
  //   return dayjs(date).format('MMMM D, YYYY');
  // };

  // const d = data?.filter(s => s?.type === 'date')?.[0];

  return (
    <View
      style={{
        // width: 62,
        height: 35,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        position: 'absolute',
        zIndex: 111,
        top: 100,
      }}>
      <Text
        style={{
          color: '#FFFFFF',
          fontFamily: FontFamilies.medium,
          fontWeight: '400',
          fontSize: 12,
        }}>
        {date}
      </Text>
    </View>
  );
};
export default TodayCard;
