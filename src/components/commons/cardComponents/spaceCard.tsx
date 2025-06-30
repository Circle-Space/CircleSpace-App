import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Color, FontFamilies } from "../../../styles/constants";
import Icon from 'react-native-vector-icons/FontAwesome';
import { createVideoThumbnail } from 'react-native-compressor';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.44;
const cardHeight = cardWidth;

interface SpaceCardProps {
    title: string;
    images: string[];
    onPress?: () => void;
    style?: any;
    itemCount?: number;
}

const SpaceCard: React.FC<SpaceCardProps> = ({ title, images, onPress, style, itemCount }) => {
    // Filter out any null, undefined or empty strings
    const validImages = images?.filter(img => img) || [];
    const imageCount = validImages.length;
    const displayImages = validImages.slice(0, 4);
    
    // State to track thumbnails for videos
    const [thumbnails, setThumbnails] = useState<{[key: number]: string}>({});
    
    // Check if a URL is a video
    const isVideoURL = (url: string | undefined): boolean => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'];
        return videoExtensions.some(ext => url.toLowerCase().includes(ext));
    };
    
    // Generate thumbnails for videos
    useEffect(() => {
        const processThumbnails = async () => {
            const newThumbnails: {[key: number]: string} = {};
            
            for (let i = 0; i < validImages.length && i < 4; i++) {
                const uri = validImages[i];
                if (uri && isVideoURL(uri)) {
                    try {
                        const thumb = await createVideoThumbnail(uri);
                        if (thumb?.path) {
                            newThumbnails[i] = thumb.path;
                        }
                    } catch (error) {
                        console.log("Failed to create thumbnail for:", uri, error);
                    }
                }
            }
            
            if (Object.keys(newThumbnails).length > 0) {
                setThumbnails(newThumbnails);
            }
        };
        
        processThumbnails();
    }, [validImages]);

    let gridContent;
    if (!validImages.length || itemCount === 0) {
        // No valid media or empty collection
        gridContent = (
            <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>No Items</Text>
            </View>
        );
    } else if (itemCount === 1 || validImages.length === 1) {
        const uri = validImages[0];
        const isVideo = isVideoURL(uri);
        const thumbnailUri = thumbnails[0] || uri;
        
        gridContent = (
            <View style={styles.fullImage}>
                <Image 
                    source={{ uri: thumbnailUri }}
                    style={{ width: '100%', height: '100%', borderRadius: 18 }}
                />
                {isVideo && (
                    <View style={styles.videoIndicator}>
                        <Icon name="play-circle" size={30} color="#FFFFFF" />
                    </View>
                )}
            </View>
        );
    } else if (itemCount === 2 || validImages.length === 2) {
        gridContent = (
            <View style={styles.colFull}>
                <View style={styles.halfVerticalImage}>
                    <Image 
                        source={{ uri: thumbnails[0] || validImages[0] }}
                        style={{ width: '100%', height: '100%' }}
                    />
                    {isVideoURL(validImages[0]) && (
                        <View style={styles.videoIndicator}>
                            <Icon name="play-circle" size={24} color="#FFFFFF" />
                        </View>
                    )}
                </View>
                <View style={styles.halfVerticalImage}>
                    <Image 
                        source={{ uri: thumbnails[1] || validImages[1] }}
                        style={{ width: '100%', height: '100%' }}
                    />
                    {isVideoURL(validImages[1]) && (
                        <View style={styles.videoIndicator}>
                            <Icon name="play-circle" size={24} color="#FFFFFF" />
                        </View>
                    )}
                </View>
            </View>
        );
    } else if (itemCount === 3 || validImages.length === 3) {
        gridContent = (
            <View style={styles.gridRow}>
                <View style={styles.leftHalfImage}>
                    <Image 
                        source={{ uri: thumbnails[0] || validImages[0] }}
                        style={{ width: '100%', height: '100%', borderTopLeftRadius: 18, borderBottomLeftRadius: 18 }}
                    />
                    {isVideoURL(validImages[0]) && (
                        <View style={[styles.videoIndicator, { borderTopLeftRadius: 18, borderBottomLeftRadius: 18 }]}>
                            <Icon name="play-circle" size={24} color="#FFFFFF" />
                        </View>
                    )}
                </View>
                <View style={styles.rightColForThree}>
                    <View style={styles.rightTopQuarterImage}>
                        <Image 
                            source={{ uri: thumbnails[1] || validImages[1] }}
                            style={{ width: '100%', height: '100%', borderTopRightRadius: 18 }}
                        />
                        {isVideoURL(validImages[1]) && (
                            <View style={[styles.videoIndicator, { borderTopRightRadius: 18 }]}>
                                <Icon name="play-circle" size={20} color="#FFFFFF" />
                            </View>
                        )}
                    </View>
                    <View style={styles.rightBottomQuarterImage}>
                        <Image 
                            source={{ uri: thumbnails[2] || validImages[2] }}
                            style={{ width: '100%', height: '100%', borderBottomRightRadius: 18 }}
                        />
                        {isVideoURL(validImages[2]) && (
                            <View style={[styles.videoIndicator, { borderBottomRightRadius: 18 }]}>
                                <Icon name="play-circle" size={20} color="#FFFFFF" />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    } else {
        // 4 or more items
        gridContent = (
            <View style={styles.grid2x2}>
                <View style={styles.grid2x2Image}>
                    <Image 
                        source={{ uri: thumbnails[0] || validImages[0] }}
                        style={{ width: '100%', height: '100%' }}
                    />
                    {isVideoURL(validImages[0]) && (
                        <View style={styles.videoIndicator}>
                            <Icon name="play-circle" size={20} color="#FFFFFF" />
                        </View>
                    )}
                </View>
                <View style={styles.grid2x2Image}>
                    <Image 
                        source={{ uri: thumbnails[1] || validImages[1] }}
                        style={{ width: '100%', height: '100%' }}
                    />
                    {isVideoURL(validImages[1]) && (
                        <View style={styles.videoIndicator}>
                            <Icon name="play-circle" size={20} color="#FFFFFF" />
                        </View>
                    )}
                </View>
                <View style={styles.grid2x2Image}>
                    <Image 
                        source={{ uri: thumbnails[2] || validImages[2] }}
                        style={{ width: '100%', height: '100%' }}
                    />
                    {isVideoURL(validImages[2]) && (
                        <View style={styles.videoIndicator}>
                            <Icon name="play-circle" size={20} color="#FFFFFF" />
                        </View>
                    )}
                </View>
                <View style={styles.grid2x2Image}>
                    <Image 
                        source={{ uri: thumbnails[3] || validImages[3] }}
                        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    />
                    {isVideoURL(validImages[3]) && (
                        <View style={styles.videoIndicator}>
                            <Icon name="play-circle" size={20} color="#FFFFFF" />
                        </View>
                    )}
                    {itemCount && itemCount > 4 && (
                        <View style={styles.overlayMore}>
                            <Text style={styles.overlayText}>+{itemCount - 4}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.gridWrapper}>{gridContent}</View>
            <View style={styles.textBlock}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title?.trim() || 'Untitled'}</Text>
                <Text style={styles.count}>
                    {itemCount || validImages.length} 
                    {(itemCount || validImages.length) === 1 ? ' Item' : ' Items'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: cardWidth,
        // marginBottom: 18,
    },
    gridWrapper: {
        width: cardWidth,
        height: cardHeight,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#F3F3F3', // Light gray background instead of white
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
    placeholderText: {
        color: '#757575',
        fontSize: 14,
        fontFamily: FontFamilies.regular,
    },
    // 1 image
    fullImage: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
        position: 'relative',
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
        position: 'relative',
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
        position: 'relative',
    },
    rightColForThree: {
        width: '50%',
        height: '100%',
        flexDirection: 'column',
    },
    rightTopQuarterImage: {
        width: '100%',
        height: '50%',
        position: 'relative',
    },
    rightBottomQuarterImage: {
        width: '100%',
        height: '50%',
        position: 'relative',
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
        height: '50%',
        position: 'relative',
    },
    overlayMore: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomRightRadius: 18,
    },
    overlayText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    textBlock: {
        marginTop: 16,
        marginLeft: 4,
        minHeight: 36,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 16,
        fontFamily: FontFamilies.semibold,
        color: Color.black,
        fontWeight: '600',
    },
    count: {
        fontSize: 13,
        color: Color.grey,
        fontFamily: FontFamilies.regular,
        fontWeight: '400',
    },
    // Video indicator
    videoIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
});

export default SpaceCard;