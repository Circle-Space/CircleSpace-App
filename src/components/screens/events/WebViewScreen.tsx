/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Share } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const WebViewScreen = ({ route, navigation }) => {
  const { url } = route.params;
  const [loading, setLoading] = useState(true);
console.log('url :',url);

  const handleShare = async () => {
    try {
      await Share.share({ message: url });
    } catch (error) {
      // handle error
    }
  };

  const handleCopy = () => {
    Clipboard.setString(url);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Address Bar */}
      <View style={styles.addressBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="chevron-back" size={22} color="#181818" />
        </TouchableOpacity>
        <View style={styles.urlContainer}>
          <Text style={styles.urlText} numberOfLines={1}>{url}</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
          <Icon name="share-outline" size={20} color="#181818" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCopy} style={styles.iconButton}>
          <Icon name="copy-outline" size={20} color="#181818" />
        </TouchableOpacity>
      </View>
      <WebView 
        source={{ uri: url }} 
        style={{ marginTop: 0 }}
        onLoadProgress={({ nativeEvent }) => {
          if (nativeEvent.progress === 1) {
            setLoading(false);
          }
        }}
      />
      {loading && (
        <ActivityIndicator 
          style={{ position: 'absolute', top: '50%', left: '50%' }}
          size="large"
          color="#000"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  urlContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  urlText: {
    fontSize: 14,
    color: '#333',
  },
  iconButton: {
    padding: 6,
  },
});

export default WebViewScreen;
