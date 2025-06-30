import React, { useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FontFamilies, FontSizes } from '../../../../styles/constants';


const CustomRichTextInput = ({
  value,
  onChangeText,
  placeholder,
  label,
  readOnly = false,
  hideToolBar = false, 
  minHeight = 100,
  iconName, // New prop to determine if icon is rendered
  iconSize = 16, // Default icon size
  iconColor = '#000', // Default icon color
}: any) => {
  const richTextRef = useRef(); // Reference for RichEditor

  return (
    <View style={[styles.container, { minHeight: minHeight }]}>
      {/* {label && <Text style={styles.label}>{label}</Text>} */}
       {/* Icon and Label */}
       <View style={styles.labelContainer}>
        {iconName && (
          <Icon name={iconName} size={iconSize} color={iconColor} style={styles.icon} />
        )}
        {label && <Text style={styles.label}>{label}</Text>}
      </View>


      {hideToolBar && (
        <RichToolbar
          editor={richTextRef}
          selectedIconTint="#000"
          iconTint="#B9B9BB"
          style={styles.richToolbar}
          actions={['bold', 'italic', 'underline', 'unorderedList', 'orderedList']}
          iconSize={20}
          disabledIconTint="#ccc"
        />
      )}
      
      {/* Rich Text Editor */}
      <RichEditor
        ref={richTextRef}
        // placeholder={placeholder}
        initialContentHTML={value}
        onChange={onChangeText}
        editorStyle={styles.richEditorStyle}
        disabled={readOnly}
        style={styles.richEditor}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
    // paddingHorizontal: 15,
    // paddingVertical: 10,
    borderRadius: 10,
    // backgroundColor: '#F3F3F3',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align icon and label in the center
    // marginBottom: 8,
  },
  icon: {
    marginRight: 8, // Add spacing between icon and label
  },
  label: {
    fontSize: FontSizes.small,
    color: '#81919E',
    fontFamily: FontFamilies.medium,
  },
  richEditor: {
    minHeight: 100,
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: FontSizes.bold,
    color: '#1E1E1E',
    marginTop: 10,
  },
  richEditorStyle: {
    backgroundColor: '#F3F3F3',
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    // padding: 10,
    width:"100%",
  },
  richToolbar: {
    backgroundColor: '#FFF',
    borderTopColor: '#D3D3D3',
    borderTopWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default CustomRichTextInput;
