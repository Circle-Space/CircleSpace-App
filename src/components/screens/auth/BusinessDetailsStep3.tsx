import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../styles/constants';
import BackButton from '../../commons/customBackHandler';
import InstagramIcon from '../../../assets/profile/businessPage/instagram.png';
import PinterestIcon from '../../../assets/profile/businessPage/pinterest.png';
import FacebookIcon from '../../../assets/profile/businessPage/facebook.png';
import WebIcon from '../../../assets/profile/businessPage/web.png';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomAlertModal from '../../commons/customAlert';

const MAX_BIO = 135;
const MAX_ABOUT = 500;

const BusinessDetailsStep3 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [bio, setBio] = useState('');
  const [aboutUs, setAboutUs] = useState('');
  const [selectedSocial, setSelectedSocial] = useState('instagram');
  const [socialLinks, setSocialLinks] = useState<{
    [key: string]: string;
  }>(
    {
      instagram: '',
      pinterest: '',
      facebook: '',
      web: '',
    }
  );
  const [website, setWebsite] = useState('');
  const [socialLinkErrors, setSocialLinkErrors] = useState<{
    [key: string]: string;
  }>(
    {
      instagram: '',
      pinterest: '',
      facebook: '',
      web: '',
    }
  );
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationAlertMsg, setValidationAlertMsg] = useState('');
  const socialIcons = [
    { id: 'instagram', icon: InstagramIcon, placeholder: 'Instagram Link' },
    { id: 'pinterest', icon: PinterestIcon, placeholder: 'Pinterest Link' },
    { id: 'facebook', icon: FacebookIcon, placeholder: 'Facebook Link' },
    { id: 'web', icon: WebIcon, placeholder: 'Website Link' },
  ];

  const validateInstagram = (url: string) => {
    if (!url) return '';
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)?instagram\.com\/[A-Za-z0-9._%-]+\/?(\?.*)?$/;
    return regex.test(url) ? '' : 'Invalid Instagram URL';
  };

  const validatePinterest = (url: string) => {
    if (!url) return '';
    const regex = /^(https?:\/\/)?(([a-zA-Z0-9-]+\.)?pinterest\.com|pin\.it)\/[A-Za-z0-9._%-]+\/?(\?.*)?$/;
    return regex.test(url) ? '' : 'Invalid Pinterest URL';
  };

  const validateFacebook = (url: string) => {
    if (!url) return '';
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)?facebook\.com\/[A-Za-z0-9._%-]+\/?(\?.*)?$/;
    return regex.test(url) ? '' : 'Invalid Facebook URL';
  };

  const validateWebsite = (url: string) => {
    if (!url) return '';
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
    return regex.test(url) ? '' : 'Invalid website URL';
  };

  const handleNext = () => {
    // Validate all social links before proceeding
    let errors: string[] = [];
    Object.entries(socialLinks).forEach(([key, value]) => {
      let error = '';
      if (key === 'instagram') error = validateInstagram(value);
      if (key === 'pinterest') error = validatePinterest(value);
      if (key === 'facebook') error = validateFacebook(value);
      if (key === 'web') error = validateWebsite(value);
      if (error) errors.push(error);
      setSocialLinkErrors(prev => ({ ...prev, [key]: error }));
    });
    if (errors.length > 0) {
      setValidationAlertMsg(errors.join('\n'));
      setShowValidationAlert(true);
      return;
    }
    console.log('data ::',route.params,bio,aboutUs,socialLinks,website);
    (navigation.navigate as any)('BusinessDetailsStep4', {
      ...route.params,
      bio,
      aboutUs,
      socialLinks: {
        ...socialLinks,
      },
      website,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{flex:1}}
      keyboardVerticalOffset={Platform.OS === "ios" ? -10 : 20}
      >
      <View style={{top:10,marginBottom:15}}>
        <BackButton/>
      </View>
      {/* Progress Bar and Step */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
        <View style={styles.stepBox}>
          <Text style={styles.stepText}>2/3</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={styles.header}>Business Details</Text>
        <Text style={styles.hint}>Add details that help clients and collaborators understand your work.</Text>
        <Text style={styles.label}>Bio</Text>
        <View style={styles.bioInputWrapper}>
          <TextInput
            style={styles.inputBio}
            value={bio}
            onChangeText={text => text.length <= 135 && setBio(text)}
            placeholder="Enter Bio"
            placeholderTextColor="#888"
            multiline
            maxLength={135}
          />
          <Text style={styles.bioCharCount}>{135 - bio.length}</Text>
        </View>
        <Text style={styles.label}>About Us</Text>
        <View style={styles.bioInputWrapper}>
          <TextInput
            style={styles.inputBio}
            value={aboutUs}
            onChangeText={setAboutUs}
            placeholder="Enter About Us"
            placeholderTextColor="#888"
            multiline
          />
        </View>
        {/* Social Links */}
        <Text style={styles.label}>Social Links</Text>
        <View style={styles.socialIconsRow}>
          {socialIcons.map(social => (
            <TouchableOpacity
              key={social.id}
              style={[styles.socialIconCircle, selectedSocial === social.id && styles.socialIconCircleActive]}
              onPress={() => setSelectedSocial(social.id)}
              activeOpacity={0.7}
            >
              <Image source={social.icon} style={styles.socialIconImg} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.socialInputWrapper}>
          <TextInput
            style={styles.socialInput}
            placeholder={socialIcons.find(s => s.id === selectedSocial)?.placeholder}
            placeholderTextColor="#888"
            value={selectedSocial === 'web' ? website : socialLinks[selectedSocial as keyof typeof socialLinks]}
            onChangeText={text => {
              let error = '';
              if (selectedSocial === 'web') {
                setWebsite(text);
                setSocialLinks({ ...socialLinks, web: text });
                error = validateWebsite(text);
              } else if (selectedSocial === 'instagram') {
                setSocialLinks({ ...socialLinks, instagram: text });
                error = validateInstagram(text);
              } else if (selectedSocial === 'pinterest') {
                setSocialLinks({ ...socialLinks, pinterest: text });
                error = validatePinterest(text);
              } else if (selectedSocial === 'facebook') {
                setSocialLinks({ ...socialLinks, facebook: text });
                error = validateFacebook(text);
              }
              setSocialLinkErrors(prev => ({ ...prev, [selectedSocial]: error }));
            }}
          />
        </View>
        {socialLinkErrors[selectedSocial] ? (
          <Text style={{ color: '#000', fontSize: 12, marginTop: 4 }}>{socialLinkErrors[selectedSocial]}</Text>
        ) : null}
      </ScrollView>
      {/* Next/Previous Buttons Footer */}
      <View style={styles.footerBtnRow}>
        <TouchableOpacity style={styles.prevBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#111" style={{ marginRight: 8 }} />
          <Text style={styles.prevBtnText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Next</Text>
          <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
      <CustomAlertModal
        visible={showValidationAlert}
        onClose={() => setShowValidationAlert(false)}
        title="Validation Error"
        description={validationAlertMsg}
        buttonOneText="OK"
        onPressButton1={() => setShowValidationAlert(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    marginHorizontal: 20,
  },
  progressBarBg: {
    flex: 1,
    height: 7,
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
    marginRight: 10,
  },
  progressBarFill: {
    width: '66.66%', // 3/4th progress
    height: 7,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  stepBox: {
    backgroundColor: '#000',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stepText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  header: {
    fontSize: FontSizes.large2,
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    marginBottom: 10,
    marginLeft: 2,
  },
  hint: {
    color: Color.primarygrey,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    marginBottom: 18,
    marginRight: 10,
    marginLeft: 2,
  },
  label: {
    fontSize: FontSizes.medium2,
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    marginBottom: 8,
    marginTop: 10,
    marginLeft: 2,
  },
  bioInputWrapper: {
    position: 'relative',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    minHeight: 80,
    marginBottom: 18,
    justifyContent: 'flex-end',
  },
  inputBio: {
    minHeight: 80,
    padding: 16,
    paddingBottom: 28,
    fontSize: 15,
    color: '#222',
    backgroundColor: 'transparent',
    borderRadius: 16,
    textAlignVertical: 'top',
  },
  bioCharCount: {
    position: 'absolute',
    right: 16,
    bottom: 10,
    color: '#888',
    fontSize: 13,
  },
  footerBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginRight: 8,
    flex: 1,
    justifyContent: 'center',
  },
  prevBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginLeft: 8,
    flex: 1,
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  socialIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  socialIconCircleActive: {
    backgroundColor: '#111',
  },
  socialIconImg: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  socialInputWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  socialInput: {
    fontSize: 15,
    color: '#222',
  },
});

export default BusinessDetailsStep3; 