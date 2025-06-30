import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import { del, delPost } from '../../../services/dataRequest';

const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to your storage to download files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true;
  }
};

const CatalogLayout = ({
  title,
  downloadUrl,
  isSelfProfile,
  catalogId,
  onDeleteSuccess,
}: any) => {
  const navigation = useNavigation();
  console.log("isSelfProfile 40 ::", catalogId?._id);
  const openLink = () => {
    navigation.navigate('PDFViewer', {
      url: downloadUrl,
      title: title,
    });
  };

  const handleDownload = async () => {
    return;
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Error', 'Storage permission is required to download files.');
      return;
    }

    try {
      const fileName = downloadUrl.split('/').pop(); // Extract file name from URL
      const localFilePath = `${RNFS.ExternalStorageDirectoryPath}/Download/${fileName}`;

      const downloadOptions = {
        fromUrl: downloadUrl,
        toFile: localFilePath,
      };

      const result = await RNFS.downloadFile(downloadOptions).promise;

      if (result.statusCode === 200) {
        // to ${localFilePath}!
        Alert.alert('Success', `File downloaded successfully.`);
      } else {
        Alert.alert('Error', 'File download failed.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while downloading the file.');
    }
  };

  const handleDelete = async () => {
    try {
      const payload = {
        catalogId: catalogId?._id,
      };
      const response = await delPost('catalog/delete-catalog', payload);
      if (response.status === 200) {
        Alert.alert('Success', 'Catalog deleted successfully');
          onDeleteSuccess?.(catalogId?._id);
      } else {
        Alert.alert('Error', 'Failed to delete catalog');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while deleting the catalog');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.imageContainer, { backgroundColor: '#D9D9D9' }]}
      onPress={openLink}>
      <View style={styles.overlay}>
        <Text style={styles.likesCount}>{title}</Text>
      </View>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={openLink}>
        <Image
          source={require('../../../assets/profile/viewCatalog.png')}
          style={styles.downloadImage}
        />
      </TouchableOpacity>
      {isSelfProfile && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Catalog',
              'Are you sure you want to delete this catalog?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: handleDelete, style: 'destructive' },
              ],
            );
          }}>
          <Image
            source={require('../../../assets/icons/delete.png')}
            style={styles.deleteImage}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    marginBottom: 10,
    position: 'relative',
    borderRadius: 15,
    overflow: 'hidden',
    height: 200,
    borderStartEndRadius: 40,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  likesCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
  },
  downloadButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    backgroundColor: '#FFF',
    borderRadius: 50,
    padding: 2,
    transform: [
      { translateX: -17 }, // Half of (width + padding)
      { translateY: -17 }  // Half of (height + padding)
    ],
  },
  downloadImage: {
    height: 30,
    width: 30,
  },
  deleteButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  deleteImage: {
    height: 35,
    width: 35,
  },
});

export default CatalogLayout;
