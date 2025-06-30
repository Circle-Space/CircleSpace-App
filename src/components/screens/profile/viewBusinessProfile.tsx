import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  BackHandler,
  Alert,
  Linking,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Color,
  FontFamilies,
  FontSizes,
  LetterSpacings,
  LineHeights,
} from '../../../styles/constants';
// import PinnedReviews from './PinnedReviews';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { put } from '../../../services/dataRequest';
import LocationModal from '../../commons/LocationModal';
import PinnedReviews from './PinnedReviews';
import CustomAlertModal from '../../../components/commons/customAlert';
import BackButton from '../../commons/customBackHandler';
import { useRatings } from '../../../context/RatingContext';

export default function ViewBusinessProfile({ route }: any) {
  const navigation = useNavigation();
  const cleanedProfile = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const { reviewedReviews, fetchReviewedReviews } = useRatings();
  const [formData, setFormData] = useState({
    professionalType: cleanedProfile.professionalType || '',
    professionalCategory: cleanedProfile.professionalCategory || [],
    bio: cleanedProfile.bio || '',
    locationServed: cleanedProfile.locationServed || [],
    mobileNo: cleanedProfile.mobileNo?.replace('+91 ', '') || '',
    email: cleanedProfile.email || '',
    website: cleanedProfile.website || '',
    servicesProvided: cleanedProfile.servicesProvided || [],
    address: {
      city: cleanedProfile.address?.city || '',
    },
    socialMedia: {
      instagram: cleanedProfile.socialMedia?.instagram || '',
      pinterest: cleanedProfile.socialMedia?.pinterest || '',
      facebook: cleanedProfile.socialMedia?.facebook || '',
    },
  });
  const [stats, setStats] = useState({
    averageStars: cleanedProfile.averageStars || 0,
    totalRatings: cleanedProfile.totalRatings || 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    checkUserPermission();
    fetchReviewedReviews();
  }, []);

  const profileId = cleanedProfile?._id;

  useEffect(() => {
    
    if (user && reviewedReviews.length > 0 && profileId) {
      const hasUserReviewed = reviewedReviews.some(
        review => {
          return review?.giver === user._id;
        }
      );
      console.log("Has user reviewed", hasUserReviewed);
      setHasReviewed(hasUserReviewed);
    }
  }, [reviewedReviews, cleanedProfile?._id]);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setIsModalVisible(true); // Show the custom alert modal
        return true; // Prevent default back behavior
      };
      // Add event listener for hardware back press
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      // Clean up the event listener when the screen is unfocused
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  const [user, setUser] = useState<User | null>(null);

  const checkUserPermission = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      console.log('userData', userData);
      const user = JSON.parse(userData);
      
      console.log('user', user);
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user!);
        setCanEdit(user._id === cleanedProfile._id);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handleChange = (key: string, value: any) => {
    if (key === 'locationServed') {
      setFormData(prev => ({
        ...prev,
        locationServed: [value],
      }));
    } else if (key === 'mobileNo') {
      const cleanNumber = value.replace(/\D/g, '').replace(/^91/, '');
      setFormData(prev => ({
        ...prev,
        mobileNo: cleanNumber,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      const response = await put('user/update-user', formData);
      if (response.status === 200) {
        setIsEditing(false);
        console.log('response', response);
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleCategoryEdit = () => {
    navigation.navigate('MultiSelectCategory', {
      existingCategories: formData.professionalCategory,
      fromProfile: true,
      onSaveCategories: async categories => {
        try {
          const updatedData = {
            ...formData,
            professionalCategory: categories,
            servicesProvided: categories,
          };
          const response = await put('user/update-user', updatedData);
          if (response.status === 200) {
            setFormData(updatedData);
          }
        } catch (error) {
          console.error('Error saving categories:', error);
        }
      },
    });
  };

  const handleLocationSelect = (location: any) => {
    setFormData(prev => ({
      ...prev,
      locationServed: [location.City],
    }));
  };
  const [totalRatings, setTotalRatings] = useState(0);

  const handleStatsUpdate = (newStats: {
    rating: number;
    totalRatings: number;
  }) => {
    console.log('stats ::', newStats);
    setTotalRatings(newStats.totalRatings);
    setStats(newStats);
  };

  const renderDataOrFallback = (data: any) => {
    return data && data.length > 0 ? data : null;
  };

  const renderSocialIcons = () => {
    if (isEditing) {
      return (
        <View style={styles.socialContainer}>
          <View style={styles.socialInputContainer}>
            <Image
              source={require('../../../assets/profile/social/instagram.png')}
              style={styles.socialIconImage}
            />
            <TextInput
              style={styles.socialInput}
              placeholder="Instagram URL"
              value={formData.socialMedia.instagram}
              onChangeText={text =>
                handleChange('socialMedia', {
                  ...formData.socialMedia,
                  instagram: text,
                })
              }
            />
          </View>
          <View style={styles.socialInputContainer}>
            <Image
              source={require('../../../assets/profile/social/pinterest.png')}
              style={styles.socialIconImage}
            />
            <TextInput
              style={styles.socialInput}
              placeholder="Pinterest URL"
              value={formData.socialMedia.pinterest}
              onChangeText={text =>
                handleChange('socialMedia', {
                  ...formData.socialMedia,
                  pinterest: text,
                })
              }
            />
          </View>
          <View style={styles.socialInputContainer}>
            <Image
              source={require('../../../assets/profile/social/facebook.png')}
              style={styles.socialIconImage}
            />
            <TextInput
              style={styles.socialInput}
              placeholder="Facebook URL"
              value={formData.socialMedia.facebook}
              onChangeText={text =>
                handleChange('socialMedia', {
                  ...formData.socialMedia,
                  facebook: text,
                })
              }
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.socialContainer}>
        {formData.socialMedia.instagram && (
          <TouchableOpacity style={styles.socialIcon}>
            <Image
              source={require('../../../assets/profile/social/instagram.png')}
              style={styles.socialIconImage}
            />
          </TouchableOpacity>
        )}
        {formData.socialMedia.pinterest && (
          <TouchableOpacity style={styles.socialIcon}>
            <Image
              source={require('../../../assets/profile/social/pinterest.png')}
              style={styles.socialIconImage}
            />
          </TouchableOpacity>
        )}
        {formData.socialMedia.facebook && (
          <TouchableOpacity style={styles.socialIcon}>
            <Image
              source={require('../../../assets/profile/social/facebook.png')}
              style={styles.socialIconImage}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEditableField = (
    label: string,
    value: string,
    field: string,
    placeholder: string = '',
  ) => {
    if (field === 'professionalCategory') {
      return (
        <View style={styles.section}>
          <Text style={styles.label}>{label}</Text>
          <TouchableOpacity
            style={[styles.card, styles.categoryCard]}
            onPress={isEditing && formData?.professionalType !== "Other" ? handleCategoryEdit : undefined}>
            <View style={styles.categoryContent}>
              <Image
                source={require('../../../assets/icons/tagIcon.png')}
                style={[styles.categoryIcon, { tintColor: Color.black }]}
              />
              <Text style={[styles.cardText, styles.categoryText]}>
                {formData.professionalType !== "Other" && formData?.servicesProvided?.length > 0 ? (
                  <>
                    {formData.servicesProvided[0]}
                    {formData.servicesProvided.length > 1 && (
                      <Text style={styles.moreServicesText}>
                        {` & ${formData.servicesProvided.length - 1} more`}
                      </Text>
                    )}
                  </>
                ) : (
                  formData?.professionalType || 'No data added'
                )}
              </Text>
            </View>
            {isEditing && formData?.professionalType !== "Other" && (
              <Icon name="chevron-right" size={24} color={Color.white} />
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (field === 'locationServed') {
      return (
        <View style={styles.section}>
          <Text style={styles.label}>{label}</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={isEditing ? () => setShowLocationModal(true) : undefined}>
            <View style={styles.locationContent}>
              {/* <Image 
                source={require('../../../assets/icons/locationIcon.png')}
                style={styles.locationIcon}
              /> */}
              <Text style={styles.cardText}>
                {formData.locationServed[0] || ''}
              </Text>
            </View>
            {isEditing && <Icon name="chevron-right" size={24} color="#000" />}
          </TouchableOpacity>
        </View>
      );
    }

    if (field === 'mobileNo') {
      return (
        <View style={styles.section}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.card}>
            <View style={styles.locationContent}>
              <Image
                source={require('../../../assets/icons/phoneIcon.png')}
                style={styles.locationIcon}
              />
              <Text style={styles.cardText}>{value || ''}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (field === 'email') {
      return (
        <View style={styles.section}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.card}>
            <View style={styles.locationContent}>
              {/* <Image 
                source={require('../../../assets/icons/mailIcon.png')}
                style={styles.locationIcon}
              /> */}
              <Text style={styles.cardText}>{value}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (field === 'website') {
      return (
        <View style={styles.section}>
          <Text style={styles.label}>{label}</Text>
          {isEditing ? (
            <View style={styles.card}>
              <TextInput
                style={styles.cardText}
                value={value}
                onChangeText={text => handleChange(field, text)}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.card, value ? styles.clickableLink : null]}
              onPress={() => {
                if (value) {
                  const url = value.startsWith('http')
                    ? value
                    : `https://${value}`;
                  Linking.openURL(url).catch(err => {
                    console.error('Error opening URL:', err);
                    Alert.alert('Error', 'Could not open the website');
                  });
                }
              }}>
              <View style={styles.locationContent}>
                <Text style={[styles.cardText, value ? styles.linkText : null]}>
                  {value || 'Not provided'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (isEditing) {
      return (
        <View style={styles.section}>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.card, field === 'bio' && styles.bioCard]}>
            <View style={styles.locationContent}>
              {field === 'email' && (
                <Image
                  source={require('../../../assets/icons/mailIcon.png')}
                  style={styles.locationIcon}
                />
              )}
              {field === 'mobileNo' && (
                <Image
                  source={require('../../../assets/icons/phoneIcon.png')}
                  style={styles.locationIcon}
                />
              )}
              <TextInput
                style={[
                  styles.cardText,
                  styles.input,
                  field === 'bio' && styles.bioInput,
                ]}
                value={value}
                onChangeText={text => {
                  if (field === 'bio' && text.length <= 135) {
                    handleChange(field, text);
                  } else if (field !== 'bio') {
                    handleChange(field, text);
                  }
                }}
                placeholder={placeholder}
                multiline={field === 'bio'}
                numberOfLines={field === 'bio' ? 4 : 1}
                maxLength={field === 'bio' ? 135 : undefined}
              />
            </View>
            {field === 'bio' && (
              <Text style={styles.charCount}>
                {`${135 - (value?.length || 0)}`}
              </Text>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>{value}</Text>
        </View>
      </View>
    );
  };

  const handleDiscardChanges = () => {
    setIsModalVisible(true);
  };

  const handleModalConfirm = () => {
    setIsModalVisible(false);
    setIsEditing(false);
    navigation.goBack();
    // Reset form data to original values
    setFormData({
      professionalCategory: cleanedProfile.professionalCategory || [],
      bio: cleanedProfile.bio || '',
      locationServed: cleanedProfile.locationServed || [],
      mobileNo: cleanedProfile.mobileNo?.replace('+91 ', '') || '',
      email: cleanedProfile.email || '',
      website: cleanedProfile.website || '',
      servicesProvided: cleanedProfile.servicesProvided || [],
      address: {
        city: cleanedProfile.address?.city || '',
      },
      socialMedia: {
        instagram: cleanedProfile.socialMedia?.instagram || '',
        pinterest: cleanedProfile.socialMedia?.pinterest || '',
        facebook: cleanedProfile.socialMedia?.facebook || '',
      },
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <View style={styles.headerLeftSection}>
              <TouchableOpacity style={styles.backButton}>
                <BackButton />
              </TouchableOpacity>
            </View>
            <View style={styles.headerCenterSection}>
              <Text style={styles.headerText}>Professional Details</Text>
            </View>

            <View style={styles.headerRightSection}>
              {canEdit && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(!isEditing)}>
                  {isEditing ? (
                    <Text style={styles.editText}></Text>
                  ) : (
                    <Image
                      source={require('../../../assets/icons/editIcon.png')}
                      style={styles.icon}
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category */}
          {renderEditableField(
            'Category',
            formData.professionalCategory.join(' & ') || 'Select Categories',
            'professionalCategory',
          )}

          {/* About */}
          {renderEditableField('About', formData.bio || '', 'bio')}

          {/* Location */}
          {renderEditableField(
            'Location',
            formData.locationServed[0] || '',
            'locationServed',
            'Enter your location',
          )}

          {/* Contact No */}
          {/* {renderEditableField(
            'Contact No.',
            formData.mobileNo ? `+91 ${formData.mobileNo}` : '',
            'mobileNo',
            'Enter your 10-digit number'
          )} */}

          {/* Email ID */}
          {renderEditableField('Email ID', formData.email || '', 'email')}

          {/* Website Link */}
          {renderEditableField(
            'Website Link',
            formData.website || '',
            'website',
          )}

          {/* Social Media */}
          {/* <View style={styles.section}>
            <Text style={styles.label}>Social Media</Text>
            {renderSocialIcons()}
          </View> */}

          {/* Services Provided */}
          {/* <View style={styles.section}>
            <Text style={styles.label}>Services Provided</Text>
            <View style={styles.card}>
              <Text style={styles.cardText}>
                {cleanedProfile.servicesProvided?.join(', ') || 'Interior Design, Architecture, Furniture'}
              </Text>
            </View>
          </View> */}
          {/* 
          Active Since
          <View style={styles.section}>
            <Text style={styles.label}>Active Since</Text>
            <View style={styles.card}>
              <Text style={styles.cardText}>
                {cleanedProfile.activeSince || '2009'}
              </Text>
            </View>
          </View> */}

          {/* GSTIN */}
          {/* <View style={styles.section}>
            <Text style={styles.label}>GSTIN</Text>
            <View style={styles.card}>
              <Text style={styles.cardText}>
                {cleanedProfile.gstin || 'xxxxxxxxxxxxxxx'}
              </Text>
            </View>
          </View> */}

          {/* Commenting out Ratings & Reviews Section */}
          <View style={[styles.section, styles.ratingSection]}>
            <TouchableOpacity
              style={styles.ratingHeader}
              onPress={() =>
                navigation.navigate('RatingsAndReviews', {
                  profile: cleanedProfile,
                })
              }>
              <Text style={styles.ratingTitle}>Ratings & Reviews</Text>
              <Image
                source={require('../../../assets/icons/rightarrow.png')}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>

            <View style={styles.ratingContent}>
              <View style={styles.ratingScore}>
                <View style={styles.ratingRow}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('RatingsAndReviews', {
                        profile: cleanedProfile,
                      })
                    }>
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
                            star <= stats.averageStars
                              ? require('../../../assets/icons/starFilled.png')
                              : require('../../../assets/icons/starUnfilled.png')
                          }
                          style={styles.starIcon}
                        />
                      ))}
                    </View>
                    <Text style={styles.ratingCount}>
                      {stats.totalRatings} Ratings
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.pinnedReviewsTitle}>Reviews</Text>
            <PinnedReviews
              userId={cleanedProfile._id}
              onStatsUpdate={handleStatsUpdate}
            />
          </View>
        </ScrollView>

        <LocationModal
          visible={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onSelect={handleLocationSelect}
        />

        {isModalVisible && (
          <CustomAlertModal
            visible={isModalVisible}
            title="Discard Changes"
            description="The changes will not be saved. Are you sure you want to discard these changes?"
            buttonOneText="Discard"
            buttonTwoText="Cancel"
            onPressButton1={handleModalConfirm}
            onPressButton2={handleModalCancel}
          />
        )}

        {canEdit ? (
          <View style={styles.bottomButtonContainer}>
            {isEditing ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.bottomButton, styles.saveButton]}
                  onPress={handleSave}>
                  <Text style={styles.bottomButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.bottomButtonContainer}>
            {/* {!hasReviewed && ( */}
              <TouchableOpacity
                style={styles.bottomButton}
                onPress={() => {
                  navigation.navigate('AddReview', { profile: cleanedProfile });
                }}>
                <Text style={styles.bottomButtonText}>Add review</Text>
              </TouchableOpacity>
            {/* )} */}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 15,
    marginBottom: 20,
  },
  headerLeftSection: {
    flex: 0.2,
  },
  headerCenterSection: {
    flex: 0.6,
    alignItems: 'center',
  },
  headerRightSection: {
    flex: 0.2,
    alignItems: 'flex-end',
  },
  icon: {
    width: 20,
    height: 20,
  },
  backButton: {},
  editButton: {},
  editText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Color.black,
    fontFamily: FontFamilies.semibold,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Color.black,
    fontFamily: FontFamilies.semibold,
    textAlign: 'center',
  },

  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#81919E',
    fontFamily: FontFamilies.regular,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    padding: 15,
    borderRadius: 12,
    minHeight: 46,
    // Shadow for iOS
    // shadowColor: '#000000',
    // shadowOffset: {
    //   width: 0,
    //   height: 0,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 25,
    // // Shadow for Android
    // elevation: 5,
  },
  iconStyle: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  cardText: {
    flex: 1,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: '#1E1E1E',
    letterSpacing: LetterSpacings.wide,
    lineHeight: LineHeights.small,
  },
  socialContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIconImage: {
    width: 30,
    height: 30,
    // tintColor: '#fff',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.black,
    height: 46,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  tagText: {
    marginLeft: 10,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
    color: Color.white,
    letterSpacing: LetterSpacings.wide,
    lineHeight: LineHeights.small,
  },
  input: {
    padding: 0,
    margin: 0,
    flex: 1,
  },
  bioCard: {
    minHeight: 100,
    position: 'relative',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
    paddingRight: 9,
  },
  charCount: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    fontSize: 12,
    color: '#666',
    fontFamily: FontFamilies.regular,
  },
  categoryCard: {
    backgroundColor: '#F3F3F3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  categoryText: {
    color: Color.black,
    flex: 1,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  socialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  socialInput: {
    flex: 1,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: '#1E1E1E',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Color.black,
  },
  ratingNumber: {
    fontSize: 50,
    fontWeight: 'bold',
    color: Color.black,
  },
  ratingRightSection: {
    marginLeft: 12,
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
  },
  pinnedReviewsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginTop: 1,
    marginBottom: 16,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  ratingContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  ratingScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  ratingSection: {
    marginBottom: 12,
    paddingBottom: 75,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.black,
    marginBottom: 8,
  },
  discardButton: {
    backgroundColor: Color.white,
    borderWidth: 1,
    borderColor: Color.black,
  },
  saveButton: {
    backgroundColor: Color.black,
  },
  bottomButtonText: {
    color: Color.white,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.semibold,
  },
  discardButtonText: {
    color: Color.black,
  },
  clickableLink: {
    // borderBottomWidth: 1,
  },
  linkText: {
    color: Color.black,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
  },
  moreServicesText: {
    color: Color.grey,
    fontSize: FontSizes.small,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
  },
});
