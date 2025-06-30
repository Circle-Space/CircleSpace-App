import React from 'react';
import {Dimensions, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomIcons from '../../../constants/CustomIcons';
import { FontFamilies } from '../../../styles/constants';
interface ChatSearchCardProps {
  callBack: any;
}
const ChatSearchCard: React.FC<ChatSearchCardProps> = ({callBack}) => {
  return (
    <View
      style={{
        padding: 10,
        width: Dimensions.get('window').width,
        // gap: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 0,
        overflow:"hidden"
      }}>
      <View
        style={{
          width: '85%',
          padding: 10,
          paddingTop: 10,
          flexDirection: 'row',
          paddingLeft: 0,
          height: 70,
           overflow:"hidden"
        }}>
        <Icon
          name="search"
          color={'#81919E'}
          style={{
            left: 30,
            zIndex: 11,
            alignSelf: 'center',
          }}
          size={18}
        />
        <TextInput
          onChangeText={e => {
            if (e?.length >= 3) {
              setTimeout(() => {
                callBack(e);
              }, 500);
            } else {
              setTimeout(() => {
                callBack('');
              }, 500);
            }
          }}
          style={{
            backgroundColor: '#F3F3F3',
            padding: 18,
            borderRadius: 10,
            paddingLeft: 40,
            fontFamily: FontFamilies.medium,
            fontWeight: '400',
            fontSize: 12,
            color: '#81919E',
            width: '95%',
            height:'100%'
          }}
          placeholder={'Search'}
          placeholderTextColor="#828282"
        />
      </View>
      <TouchableOpacity
        disabled={true}
        style={{
          borderRadius: 18,
          backgroundColor: '#1E1E1E',
          padding: 10,
          width: 50,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
        }}>
        <CustomIcons type="CHATFILTER" color={'white'} />
      </TouchableOpacity>
    </View>
  );
};
export default ChatSearchCard;
