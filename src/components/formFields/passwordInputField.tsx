import React from 'react';
import { View, TextInput, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Color, FontFamilies, FontSizes, LetterSpacings } from '../../styles/constants';

const PasswordInputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  iconName,
  readOnly,
  secureTextEntry,
  multiline = false,
  numberOfLines = 1,
  error, // Optional error prop
  onFocus, // Optional focus prop
  onIconPress, // Function to handle icon press
}: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.inputContainer, error && styles.errorInputContainer]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multiline,
            error && styles.errorInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Color.grey}
          value={value}
          onChangeText={!readOnly ? onChangeText : undefined}
          editable={!readOnly}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={onFocus}
        />
        {iconName ? (
          <TouchableOpacity onPress={onIconPress}>
            <Icon name={iconName} size={20} color={Color.black} style={styles.icon} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: '#81919E',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10, // Adjust padding for different platforms
    minHeight: 48, // Ensure minimum height consistency
  },
  errorInputContainer: {
    borderColor: 'black',
    borderWidth: 1,
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.semibold,
    letterSpacing:LetterSpacings.wide,
    color: Color.black,
    paddingVertical: 0,
  },
  errorInput: {
    borderColor: 'red', // Change border color to red for error state
    height: Platform.OS === 'ios' ? 'auto' : 35,
  },
  multiline: {
    minHeight: 60,
  },
  errorText: {
    color: Color.black,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    marginTop: 5,
  },
});

export default PasswordInputField;
