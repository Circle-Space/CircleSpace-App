import React from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Color, FontFamilies } from "../../../styles/constants";
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.44;
const cardHeight = 200;

interface ProjectCardProps {
    title: string;
    images: string[];
    isLiked?: boolean;
    isSaved?: boolean;
    onPress?: () => void;
    onLikePress?: () => void;
    onSavePress?: (id: string) => void;
    style?: any;
    /**
     * If true, show like/save icons. Default: false
     */
    showIcons?: boolean;
    /**
     * If true, show the title overlay. Default: true
     */
    showTitle?: boolean;
    /**
     * If true, show the item count indicator. Default: false
     */
    showItemCount?: boolean;
    /**
     * Total number of items in the project
     */
    itemCount?: number;
    enableLongPress?: boolean;
    onLongPress?: () => void;
    /**
     * Page name to determine layout
     */
    pageName?: string;
    /**
     * ID of the item
     */
    id?: string;
    /**
     * Whether the user is followed by the current user
     */
    isFollowed?: boolean;
    /**
     * Callback when follow button is pressed
     */
    onFollowPress?: () => Promise<void>;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
    title,
    images,
    isLiked = false,
    isSaved = false,
    onPress,
    onLikePress,
    onSavePress,
    style,
    showIcons = true,
    showTitle = true,
    showItemCount = false,
    itemCount = 0,
    enableLongPress = false,
    onLongPress,
    pageName,
    id,
    isFollowed,
    onFollowPress
}) => {
    const route = useRoute();
    const currentPageName = pageName || route.name;
    // Filter out any null or undefined images
    const validImages = images?.filter(img => img) || [];
    const imageCount = validImages.length;
    const displayImages = pageName === 'feed' ? validImages.slice(0, 1) : validImages.slice(0, 4);
    
    // let gridContent;
    // if (imageCount === 0) {
    //     gridContent = (
    //         <View style={styles.placeholder}>
    //             <Text style={styles.placeholderText}>No Images</Text>
    //         </View>
    //     );
    // } else if (imageCount === 1) {
    //     gridContent = (
    //         <Image 
    //             source={{ uri: validImages[0] }} 
    //             style={styles.fullImage}
    //             resizeMode="cover"
    //         />
    //     );
    // } else if (imageCount === 2) {
    //     gridContent = (
    //         <View style={styles.grid2x2}>
    //             <Image 
    //                 source={{ uri: validImages[0] }} 
    //                 style={[styles.grid2x2Image, { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }]}
    //                 resizeMode="cover"
    //             />
    //             <Image 
    //                 source={{ uri: validImages[1] }} 
    //                 style={[styles.grid2x2Image, { borderTopRightRadius: 12, borderBottomRightRadius: 12 }]}
    //                 resizeMode="cover"
    //             />
    //         </View>
    //     );
    // } else if (imageCount === 3) {
    //     gridContent = (
    //         <View style={styles.gridRow}>
    //             <Image 
    //                 source={{ uri: validImages[0] }} 
    //                 style={styles.leftHalfImage}
    //                 resizeMode="cover"
    //             />
    //             <View style={styles.rightColForThree}>
    //                 <Image 
    //                     source={{ uri: validImages[1] }} 
    //                     style={styles.rightTopQuarterImage}
    //                     resizeMode="cover"
    //                 />
    //                 <Image 
    //                     source={{ uri: validImages[2] }} 
    //                     style={styles.rightBottomQuarterImage}
    //                     resizeMode="cover"
    //                 />
    //             </View>
    //         </View>
    //     );
    // } else {
    //     gridContent = (
    //         <View style={styles.grid2x2}>
    //             <Image 
    //                 source={{ uri: validImages[0] }} 
    //                 style={styles.grid2x2Image}
    //                 resizeMode="cover"
    //             />
    //             <Image 
    //                 source={{ uri: validImages[1] }} 
    //                 style={styles.grid2x2Image}
    //                 resizeMode="cover"
    //             />
    //             <Image 
    //                 source={{ uri: validImages[2] }} 
    //                 style={styles.grid2x2Image}
    //                 resizeMode="cover"
    //             />
    //             <View style={styles.grid2x2Image}>
    //                 <Image 
    //                     source={{ uri: validImages[3] }} 
    //                     style={[styles.grid2x2Image, { position: 'absolute', top: 0, left: 0 }]}
    //                     resizeMode="cover"
    //                 />
    //                 <View style={styles.overlayMore}>
    //                     <Text style={styles.overlayText}>+{imageCount - 3}</Text>
    //                 </View>
    //             </View>
    //         </View>
    //     );
    // }
    // Show only first image
    let gridContent;
    gridContent = imageCount === 0 ? (
        <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Images</Text>
        </View>
    ) : (
        <Image 
            source={{ uri: validImages[0] }} 
            style={styles.fullImage}
            resizeMode="cover"
        />
    );

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            onLongPress={enableLongPress ? onLongPress : undefined}
            activeOpacity={0.9}
        >
            <View style={styles.gridWrapper}>
                {gridContent}
                {/* Item Count Indicator */}
                {(pageName === 'feed' || showItemCount) && imageCount > 1 && (
                    <View style={styles.itemCount}>
                        <Text style={styles.itemCountText}>1/{imageCount}</Text>
                    </View>
                )}
                {/* Actions */}
                {showIcons ? (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onLikePress}
                            activeOpacity={0.8}
                        >
                            <Icon
                                name={isLiked ? 'heart' : 'heart-outline'}
                                size={14}
                                color={isLiked ? 'red' : '#000'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => onSavePress?.(id || '')}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={
                                    isSaved
                                        ? require('../../../assets/postcard/saveFillIcons.png')
                                        : require('../../../assets/postcard/saveIcon.png')
                                }
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>
                ) : null}
                {/* Floating title overlay */}
                {showTitle && currentPageName !== 'feed' && (
                    <View style={styles.floatTitle}>
                        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title?.trim()}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: cardWidth,
        height: 200,
        borderRadius: 12,
    },
    gridWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: Color.white,
        position: 'relative',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: Color.grey,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    placeholderText: {
        color: Color.white,
        fontSize: 14,
        fontFamily: FontFamilies.regular,
    },
    // 1 image
    fullImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    // 2 images vertical
    colFull: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        height: '100%',
    },
    halfVerticalImage: {
        width: '100%',
        height: '50%',
    },
    // 3 images: left big, right two stacked
    gridRow: {
        flexDirection: 'row',
        width: '100%',
        height: '100%',
    },
    leftHalfImage: {
        width: '50%',
        height: '100%',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    rightColForThree: {
        width: '50%',
        height: '100%',
        flexDirection: 'column',
    },
    rightTopQuarterImage: {
        width: '100%',
        height: '50%',
        borderTopRightRadius: 12,
    },
    rightBottomQuarterImage: {
        width: '100%',
        height: '50%',
        borderBottomRightRadius: 12,
    },
    // 2x2 grid for 4 or more
    grid2x2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        height: '100%',
    },
    grid2x2Image: {
        width: '50%',
        height: '100%',
    },
    overlayMore: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomRightRadius: 12,
    },
    overlayText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    floatTitle: {
        width: cardWidth * 0.8,
        height: 'auto',
        position: 'absolute',
        top: '40%',
        left: '50%',
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        opacity: 0.95,
        transform: [{ translateX: -cardWidth * 0.4 }], // Center the title
    },
    title: {
        fontSize: 11,
        lineHeight: 15,
        paddingHorizontal: 10,
        textAlign: 'center',
        fontWeight: '400',
        color: Color.black,
        fontFamily: FontFamilies.semibold,
        width: '100%', // Ensure full width for proper centering
    },
    actions: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 6,
        right: 6,
        zIndex: 2,
    },
    actionButton: {
        padding: 7,
        margin: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 20,
    },
    icon: {
        height: 14,
        width: 14,
    },
    itemCount: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        height: 22,
        width: 38,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: 10,
        right: 10,
        zIndex: 1,
        borderRadius: 12,
    },
    itemCountText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'black',
        fontFamily: FontFamilies.semibold,
    },
});

export default ProjectCard;