import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, View, Image, Text } from 'react-native';
import SavedGridItem from './SavedGridItem';
import { useProfile } from '../../hooks/useProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SavedCollection } from '../../types/profile';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';

interface SavedTabProps {
  userId: string;
  isSelf?: boolean;
  token: string;
  accountType: string;
}

const SavedTab: React.FC<SavedTabProps> = ({ userId, isSelf = false, token, accountType }) => {
  console.log("token in saved tab",token, userId, isSelf);
  console.log("accountType in saved tab", accountType);
  // const [savedCollections, setSavedCollections] = useState(mockSaved);
  const { fetchSavedCollections, savedCollections, profile } = useProfile();
  console.log("savedCollections",savedCollections);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      fetchSavedCollections(userId, !isSelf);
    }, [userId, isSelf])
  );
  useEffect(() => {
    const loadSavedCollections = async () => {
      try {
        await fetchSavedCollections(userId, !isSelf);
      } catch (error) {
        console.error('Error fetching saved collections:', error);
      }
    };

    loadSavedCollections();
  }, [userId, isSelf]);

  return (
    <View style={{ flex: 1 }}>
      {savedCollections.length === 0 ? (
        <View style={[
          styles.noPostContainer,
          accountType === 'personal' ? styles.personalNoPost : styles.businessNoPost
        ]}>
          <Image
            source={require('../../assets/profile/profileTabs/noSaved.png')}
            style={styles.noPostImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.noPostText}>No Saved Collections</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={savedCollections}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <SavedGridItem
              item={item}
              onPress={() => navigation.navigate('SpaceDetail', {
                item: {
                  ...item,
                  _id: item._id || item.id
                },
                token,
                isSelfProfile: isSelf,
                profile: profile,
              })}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 80,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  noPostContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalNoPost: {
    paddingTop: 40,
  },
  businessNoPost: {
    marginBottom: 50,
  },
  noPostImage: {
    width: 100,
    height: 100,
    marginBottom: 14,
    tintColor: Color.black,
  },
  noPostText: {
    color: Color.black,
    fontSize: FontSizes.medium2,
    fontFamily: FontFamilies.medium,
  },
});

export default SavedTab; 