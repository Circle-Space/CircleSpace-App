import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Catalog } from '../../types/profile';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

// ... existing code ...
interface CatalogGridItemProps {
  catalog: Catalog;
  onViewPdf: (pdfUrl: string, title?: string) => void;
  isSelf?: boolean;
  onDelete?: (catalogId: string) => void;
  accountType: string;
}


const CatalogGridItem: React.FC<CatalogGridItemProps> = ({ catalog, onViewPdf, isSelf, onDelete, accountType }) => {
  console.log("isSelf card item", isSelf);
  return (
    <TouchableOpacity onPress={() => onViewPdf(catalog.pdfUrl, catalog._id)} activeOpacity={1}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={require('../../assets/profile/profileTabs/catalog.png')} style={styles.image} resizeMode="cover" />
        </View>
        {isSelf && accountType !== 'temp' && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => onDelete && onDelete(catalog._id)}
            activeOpacity={0.7}
          >
            <View style={styles.eyeCircle}>
              <Icon name="delete" size={22} color="red" />
            </View>  
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{catalog.title}</Text>
    </TouchableOpacity>
  );
}
// ... existing code ...

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    margin: 8,
    marginBottom: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: Color.black,
    width: CARD_SIZE - 16,
    margin: 10,
  },
  imageContainer: {
    width: '50%',
    height: '50%',
    borderRadius: 200,
    backgroundColor: Color.white,
    borderWidth: 1,
    borderColor: Color.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '60%',
    height: '60%',
    borderRadius: 20,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  eyeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default CatalogGridItem; 