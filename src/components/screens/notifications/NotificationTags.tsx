import React from 'react';
import {useState} from 'react';
import {ScrollView, Text, TouchableOpacity} from 'react-native';
import { FontFamilies } from '../../../styles/constants';
const NotificationTags = () => {
  const [active, setActiveTab] = useState('All');
  const tags = ['All', 'Jobs', 'Follows', 'Likes', 'Comments', 'Message'];
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 10,
        gap: 10,
        // backgroundColor:"red",
        height:50
      }}
      horizontal={true}>
      {tags?.map(s => {
        return (
          <TouchableOpacity
          key={s}
            onPress={() => {
              setActiveTab(s);
            }}
            style={{
              backgroundColor: active === s ? '#1E1E1E' : '#EFEFEF',
              minWidth: 54,
              height: 35,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
              paddingLeft: 15,
              paddingRight: 15,
            }}>
            <Text
              style={{
                fontFamily: FontFamilies.semibold,
                fontWeight: '400',
                fontSize: 12,
                color: active === s ? '#FFFFFF' : '#101010',
                textAlign: 'center',
              }}>
              {s}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
export default NotificationTags;
