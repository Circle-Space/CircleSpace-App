import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import icon library
import { FontFamilies } from '../../../../styles/constants';
interface RichTextViewerProps {
  htmlContent: string;
  label?: string;         // Optional label prop
  iconName?: string;      // Optional icon prop
  iconSize?: number;      // Optional icon size
  iconColor?: string;     // Optional icon color
}

const RichTextViewer = ({
  htmlContent,
  label,
  iconName,
  iconSize = 16,        // Default icon size
  iconColor = '#000',    // Default icon color
}: RichTextViewerProps) => {
  const { width } = Dimensions.get('window'); // Get the screen width for responsive rendering

  return (
    <View style={styles.container}>
      {/* Conditionally render label and icon */}
      {(label || iconName) && (
        <View style={styles.labelContainer}>
          {iconName && (
            <Icon name={iconName} size={iconSize} color={iconColor} style={styles.icon} />
          )}
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
      )}

      {/* Render the HTML content */}
      <RenderHtml
        contentWidth={width}
        source={{ html: htmlContent }}
        tagsStyles={styles.tagsStyles} // Custom styles for HTML tags
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,  // Add margin between label/icon and the content
  },
  icon: {
    marginRight: 8, // Add spacing between icon and label
  },
  label: {
    fontSize: 14,
    color: '#81919E',
    fontFamily: FontFamilies.medium,
  },
  tagsStyles: {
    body: {
      fontFamily: FontFamilies.regular,
      fontSize: 14,
      color: '#1E1E1E',
      lineHeight: 20,
    },
    p: {
      marginVertical: 8,
    },
    h1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000',
    },
    h2: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
    },
    ul: {
      paddingLeft: 20,
      marginVertical: 8,
    },
    li: {
      fontSize: 14,
      color: '#333',
      lineHeight: 20,
    },
    a: {
      color: '#1E90FF',
    },
  },
});

export default RichTextViewer;
