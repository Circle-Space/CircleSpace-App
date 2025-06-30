import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { Color, FontFamilies, FontSizes } from '../../../styles/constants';
import CustomAlertModal from '../../commons/customAlert';

interface ProfileViewProps {
  category: string[];
  aboutUs: string;
  location: string;
  contactNumber: string;
  email: string;
  website: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    pinterest?: string;
  };
  activeSince: string;
  gstNumber: string;
  servicesProvided?: string[];
}

const ProfileView: React.FC<ProfileViewProps> = ({
  category,
  aboutUs,
  location,
  contactNumber,
  email,
  website,
  socialMedia,
  activeSince,
  gstNumber,
  servicesProvided,
}) => {
    console.log(category, 'category');
    console.log(aboutUs, 'aboutUs');
    console.log(location, 'location');
    console.log(contactNumber, 'contactNumber');
    console.log(email, 'email');
    console.log(website, 'website');
    console.log(socialMedia, 'socialMedia');
    console.log(activeSince, 'activeSince');
    const [isModalVisible, setIsModalVisible] = useState(false);
  const openLink = (url?: string) => {
    if (!url) {
      // Alert.alert('Error', 'No link available');
      setIsModalVisible(true);
      return;
    }
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(formattedUrl).catch(err => {
      Alert.alert('Error', 'Could not open the link');
      console.error('Error opening URL:', err);
    });
  };

  const formatYear = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear().toString();
    } catch (error) {
      return dateString;
    }
  };

  const renderRow = (label: string, value: string | string[], icon?: any) => (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rowBox}>
        {icon && <Image source={icon} style={styles.icon} />}
        <Text style={styles.value}>
          {Array.isArray(value) ? value.join(', ') : value || ''}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderRow('Category', category)}
      {renderRow('About', aboutUs)}
      {renderRow('Location', location, require('../../../assets/icons/loactionIcon.png'))}
      {renderRow('Contact No.', contactNumber, require('../../../assets/icons/phoneIcon.png'))}
      {renderRow('Email ID', email, require('../../../assets/icons/mailIcon.png'))}
      {/* {renderRow('Website Link', website)} */}
      <View style={styles.section}>
      <Text style={styles.label}>Website Link</Text>
      <View style={styles.rowBox}>
      <TouchableOpacity onPress={() => openLink(website)}>
        <Text style={styles.value}>{website}</Text>
      </TouchableOpacity>
      </View>
    </View>

      <View style={styles.section}>
        <Text style={styles.label}>Social Media</Text>
        <View style={styles.socialContainer}>
            <TouchableOpacity 
              onPress={() => openLink(socialMedia.instagram)}
              style={styles.socialIconContainer}
            >
              <Image source={require('../../../assets/icons/instagram.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => openLink(socialMedia.pinterest)}
              style={styles.socialIconContainer}
            >
              <Image source={require('../../../assets/icons/pinterest.png')} style={styles.socialIcon} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => openLink(socialMedia.facebook)}
              style={styles.socialIconContainer}
            >
              <Image source={require('../../../assets/icons/facebook.png')} style={styles.socialIcon} />
            </TouchableOpacity>

        </View>
      </View>

      {servicesProvided && servicesProvided.length > 0 && renderRow('Services Provided', servicesProvided)}
      {renderRow('Active Since', formatYear(activeSince))}
      {renderRow('GSTIN', gstNumber)}
      <CustomAlertModal
        visible={isModalVisible}
        title="Error"
        description="No link available"
        buttonOneText="OK"
        onPressButton1={() => setIsModalVisible(false)}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: FontSizes.small,
    color: '#666',
    fontFamily: FontFamilies.regular,
    marginBottom: 8,
  },
  rowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 10,
    tintColor: '#000',
  },
  value: {
    fontSize: FontSizes.small,
    color: Color.black,
    fontFamily: FontFamilies.medium,
    flex: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
});

export default ProfileView;