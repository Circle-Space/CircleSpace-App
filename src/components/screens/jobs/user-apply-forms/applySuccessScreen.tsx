import {useNavigation} from '@react-navigation/native';
import {
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ApplySuccessScreen({route}: any) {
  const navigation = useNavigation();
  const {jobTitle} = route.params;
  return (
    <SafeAreaView style={[styles.container]}>
      <View style={{flex: 1}}>
        <View style={styles.content}>
          <View style={styles.header}></View>
          <View style={styles.heroContainer}>
            <ImageBackground
              source={require('../../../../assets/jobs/apply/successIcon.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              Application Sent
              {/* {jobTitle} */}
            </Text>
            <Text style={styles.subTitle}>
              Apply to more opportunities to increase your chances of getting
              hired
            </Text>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Jobs' as never)}>
              <Text style={[styles.buttonText, styles.signupButton]}>
                Continue Applying
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  skip: {
    marginLeft: 'auto',
    marginRight: 15,
    color: 'rgba(74, 74, 74, 1)',
    borderColor: 'rgba(74, 74, 74, 1)',
    borderBottomWidth: 1,
    fontFamily: 'Gilroy-Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginTop: 20,
    fontSize: 16,
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: '400',
  },
  subTitle: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
    color: '#81919E',
    fontFamily: 'Gilroy-Regular',
    textAlign: 'center',
    width: '80%',
  },
  logo: {
    width: '100%',
    height: 120,
    marginBottom: 20,
  },
  heroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  heroImage: {
    width: '100%',
    height: 100,
  },
  footer: {
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: 'Gilroy-SemiBold',
  },
  signupButton: {
    color: 'rgba(255, 255, 255, 1)',
  },
  savedIconContainer: {
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeMoreButton: {
    padding: 10,
    marginVertical: 10,
    borderColor: 'rgba(123, 123, 123, 1)',
    borderWidth: 1,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  seeMoreText: {
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
    color: 'rgba(44, 44, 44, 1)',
  },
});
