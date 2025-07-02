import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';

const InquirySuccessScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Image
          source={require('../../assets/icons/InquirySucess.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Sent Successfully</Text>
        <Text style={styles.subtitle}>
          Your message has successfully sent to the Umang Gandhi. we will respond back you soon.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BottomBar')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 260, height: 260, marginBottom: 40 },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 32,
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#656565',
    marginBottom: 40,
    textAlign: 'center',
    maxWidth: 320,
  },
  button: {
    width: "50%",
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
    color: '#000',
  },
});

export default InquirySuccessScreen;