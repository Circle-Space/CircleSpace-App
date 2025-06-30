import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type PDFViewerNativeParams = {
  url: string;
  title: string;
};

type Props = NativeStackScreenProps<any, 'PDFViewerNative'>;

const PDFViewerNative: React.FC<Props> = ({ route, navigation }) => {
  const { url, title } = route.params as PDFViewerNativeParams;
  console.log("url in pdf viewer native", url);
  console.log("title in pdf viewer native", title);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleGoBack = () => navigation.goBack();

  const pdfViewerUrl =
    Platform.OS === 'android'
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
      : url;

  console.log("pdfViewerUrl", pdfViewerUrl);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            source={require('../../assets/header/backIcon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.black} />
          <Text style={styles.loadingText}>Loading Document...</Text>
        </View>
      )}

      <WebView
        source={{ uri: pdfViewerUrl }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
          Alert.alert('Error', 'Could not load the document. Please try again later.');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Color.black,
  },
  headerTitle: {
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    flex: 1,
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
});

export default PDFViewerNative;
