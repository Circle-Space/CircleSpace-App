import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Linking,
} from 'react-native';
import { Color, FontFamilies, FontSizes } from '../../../styles/constants';
import BackButton from '../../commons/customBackHandler';
import PinnedReviews from '../../screens/profile/PinnedReviews';
import { useRatings } from '../../../context/RatingContext';
import ProfileView from './profileView';
import PinnedReviewsVertical from '../profile/PinnedReviewsVertical';

type ProfessionalDetailParams = {
    id?: string;
    name?: string;
    professionalType?: string;
    professionalCategory?: string[];
    bio?: string;
    locationServed?: string[];
    mobileNo?: string;
    email?: string;
    website?: string;
    servicesProvided?: string[];
    address?: {
        city?: string;
    };
    socialMedia?: {
        instagram?: string;
        pinterest?: string;
        facebook?: string;
    };
    averageStars?: number;
    totalRatings?: number;
};

const ProfessionalDetailRewamped: React.FC<any> = ({ route, navigation }) => {
    const { profile, self } = route.params;
    console.log(profile, 'profileaa');
    console.log(self, 'selfaaa');
    // const [stats, setStats] = useState({
    //     averageStars: profile?.averageStars || 0,
    //     totalRatings: profile?.totalRatings || 0,
    // });
    // console.log(stats, 'stats');
    const { fetchUserReviews, stats } = useRatings();

    useEffect(() => {
        fetchUserReviews(profile?._id || self?._id || '');
    }, []);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleStatsUpdate = (newStats: { rating: number; totalRatings: number }) => {
        setStats(prev => ({
            ...prev,
            averageStars: newStats.rating,
            totalRatings: newStats.totalRatings,
        }));
    };

    const renderSocialIcons = () => {
        if (!profile?.socialMedia) return null;

        return (
            <View style={styles.socialContainer}>
                {profile.socialMedia.instagram && (
                    <TouchableOpacity
                        style={styles.socialIcon}
                        onPress={() => {
                            try {
                                const url = profile.socialMedia?.instagram;
                                if (url) Linking.openURL(url);
                            } catch (error) {
                                console.error('Error opening Instagram URL:', error);
                            }
                        }}
                    >
                        <Image
                            source={require('../../../assets/profile/social/instagram.png')}
                            style={styles.socialIconImage}
                        />
                    </TouchableOpacity>
                )}
                {profile.socialMedia.pinterest && (
                    <TouchableOpacity
                        style={styles.socialIcon}
                        onPress={() => {
                            try {
                                const url = profile.socialMedia?.pinterest;
                                if (url) Linking.openURL(url);
                            } catch (error) {
                                console.error('Error opening Pinterest URL:', error);
                            }
                        }}
                    >
                        <Image
                            source={require('../../../assets/profile/social/pinterest.png')}
                            style={styles.socialIconImage}
                        />
                    </TouchableOpacity>
                )}
                {profile.socialMedia.facebook && (
                    <TouchableOpacity
                        style={styles.socialIcon}
                        onPress={() => {
                            try {
                                const url = profile.socialMedia?.facebook;
                                if (url) Linking.openURL(url);
                            } catch (error) {
                                console.error('Error opening Facebook URL:', error);
                            }
                        }}
                    >
                        <Image
                            source={require('../../../assets/profile/social/facebook.png')}
                            style={styles.socialIconImage}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderCategory = () => {
        if (!profile?.professionalType && !profile?.servicesProvided?.length) {
            return <Text style={[styles.cardText, styles.categoryText]}>No data added</Text>;
        }

        if (profile.professionalType === "Other" || !profile.servicesProvided?.length) {
            return <Text style={[styles.cardText, styles.categoryText]}>
                {profile.professionalType || 'No data added'}
            </Text>;
        }

        return (
            <View style={styles.rowContent}>
                <Text style={[styles.cardText, styles.categoryText]}>
                    {profile.servicesProvided[0]}
                    {profile.servicesProvided.length > 1 && (
                        <Text style={styles.moreServicesText}>
                            {` & ${profile.servicesProvided.length - 1} more`}
                        </Text>
                    )}
                </Text>
            </View>
        );
    };

    const handleWebsitePress = () => {
        try {
            const url = profile?.website;
            if (!url) return;

            const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
            Linking.openURL(formattedUrl).catch(err => {
                console.error('Error opening URL:', err);
            });
        } catch (error) {
            console.error('Error handling website press:', error);
        }
    };

    const renderField = (label: string, content: React.ReactNode, icon?: any) => {
        if (!content) return null;

        const isCategory = label === 'Category';

        return (
            <View style={styles.section}>
                <Text style={[
                    styles.label,
                    isCategory && styles.categoryLabel
                ]}>{label}</Text>
                <View style={[
                    styles.card,
                    isCategory && styles.categoryCard
                ]}>
                    <View style={styles.rowContent}>
                        {icon && (
                            <Image
                                source={icon}
                                style={[
                                    styles.icon,
                                    isCategory && styles.categoryIcon
                                ]}
                            />
                        )}
                        {typeof content === 'string' ? (
                            <Text style={[
                                styles.cardText,
                                isCategory && styles.categoryText
                            ]}>{content}</Text>
                        ) : (
                            content
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <BackButton />
                </TouchableOpacity>
                <Text style={styles.headerText}>Professional Details</Text>
                {self ? (
                    <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfileRewamped', {
                        firstName: profile?.firstName,
                        username: profile?.username,
                        bio: profile?.bio,
                        aboutUs: profile?.aboutUs,
                        servicesProvided: profile?.servicesProvided || [],
                        address: profile?.address,
                        teamSize: profile?.teamSize,
                        businessEmail: profile?.businessEmail,
                        mobileNo: profile?.mobileNo,
                        website: profile?.website,
                        activeSince: profile?.activeSince,
                        socialMedia: profile?.socialMedia || {},
                        certifications: profile?.certifications || [],
                        awards: profile?.awards || [],
                        achievements: profile?.achievements || [],
                        profilePic: profile?.profilePic,
                        GSTIN: profile?.GSTIN,
                        ...profile
                    })}>
                        <Image
                            source={require('../../../assets/icons/editIcon.png')}
                            style={styles.editIcon}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerPlaceholder} />
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
            <ProfileView
                category={profile?.servicesProvided || []}
                aboutUs={profile?.aboutUs || ''}
                location={profile?.locationServed?.[0] || profile?.address?.city || ''}
                contactNumber={`+91 ${profile?.mobileNo || ''}`}
                email={profile?.businessEmail || ''}
                website={profile?.website || ''}
                socialMedia={profile?.socialMedia || {}}
                activeSince={profile?.activeSince || ''} // Replace with actual year if dynamic
                gstNumber={profile?.GSTIN || ''} // Replace with actual GST if available
                />

                {/* Ratings & Reviews Section */}
                <View style={styles.ratingSection}>
                    <TouchableOpacity
                        style={styles.ratingHeader}
                        onPress={() => {
                            navigation.navigate('RatingsAndReviews', {
                                profile: profile,
                            })
                        }}
                    >
                        <Text style={styles.ratingTitle}>Ratings & Reviews</Text>
                        <Image
                            source={require('../../../assets/icons/rightarrow.png')}
                            style={styles.arrowIcon}
                        />
                    </TouchableOpacity>

                    <View style={styles.ratingContent}>
                        <View style={styles.ratingScore}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (profile?.id) {
                                        navigation.navigate('RatingsAndReviews', {
                                            profile: profile,
                                        });
                                    }
                                }}
                            >
                                <Text style={styles.ratingNumber}>
                                    {stats?.averageStars?.toFixed(1)}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.ratingRightSection}>
                                <View style={styles.starContainer}>
                                    {[1, 2, 3, 4, 5].map((star, index) => (
                                        <Image
                                            key={index}
                                            source={
                                                star <= (stats?.averageStars || 0)
                                                    ? require('../../../assets/icons/starFilled.png')
                                                    : require('../../../assets/icons/starUnfilled.png')
                                            }
                                            style={styles.starIcon}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.ratingCount}>
                                    {stats?.totalRatings || 0} Ratings
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.pinnedReviewsTitle}>Pinned Reviews</Text>
                    {profile?._id && (
                        <PinnedReviews
                            userId={profile?._id}
                            // onStatsUpdate={stats}    
                            route={profile || self}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Add Review Button */}
            {!self && (
                <TouchableOpacity
                    style={styles.addReviewButton}
                    onPress={() => {
                        navigation.navigate('AddReview', { profile: profile });
                    }}
                >
                    <Text style={styles.addReviewText}>Add review</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerPlaceholder: {
        width: 40,
        height: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 16,
        color: Color.black,
        fontFamily: FontFamilies.semibold,
    },
    editButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIcon: {
        width: 24,
        height: 24,
        tintColor: Color.black,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: '#656565',
        fontFamily: FontFamilies.regular,
        fontWeight: '400',
        marginBottom: 8,
    },
    card: {
        backgroundColor: '#F3F3F3',
        padding: 16,
        borderRadius: 12,
        minHeight: 48,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 16,
        height: 16,
        marginRight: 12,
    },
    cardText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '400',
        color: '#000000',
        fontFamily: FontFamilies.semibold,
    },
    clickableCard: {
        opacity: 0.8,
    },
    linkText: {
        color: '#0066CC',
        textDecorationLine: 'underline',
    },
    socialContainer: {
        flexDirection: 'row',
        gap: 16,
        paddingVertical: 8,
    },
    socialIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialIconImage: {
        width: 24,
        height: 24,
        tintColor: '#fff',
    },
    ratingSection: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    ratingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    ratingTitle: {
        fontSize: 16,
        color: Color.black,
        fontFamily: FontFamilies.semibold,
    },
    arrowIcon: {
        width: 20,
        height: 20,
    },
    ratingContent: {
        marginBottom: 24,
    },
    ratingScore: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingNumber: {
        fontSize: 48,
        color: Color.black,
        fontFamily: FontFamilies.bold,
    },
    ratingRightSection: {
        marginLeft: 16,
    },
    starContainer: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 4,
    },
    starIcon: {
        width: 16,
        height: 16,
    },
    ratingCount: {
        fontSize: 12,
        color: '#666666',
        fontFamily: FontFamilies.regular,
    },
    pinnedReviewsTitle: {
        fontSize: 14,
        color: Color.black,
        fontFamily: FontFamilies.semibold,
        marginBottom: 16,
    },
    addReviewButton: {
        position: 'absolute',
        bottom: 26,
        left: 16,
        right: 16,
        backgroundColor: Color.black,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addReviewText: {
        color: Color.white,
        fontSize: 16,
        fontFamily: FontFamilies.medium,
    },
    moreServicesText: {
        color: '#FFFFFF',
        fontSize: FontSizes.small,
        fontWeight: '400',
        fontFamily: FontFamilies.medium,
    },
    websiteTouchable: {
        flex: 1,
    },
    categoryLabel: {
        color: '#FFFFFF',
    },
    categoryCard: {
        backgroundColor: '#000000',
    },
    categoryIcon: {
        tintColor: '#FFFFFF',
    },
    categoryText: {
        color: '#FFFFFF',
        fontFamily: FontFamilies.semibold,
    },
});

export default ProfessionalDetailRewamped;
