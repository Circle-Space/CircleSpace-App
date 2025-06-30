import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Alert, Text } from 'react-native';
import CatalogGridItem from './CatalogGridItem';
import { useProfile } from '../../hooks/useProfile';
import { Catalog } from '../../types/profile';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

interface CatalogTabProps {
  userId: string;
  isSelf?: boolean;
  token: string;
  accountType: string;
}

const CatalogTab: React.FC<CatalogTabProps> = ({ userId, isSelf, token, accountType }) => {
  console.log("accountType in catalog tab", accountType);
  const { catalogs, fetchCatalogs, catalogsLoading, catalogsError, deleteCatalog } = useProfile();
  const navigation = useNavigation<any>();

  // Use useFocusEffect to refresh catalogs when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchCatalogs(userId, !isSelf);
    }, [userId, isSelf])
  );

  const handleViewPdf = (pdfUrl: string, title?: string) => {
    console.log("pdfUrl in catalog tab", pdfUrl);
    console.log("title in catalog tab", title);
    navigation.navigate('PDFViewerNative', {
      url: pdfUrl,
      title: title || '',
    });
  };

  const handleDelete = async (catalogId: string) => {
    Alert.alert(
      'Delete Catalog',
      'Are you sure you want to delete this catalog?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCatalog(catalogId);
            if (result.success) {
              Alert.alert('Success', result.message);
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  if (catalogsLoading) return <Text style={{ textAlign: 'center', marginTop: 24 }}>Loading...</Text>;
  if (catalogsError) return <Text style={{ textAlign: 'center', marginTop: 24 }}>Error: {catalogsError}</Text>;

  return (
    <FlatList
      data={catalogs}
      keyExtractor={item => item._id}
      numColumns={2}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <CatalogGridItem 
          catalog={item} 
          onViewPdf={() => handleViewPdf(item.pdfUrl, item.title)} 
          isSelf={isSelf} 
          onDelete={() => handleDelete(item._id)} 
          accountType={accountType}
        />
      )}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24 }}>No catalogs found.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 80,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});

export default CatalogTab; 