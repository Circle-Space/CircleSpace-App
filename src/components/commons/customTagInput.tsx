import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomTagInput = ({
  label,
  placeholder,
  value = [],
  onChangeTags,
  iconName = 'tag',
  error,
  onFocus,
  autoCapitalize = 'none',
  disabled = false, // Prop for disabling the input
}) => {
  const [inputText, setInputText] = useState('');

  const validateInput = (text: string) => {
    // Allow alphanumeric characters, underscores, spaces, commas, and newlines
    const regex = /^[a-zA-Z0-9_,\s]*$/;
    return regex.test(text);
  };

  const handleTagInput = (text) => {
    if (disabled) return; // Prevent tag input when disabled

    // Validate input before processing
    if (!validateInput(text)) {
      return;
    }

    // Check for comma, space, or enter key (newline)
    if (text.includes(',') || text.includes(' ') || text.includes('\n')) {
      const newTags = text
        .toLowerCase()
        .split(/[,\s]+/) // Split by comma, space, or newline
        .filter((tag) => tag.length > 0);

      const filteredNewTags = newTags.filter((tag) => !value.includes(tag));
      if (filteredNewTags.length > 0) {
        const updatedTags = [...value, ...filteredNewTags];
        onChangeTags(updatedTags);
      }
      setInputText('');
    } else {
      setInputText(text);
    }
  };

  const removeTag = (index) => {
    if (disabled) return; // Prevent tag removal when disabled
    const newTags = [...value];
    newTags.splice(index, 1);
    onChangeTags(newTags);
  };

  // Add a console log here to check the 'value' prop
  console.log('CustomTagInput - Value prop:', value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          error && styles.errorInputContainer,
          disabled && styles.disabledInputContainer, // Apply disabled styles
        ]}
      >
        {/* <Icon name={iconName} size={20} style={styles.icon} /> */}
        <TextInput
          style={[styles.input, error && styles.errorInput]}
          placeholder={placeholder}
          placeholderTextColor={'#656565'} // Adjust placeholder color when disabled
          value={inputText}
          onChangeText={handleTagInput}
          onFocus={disabled ? () => {} : onFocus} // Disable focus when disabled
          autoCapitalize={autoCapitalize}
          editable={!disabled} // Disable TextInput editing
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Text style={styles.helperText}>
        No special characters allowed. Use only letters, numbers, and underscores.
        Add tags by pressing space, comma.
      </Text>
      <View style={styles.tagContainer}>
        {Array.isArray(value) &&
          value.filter((tag) => tag.trim() !== '').length > 0 && (
            <View style={styles.tagContainer}>
              {value
                .filter(tag => tag.trim() !== '')
                .map((tag, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tag,
                      disabled && styles.disabledTag, // Apply disabled styles
                    ]}>
                    <Text
                      style={[
                        styles.tagText,
                        disabled && styles.disabledTagText, // Apply disabled styles
                      ]}>
                      {tag}
                    </Text>
                    {!disabled && (
                      <TouchableOpacity onPress={() => removeTag(index)} style={styles.closeIconContainer}>
                      <Ionicons
                        name="close"
                        size={14}
                        color="black"
                        style={styles.closeIcon}
                      />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
            </View>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    paddingTop: 10,
    fontSize: FontSizes.medium,
    color: '#1E1E1E',
    marginBottom: 8,
    fontWeight: '800',
    fontFamily: FontFamilies.semibold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    minHeight: 46,
  },
  errorInputContainer: {
    borderColor: 'red',
    borderWidth: 1,
  },
  disabledInputContainer: {
    backgroundColor: '#F5F5F5', // Keep the background consistent
    opacity: 0.5, // Slightly fade for visual indication
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    color: '#3C4858',
    fontWeight: '400',
    paddingVertical: 0,
  },
  disabledInput: {
    color: '#B0B0B0', // Grayed-out text for disabled input
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  disabledTag: {
    backgroundColor: '#1E1E1E',
    opacity: 0.5,
  },
  tagText: {
    fontSize: FontSizes.small,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
    color: '#FFFFFF',
  },
  disabledTagText: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
  removeTag: {
    fontSize: FontSizes.extraSmall,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  closeIconContainer: {
    backgroundColor: Color.secondarygrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderRadius: 60,
    height: 20,
    width: 20,
    padding: 0, // Reset padding
  },
  closeIcon: {
    height: 14, // Slightly smaller to ensure it fits
    width: 14,  // Slightly smaller to ensure it fits
    position: 'absolute', // Use absolute positioning
    top: '50%', // Center vertically
    left: '50%', // Center horizontally
    transform: [{ translateX: -7 }, { translateY: -7 }], // Adjust for icon size
  },
  errorText: {
    color: '#ED4956',
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    marginTop: 5,
  },
  helperText: {
    fontSize: 12,
    color: '#656565',
    marginTop: 4,
    fontFamily: FontFamilies.regular,
  },
});

export default CustomTagInput;
