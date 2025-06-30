/* eslint-disable prettier/prettier */
import React from 'react';
import {Appbar, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = ({isBlurred, routeToEdit, handleLogout, toggleOptions}) => {
  const navigation = useNavigation();

  const routeToSetting = ()=>{
    navigation.navigate('SettingPage' as never);
  }
  return (
    <Appbar.Header style={{paddingHorizontal: 15}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flex: 1,
        }}>
        <Appbar.Content
          title="Profile"
          titleStyle={{color: 'black', textAlign: 'left', marginRight: 'auto'}}
        />
        {!isBlurred && (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/* <Appbar.Action icon="pencil" onPress={routeToEdit} color="black" /> */}
            <TouchableOpacity onPress={toggleOptions}>
              <Icon name="more-vert" size={24} />
            </TouchableOpacity>
            <Appbar.Action icon="logout" onPress={routeToSetting} color="black" />
          </View>
        )}
      </View>
    </Appbar.Header>
  );
};

export default Header;
