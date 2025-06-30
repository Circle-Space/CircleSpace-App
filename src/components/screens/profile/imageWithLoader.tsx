import React, { useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Color } from '../../../styles/constants';

const ImageWithLoader = ({ uri, style }: any) => {
  const [isLoading, setIsLoading] = useState(true);

  console.log(`Loading ${uri}`)
  return (
    <View style={style}>
      {isLoading && <ActivityIndicator style={StyleSheet.absoluteFill} color={Color.black}/>}
      <Image
        source={{ uri }}
        style={[style, { display: isLoading ? 'none' : 'flex' }]}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </View>
  );
};

export default ImageWithLoader;
