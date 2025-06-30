import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontFamilies } from '../../../../styles/constants';

const CustomHeader = ({ title }: { title: string }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Icon name="chevron-back" size={22} color="#181818" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backButton: {
    // backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    paddingRight: 10,
    justifyContent: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.25,
    // shadowRadius: 8,
    // elevation: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40, // Same width as back button to maintain center alignment
  },
});
