import React from 'react';
import {View,Image, TextInput, Text, StyleSheet, Platform, ViewStyle, TextStyle, ImageStyle} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Color, FontFamilies, FontSizes, LetterSpacings, LineHeights, scaleFont } from '../../../../styles/constants';

interface CustomTextInputProps {
  label: string;
  placeholder: string;
  placeholderTextColor: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName?: string;
  iconImage?: any;
  readOnly?: boolean;
  multiline?: boolean;
  defaultOneLine?: boolean;
  numberOfLines?: number;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'visible-password' | 'ascii-capable' | 'numbers-and-punctuation' | 'url' | 'name-phone-pad' | 'twitter' | 'web-search';
  maxLength?: number;
  style?: any;
  rightText?: string;
  innerRef?: React.RefObject<TextInput>;
  allowFontScaling?: boolean;
}

const CustomTextInput = ({
  label,
  placeholder,
  placeholderTextColor,
  value,
  onChangeText,
  iconName,
  iconImage,
  readOnly,
  multiline = false,
  defaultOneLine = false,
  numberOfLines = 1,
  error,
  onFocus,
  onBlur,
  autoCapitalize = 'none',
  keyboardType,
  maxLength,
  style,
  rightText,
  innerRef,
  allowFontScaling,
}: CustomTextInputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputContainer,
        multiline && !defaultOneLine && styles.multilineContainer,
        error ? styles.errorInputContainer : undefined
      ]}>
        {iconName && (
          <Icon name={iconName} size={18} color="#1E1E1E" style={styles.icon} />
        )}
        {iconImage && (
          <Image
            source={iconImage}
            style={styles.icon}
            resizeMode="contain"
          />
        )}
        <TextInput
          ref={innerRef}
          style={[
            styles.input,
            multiline && !defaultOneLine && styles.multiline,
            error && styles.errorInput,
            style
          ]}
          placeholder={placeholder}
          placeholderTextColor={Color.primarygrey}
          value={value}
          onChangeText={!readOnly ? onChangeText : undefined}
          editable={!readOnly}
          multiline={multiline}
          keyboardType={keyboardType}
          numberOfLines={numberOfLines}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          textAlignVertical={multiline ? "center" : "auto"}
          allowFontScaling={allowFontScaling}
        />
        {rightText && (
          <Text style={styles.rightText}>
            {rightText}
          </Text>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  } as ViewStyle,
  label: {
    fontSize: FontSizes.medium,
    color: Color.black,
    marginBottom: 8,
    fontWeight: '800',
    fontFamily: FontFamilies.semibold,
    lineHeight:LineHeights.small,
  } as TextStyle,
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    color:'#81919E',
    backgroundColor: Color.secondarygrey,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 8,
    justifyContent: 'center',
    position: 'relative',
    height: 50,
  } as ViewStyle,
  multilineContainer: {
    height: 'auto',
    minHeight: 60,
    alignItems: 'flex-start',
    paddingVertical: 12,
  } as ViewStyle,
  errorInputContainer: {
    borderColor: Color.black,
    borderWidth: 1,
  } as ViewStyle,
  icon: {
    marginRight: 1,
    height:18,
    width:18,
  } as ImageStyle,
  input: {
    flex: 1,
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    color: '#3C4858',
    fontWeight: '400',
    paddingVertical: 0,
  } as TextStyle,
  errorInput: {
    height: Platform.OS === 'ios' ? 'auto' : 35,
  } as TextStyle,
  multiline: {
    minHeight: 60,
    maxHeight : 80,
    textAlignVertical: 'center',
  } as TextStyle,
  errorText: {
    color: Color.black,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    marginTop: 5,
  } as TextStyle,
  rightText: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    fontSize: 12,
    color: '#666',
    fontFamily: FontFamilies.regular,
  } as TextStyle,
});

export default CustomTextInput;
