import React, {useRef, useState} from 'react';
import {Dimensions, Image, TouchableOpacity, View, Text, ActivityIndicator} from 'react-native';
import Carousel from 'pinar';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/AntDesign';
import ImageBlurLoading from 'react-native-image-blur-loading';
import useCustomBackHandler from '../../../../hooks/useCustomBackHandler';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';

interface ImageViewerProps {
  navigation: any;
  route: any;
}

interface ImageState {
  [key: string]: {
    loading: boolean;
    error: boolean;
  };
}

const ImageViewer: React.FC<ImageViewerProps> = ({navigation, route}) => {
  const data = route?.params?.data;
  const ref = useRef(null);
  const [imageStates, setImageStates] = useState<ImageState>({});

  console.log('data', data);
  
  useCustomBackHandler(() => {
    navigation.goBack();
    return true;
  }, []);

  const handleImageLoadStart = (uri: string) => {
    setImageStates(prev => ({
      ...prev,
      [uri]: { loading: true, error: false }
    }));
  };

  const handleImageLoadEnd = (uri: string) => {
    setImageStates(prev => ({
      ...prev,
      [uri]: { loading: false, error: false }
    }));
  };

  const handleImageError = (uri: string) => {
    setImageStates(prev => ({
      ...prev,
      [uri]: { loading: false, error: true }
    }));
  };

  const renderImageItem = (uri: string, index: number) => {
    const imageState = imageStates[uri] || { loading: false, error: false };

    if (imageState.error) {
      return (
        <View key={index} style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
        }}>
          <Icon name="picture" size={60} color="#666" />
          <Text style={{
            color: 'white',
            fontSize: 16,
            marginTop: 20,
            textAlign: 'center',
            paddingHorizontal: 40,
          }}>
            Failed to load image
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 15,
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: '#333',
              borderRadius: 8,
            }}
            onPress={() => {
              // Reset error state to retry loading
              setImageStates(prev => ({
                ...prev,
                [uri]: { loading: false, error: false }
              }));
            }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={index} style={{
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {imageState.loading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'black',
            zIndex: 1,
          }}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{
              color: 'white',
              fontSize: 14,
              marginTop: 10,
            }}>
              Loading...
            </Text>
          </View>
        )}
        <ImageZoom
          doubleTapScale={3}
          isSingleTapEnabled
          isDoubleTapEnabled
          uri={uri}
          onLoadStart={() => handleImageLoadStart(uri)}
          onLoadEnd={() => handleImageLoadEnd(uri)}
          onError={() => handleImageError(uri)}
          style={{
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
          }}
          resizeMode="contain"
        />
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View
        style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
          position: 'relative',
          backgroundColor: 'black',
        }}>
        <Carousel
          contentContainerStyle={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          automaticallyAdjustContentInsets={true}
          ref={ref}
          showsControls={true}
          showsDots={true}
          activeDotStyle={{
            backgroundColor: 'white',
          }}
          bounces={true}>
          {data?.map((uri: string, index: number) => renderImageItem(uri, index))}
        </Carousel>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={{
            position: 'absolute',
            top: 20,
            right: 30,
            zIndex: 111,
          }}>
          <Icon name="closecircle" size={30} color={'white'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ImageViewer;
