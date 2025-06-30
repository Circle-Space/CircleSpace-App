import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Color, FontFamilies, FontSizes } from '../../../../styles/constants';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define proper types for route params
type PDFViewerParams = {
  url: string;
  title: string;
};

type Props = NativeStackScreenProps<any, 'PDFViewer'>;

const PDFViewer: React.FC<Props> = ({ route, navigation }) => {
  const { url, title } = route.params as PDFViewerParams;
  console.log("url :: 18 ::", url);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [noContent, setNoContent] = useState(false);

  // Create a safe URL for WebView
  const pdfUrl = url.startsWith('http') ? url : `https://${url}`;
  
  // Use Google Docs viewer to display PDF
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  
  // Check if URL is valid after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setNoContent(true);
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleGoBack = () => {
    navigation.goBack();
    // navigation.navigate("Profile", {
    //   tab: "Catalog",
    // });
  };

  if (hasError || noContent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image
              source={require('../../../../assets/header/backIcon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.rightPlaceholder} />
        </View>
        <View style={styles.centerContainer}>
          <Image
            source={require('../../../../assets/profile/noimgicon/noCatalogPlaceholder.png')}
            style={styles.noDataImage}
            resizeMode="contain"
          />
          <Text style={styles.noDataText}>No PDF Available</Text>
          <Text style={styles.noDataSubText}>The requested document cannot be displayed</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            source={require('../../../../assets/header/backIcon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.rightPlaceholder} />
      </View>
      <WebView
        source={{ uri: googleDocsUrl }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(syntheticEvent) => {
          console.error('WebView error:', syntheticEvent.nativeEvent);
          setHasError(true);
        }}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.black} />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      )}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  noDataText: {
    fontSize: FontSizes.large,
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    marginBottom: 8,
  },
  noDataSubText: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    color: Color.primarygrey,
    textAlign: 'center',
  },
});

export default PDFViewer;
