/* eslint-disable no-trailing-spaces */
// src/styles/constants.js
  const Color = { 
    black:'#000000',
    grey:'#B9B9BB',
    primarygrey:'#656565',
    secondarygrey:'#F3F3F3',
    white:'#FFFFFF',
    red:'#FF0000',
  };
  
  const FontSizes = {
    extraSmall: 10,
    small: 12,
    medium: 14,
    medium2:16,
    large: 18,
    large2:20,
    large3:22,
    extraLarge: 24,
    extralarge2:40,
  };
  
  const FontWeights = {
    thin: '100',
    extraLight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extraBold: '800', 
    black: '900',
  };
  
  const FontFamilies = {
    extraBold: 'Poppins-ExtraBold',
    regular: 'Poppins-Regular',
    bold: 'Poppins-Bold',
    medium: 'Poppins-Medium',
    semibold:'Poppins-SemiBold',
  };
  
  const LineHeights = {
    extrasmall:14,
    small: 16,
    medium: 20,
    large: 28,
    extraLarge: 30,
    extralarge2:50,
  };
  
  const LetterSpacings = {
    normal: 0,
    wide: 0.5,
    wider: 1,
  };

import { PixelRatio } from 'react-native';
import { moderateScale } from 'react-native-size-matters'; // Ensure you have this installed

export const scaleFont = (size: number, min = 12, max = 24) => {
  const fontScale = PixelRatio.getFontScale(); // Get system font scale
  const scaledSize = moderateScale(size, 0.4) / fontScale; // Adjust for font scale
  return Math.min(Math.max(scaledSize, min), max); // Clamp within range
};

  
  export { Color, FontSizes, FontWeights, FontFamilies, LineHeights, LetterSpacings };
  
