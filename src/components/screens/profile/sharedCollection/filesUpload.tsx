import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AWS from 'aws-sdk';
import {useNavigation, useRoute} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import CustomTextInput from '../businessProfile/customTextInput';
import {post} from '../../../../services/dataRequest';

const FilesUpload = () => {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  const S3_BUCKET = 'csappproduction-storage';
  const REGION = 'ap-south-1';
  const ACCESS_KEY = 'AKIAU6GDZYODLC5QOLPX';
  const SECRET_KEY = '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';

  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
  });

  const s3 = new AWS.S3();

  const pickImages = useCallback(() => {
    const MAX_IMAGES = 10;
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    const options = {
      mediaType: 'mixed',
      includeBase64: false,
      selectionLimit: MAX_IMAGES,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        navigation.goBack();
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const oversizedFiles = response.assets.filter(
          asset => asset?.fileSize > MAX_FILE_SIZE,
        );

        if (oversizedFiles.length > 0) {
          Alert.alert(
            'File(s) too large',
            'Some files exceed the 100MB limit. Please select smaller files.',
          );
          return;
        }

        const selectedFiles = response.assets.map(asset => ({
          fileName: asset.fileName || '',
          uri: asset.uri,
          fileType: asset.type || '',
        }));
        setImages(selectedFiles);
      }
    });
  }, [navigation]);

  useEffect(() => {
    pickImages();
  }, [pickImages]);

  useEffect(() => {
    // Handle selected people from the SelectPeople screen
    if (route.params?.selectedPeople) {
      console.log('selected 87 ::', route.params.selectedPeople);

      setCollaborators(route.params.selectedPeople);
    }
  }, [route.params?.selectedPeople]);

  const removeCollaborator = userId => {
    setCollaborators(prevCollaborators =>
      prevCollaborators.filter(collab => collab._id !== userId),
    );
  };

  const uploadToS3 = async file => {
    try {
      const response = await fetch(file.uri);
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();

      const params = {
        Bucket: S3_BUCKET,
        Key: `sharedCollection/${file.fileName}`,
        Body: blob,
        ContentType: file.fileType,
        ACL: 'public-read',
      };

      const uploadResponse = await s3.upload(params).promise();
      return uploadResponse.Location;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert('No images selected', 'Please select at least one image.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the collection.');
      return;
    }

    setIsLoading(true);

    try {
      const uploadedPhotos = await Promise.all(
        images.map(image => uploadToS3(image)),
      );

      // Construct the payload
      const payload = {
        title: title.trim(),
        photos: uploadedPhotos,
        collaborators: collaborators.map(collab => ({
          userId: collab._id,
          privileges: collab.privileges || ['view'],
        })),
      };
      const response = await post(
        'shared-drive/create-shared-collection',
        payload,
      );
      console.log('response ::', response);
      if (response.message === 'Photo collection created successfully.') {
        Alert.alert(
          'Success',
          'Collection uploaded and data submitted successfully.',
        );
        navigation.navigate('Profile' as never);
      } else {
        Alert.alert('Error', 'Failed to submit data.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while uploading files.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderImages = () => {
    const totalImages = images.length;

    return images.map((item, index) => {
      let borderRadiusStyle = {};

      if (totalImages === 4) {
        borderRadiusStyle = {
          borderTopLeftRadius: index === 0 ? 10 : 0,
          borderTopRightRadius: index === 1 ? 10 : 0,
          borderBottomLeftRadius: index === 2 ? 10 : 0,
          borderBottomRightRadius: index === 3 ? 10 : 0,
        };
      } else if (totalImages === 3) {
        borderRadiusStyle = {
          borderTopLeftRadius: index === 0 ? 10 : 0,
          borderTopRightRadius: index === 1 ? 10 : 0,
          borderBottomLeftRadius: index === 2 ? 10 : 0,
          borderBottomRightRadius: index === 2 ? 10 : 0,
        };
      } else if (totalImages === 2) {
        borderRadiusStyle = {
          borderTopLeftRadius: index === 0 ? 10 : 0,
          borderBottomLeftRadius: index === 0 ? 10 : 0,
          borderTopRightRadius: index === 1 ? 10 : 0,
          borderBottomRightRadius: index === 1 ? 10 : 0,
        };
      } else if (totalImages === 1) {
        borderRadiusStyle = {
          borderRadius: 10,
        };
      }

      return (
        <Image
          key={index}
          source={{uri: item.uri}}
          style={[
            totalImages === 1 && styles.fullSize,
            totalImages === 2 && styles.halfSize,
            totalImages === 3 &&
              (index === 2 ? styles.fullWidth : styles.halfSize),
            totalImages >= 4 && styles.quarterSize,
            borderRadiusStyle,
          ]}
        />
      );
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={styles.main}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.imageContainer}>{renderImages()}</View>
          <CustomTextInput
            label="Add Title"
            placeholder="Add your collection Title here"
            value={title}
            onChangeText={setTitle}
          />
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('selectPeople', {
                selectedPeople: collaborators,
              });
            }}>
            <CustomTextInput
              label="Shared with"
              placeholder="Add people to share your collection"
              value={collaborators}
              onChangeTags={() => {}}
              disabled={true}
              readOnly={true}
              iconName="account-multiple"
            />
          </TouchableOpacity>
          {/* Display selected collaborators */}
          <View style={styles.chipContainer}>
            {collaborators.map(person => (
              <View key={person.userId} style={styles.chip}>
                <Text style={styles.chipText}>{person.username}</Text>
                <TouchableOpacity
                  onPress={() => removeCollaborator(person._id)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}>
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Uploading...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  imageContainer: {
    marginVertical: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fullWidth: {
    width: '100%',
    height: 150,
  },
  fullSize: {width: '100%', height: 200},
  halfSize: {width: '50%', height: 200},
  quarterSize: {width: '50%', height: 150},
  submitButton: {
    height: 52,
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '400',
    fontFamily: 'Gilroy-SemiBold',
    fontSize: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    backgroundColor: '#F9F8F8',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Gilroy-Regular',
    color: '#1E1E1E',
    marginRight: 5,
  },
  removeText: {
    fontSize: 14,
    color: '#FF0000',
    fontWeight: 'bold',
  },
});

export default FilesUpload;
