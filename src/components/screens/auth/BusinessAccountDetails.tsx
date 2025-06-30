import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../styles/constants';
import BackButton from '../../commons/customBackHandler';

const BusinessAccountDetails = () => {
  const route = useRoute();
  const { businessName: initialBusinessName, businessUsername: initialBusinessUsername } = route.params as { businessName: string; businessUsername: string };
  const navigation = useNavigation();
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [businessUsername, setBusinessUsername] = useState(initialBusinessUsername);
  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const validate = () => {
    let valid = true; 
    if (!businessName.trim()) {
      setNameError('Business Name is required');
      valid = false;
    } else {
      setNameError('');
    }
    if (!businessUsername.trim()) {
      setUsernameError('Business Username is required');
      valid = false;
    } else if (businessUsername.length < 4) {
      setUsernameError('Username must be at least 4 characters');
      valid = false;
    } else if (/[^a-zA-Z0-9._]/.test(businessUsername)) {
      setUsernameError('Only letters, numbers, dots, and underscores allowed');
      valid = false;
    } else {
      setUsernameError('');
    }
    return valid;
  };

  const handleNext = () => {
    if (validate()) {
      // Navigate to next form, pass data as needed
    //   (navigation.navigate as any)('NextBusinessForm', {
    //     businessName,
    //     businessUsername,
    //   });
    console.log('data ::',route.params,businessName,businessUsername);
    navigation.navigate('BusinessDetailsStep2' as never, {
      ...route.params,
      businessName,
      businessUsername,
    });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{top:10}}>
        <BackButton/>
      </View>
      {/* Progress Bar and Step */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
        <View style={styles.stepBox}>
          <Text style={styles.stepText}>1/4</Text>
        </View>
      </View>

      {/* Form Fields */}
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Business Name *</Text>
        <Text style={styles.hint}>Use something that represents what you do.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Business Name*"
          placeholderTextColor="#BDBDBD"
          value={businessName}
          onChangeText={setBusinessName}
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

        <Text style={[styles.label, { marginTop: 30 }]}>Business Username *</Text>
        <Text style={styles.hint}>Use something that people should search to find you.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Business Username*"
          placeholderTextColor="#BDBDBD"
          value={businessUsername}
          onChangeText={setBusinessUsername}
          autoCapitalize="none"
        />
        {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next  →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 7,
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
    marginRight: 10,
  },
  progressBarFill: {
    width: '25%', // 1/6th progress
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
    marginTop: 10,
  },
  hint: {
    color: '#757575',
    fontSize: 13,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BusinessAccountDetails; 