import { Image, ImageSourcePropType } from 'react-native';
import { Image as CompressorImage } from 'react-native-compressor';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  minimumCompression?: number;
}

interface CompressedImageResult {
  uri: string;
  size: number;
  width: number;
  height: number;
  type: string;
}

type ImageInput = string | ImageSourcePropType | { uri: string } | { path: string };

/**
 * Convert various image input types to URI
 * @param input Image input (URI, base64, file object, etc.)
 * @returns Promise with image URI
 */
const getImageUri = async (input: ImageInput): Promise<string> => {
  if (typeof input === 'string') {
    // Handle base64 strings
    if (input.startsWith('data:image')) {
      return input;
    }
    // Handle file paths and URIs
    return input;
  }

  if (typeof input === 'object') {
    if ('uri' in input && input.uri) {
      return input.uri;
    }
    if ('path' in input && input.path) {
      return input.path;
    }
  }

  throw new Error('Invalid image input format');
};

/**
 * Get image dimensions
 * @param uri Image URI
 * @returns Promise with image dimensions
 */
const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      reject
    );
  });
};

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 * @param width Original width
 * @param height Original height
 * @param maxWidth Maximum allowed width
 * @param maxHeight Maximum allowed height
 * @returns Object with calculated width and height
 */
const calculateOptimalDimensions = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = width / height;

  if (width > maxWidth) {
    return {
      width: maxWidth,
      height: maxWidth / aspectRatio,
    };
  }

  if (height > maxHeight) {
    return {
      width: maxHeight * aspectRatio,
      height: maxHeight,
    };
  }

  return { width, height };
};

/**
 * Compress image with optimal settings
 * @param input Image input (URI, base64, file object, etc.)
 * @param options Compression options
 * @returns Promise with compressed image result
 */
export const compressImage = async (
  input: ImageInput,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> => {
  try {
    const {
      maxWidth = 1080, // Reduced from 1920 for better compression
      maxHeight = 1080, // Reduced from 1920 for better compression
    } = options;

    // Convert input to URI
    const uri = await getImageUri(input);

    // Get original image dimensions
    const { width: originalWidth, height: originalHeight } = await getImageDimensions(uri);

    // Calculate optimal dimensions
    const { width, height } = calculateOptimalDimensions(
      originalWidth,
      originalHeight,
      maxWidth,
      maxHeight
    );

    // Progressive compression with multiple attempts
    const compressionAttempts = [
      { quality: 0.6, maxWidth: width, maxHeight: height },
      { quality: 0.4, maxWidth: width * 0.8, maxHeight: height * 0.8 },
      { quality: 0.3, maxWidth: width * 0.6, maxHeight: height * 0.6 },
    ];

    let bestResult = null;
    let bestSize = Infinity;

    for (const attempt of compressionAttempts) {
      const compressedImage = await CompressorImage.compress(uri, {
        maxWidth: attempt.maxWidth,
        maxHeight: attempt.maxHeight,
        quality: attempt.quality,
      });

      const response = await fetch(compressedImage);
      const blob = await response.blob();
      const compressedSize = blob.size;

      // If this attempt produced a smaller file, use it
      if (compressedSize < bestSize) {
        bestSize = compressedSize;
        bestResult = {
          uri: compressedImage,
          size: compressedSize,
          width: attempt.maxWidth,
          height: attempt.maxHeight,
          type: 'jpeg',
        };
      }

      // If we've achieved good compression, stop trying
      if (compressedSize <= originalWidth * originalHeight * 0.1) { // 0.1 bytes per pixel is a good target
        break;
      }
    }

    if (!bestResult) {
      throw new Error('Compression failed to produce a valid result');
    }

    return bestResult;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Compress multiple images in parallel
 * @param inputs Array of image inputs
 * @param options Compression options
 * @returns Promise with array of compressed image results
 */
export const compressImages = async (
  inputs: ImageInput[],
  options: CompressionOptions = {}
): Promise<CompressedImageResult[]> => {
  try {
    const compressionPromises = inputs.map(input => compressImage(input, options));
    return await Promise.all(compressionPromises);
  } catch (error) {
    console.error('Batch image compression failed:', error);
    throw new Error('Failed to compress images');
  }
};

/**
 * Get file size in human-readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export const getFormattedFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
  compressImage,
  compressImages,
  getFormattedFileSize,
}; 