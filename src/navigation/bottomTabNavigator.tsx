/* eslint-disable prettier/prettier */
// BottomTabNavigator.js
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '../components/screens/home';
import profile from '../components/screens/profile/profile';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={profile}  />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
