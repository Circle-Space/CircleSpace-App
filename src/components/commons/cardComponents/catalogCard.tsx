import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";

interface CatalogCardProps {
    title: string;
    onView: () => void;
    onDelete?: () => void;
    isSelfProfile?: boolean;
}

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.44;

const CatalogCard: React.FC<CatalogCardProps> = ({ title, onView, onDelete, isSelfProfile }) => {
    console.log("CatalogCard ::", {
        title,
        onView,
        onDelete,
        isSelfProfile
    });

    const handleDelete = (e: any) => {
        e.stopPropagation();
        onDelete?.();
    };

    return (
        <TouchableOpacity
            style={[styles.imageContainer, { backgroundColor: '#D9D9D9' }]}
            onPress={onView}
            activeOpacity={0.8}
        >
            <View style={styles.overlay}>
                <Text style={styles.likesCount}>{title}</Text>
            </View>
            <View style={styles.downloadButton}>
                <Image
                    source={require('../../../assets/profile/viewCatalog.png')}
                    style={styles.downloadImage}
                />
            </View>
            {isSelfProfile && onDelete && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    activeOpacity={0.8}
                >
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
        position: 'relative',
        borderRadius: 15,
        overflow: 'hidden',
        height: 200,
        width: cardWidth,
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
            { translateX: -17 },
            { translateY: -17 }
        ],
        zIndex: 2,
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
        zIndex: 2,
    },
    deleteImage: {
        height: 35,
        width: 35,
    },
});

export default CatalogCard;