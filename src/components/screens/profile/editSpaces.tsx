import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BackButton from '../../commons/customBackHandler';
import { post } from '../../../services/dataRequest';
import apiEndPoints from '../../../constants/apiEndPoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setSaveStatus } from '../../../redux/slices/saveSlice';

const EditSpaces = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Extracting savedData correctly
  const { data: savedData = {}, onSaveChanges } = route.params || {};
  console.log('Extracted SavedData:', savedData);

  const [boardName, setBoardName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (savedData) {
      setBoardName(savedData?.name || '');
      setIsPrivate(savedData?.visibility === 'private');
      setImages(Array.isArray(savedData?.posts) ? savedData.posts : []);
    }
  }, [savedData]);

  const renderImagesLayout = () => {
    const images = savedData?.posts?.slice(0, 4) || []; // Up to 4 images or placeholders

    return (
      <View style={styles.imageGrid}>
        {images.map((post, index) => (
          <Image
            key={`image-${index}`}
            source={{ uri: post.contentUrl }}
            style={styles.imagePreview}
          />
        ))}
        {Array.from({ length: 4 - images.length }).map((_, index) => (
          <View key={`placeholder-${index}`} style={styles.imagePlaceholder} />
        ))}
      </View>
    );
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('token', token);
      
      const requestBody = {
        
        name: boardName,
        visibility: isPrivate ? 'private' : 'public'
      };

      console.log('Saving changes:', requestBody);

      const response = await fetch(`https://prodapi.circlespace.in/collections/update/${savedData?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log('response', responseData);

      if (response.ok) {
        await onSaveChanges?.({
          collectionName: boardName,
          visibility: isPrivate ? 'private' : 'public',
        });
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to save changes');
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleDeleteSpace = async () => {
    Alert.alert(
      'Delete Space',
      'Are you sure you want to delete this space? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const response = await fetch(`https://prodapi.circlespace.in/collections/delete/${savedData?.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              console.log('response SPACE DELETE', response);

              if (response.ok) {
                // Update Redux store - set all posts in this space to unsaved
                if (savedData?.items && Array.isArray(savedData.items)) {
                  savedData.items.forEach(item => {
                    dispatch(setSaveStatus({ postId: item._id, isSaved: false }));
                  });
                }
                
                Alert.alert('Success', 'Space deleted successfully');
                navigation.goBack();
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Failed to delete space');
              }
            } catch (error) {
              console.error('Failed to delete space:', error);
              Alert.alert('Error', 'Failed to delete space');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Navigation Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <BackButton />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Space</Text>
        </View>

        {/* Image Grid */}
        {/* <View style={styles.imageWrapper}>{renderImagesLayout()}</View> */}

        {/* Board Name Input */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={boardName}
          onChangeText={setBoardName}
          placeholder="Enter board name"
        />

        {/* Suggestions */}
        {/* <Text style={styles.label}>Suggestions</Text>
        <View style={styles.suggestionsContainer}>
          {['Interior', 'Architecture', 'Bedroom design'].map((tag) => (
            <TouchableOpacity key={tag} style={styles.suggestionTag}>
              <Text style={styles.suggestionText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Visibility Toggle */}
        <Text style={styles.label}>Visibility</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Keep this space private</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: '#767577', true: '#767577' }}
            thumbColor={isPrivate ? '#1e1e1e' : '#f4f3f4'}
          />
        </View>
        <Text style={styles.infoText}>
          If you don't want others to see this space, keep it private.
        </Text>

        {/* Collaborators */}
        {/* <Text style={styles.label}>Collaborators</Text>
        <View style={styles.collaboratorsContainer}>
          <View style={styles.avatar} />
          <TouchableOpacity style={styles.addButton}>
            <Icon name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View> */}

        {/* Save and Delete Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.deleteButton, { width: '20%' }]} 
            onPress={handleDeleteSpace}
          >
            <Icon name="delete" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <TouchableOpacity 
            style={[styles.saveButton, { width: '80%' }]} 
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
    left: -15,
    position: 'absolute',
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  imageWrapper: {
    width: 100,
    height: 100,
    alignSelf: 'center', // Center the grid in the modal
    marginBottom: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  imagePreview: {
    width: '48%',  // Make images fill half the width (2x2 grid)
    height: '48%', // Make images fill half the height
    borderRadius: 8,
    margin: '1%',  // Add slight margin to space out the images
  },
  imagePlaceholder: {
    width: '48%',
    height: '48%',
    borderRadius: 8,
    margin: '1%',
    backgroundColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#81919E',
    marginBottom: 5,
  },
  input: {
    borderRadius: 10,
    color: '#1E1E1E',
    padding: 10,
    fontSize: 14,
    backgroundColor: '#F3F3F3',
    marginBottom: 20,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  suggestionTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EBEBEB',
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#000',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  switchText: {
    fontSize: 14,
    color: '#1E1E1E',
  },
  infoText: {
    fontSize: 12,
    color: '#81919E',
    marginBottom: 20,
  },
  collaboratorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    // paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditSpaces;
