import React from 'react';
import {Image, Text, View} from 'react-native';
import CustomIcons from '../../../constants/CustomIcons';
import ChatCard from './ChatCard';
import { FontFamilies } from '../../../styles/constants';

interface PinnedChatsProps {
    navigation:any
}
const PinnedChats: React.FC<PinnedChatsProps> = ({
    navigation
}) => {
  return (
    <React.Fragment>
      <View
        style={{
          alignItems: 'center',
          padding: 10,
          paddingLeft: 25,
          paddingTop: 0,
          flexDirection: 'row',
          gap: 7,
        }}>
        <CustomIcons type="CHATPIN" color={'white'} />
        <Text
          style={{
            color: '#81919E',
            fontFamily: FontFamilies.medium,
            fontWeight: '400',
            fontSize: 12,
          }}>
          Pinned
        </Text>
      </View>
      <ChatCard isLast={false} navigation={navigation}/>
      <ChatCard isLast={true} navigation={navigation}/>
    </React.Fragment>
  );
};
export default PinnedChats;
