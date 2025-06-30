import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Color, FontFamilies, FontSizes, LetterSpacings, LineHeights } from '../../../styles/constants';

const formatDate = (isoDate: any) => {
  const eventDate = new Date(isoDate);
  const dayOfWeek = eventDate.toLocaleString('en-us', {weekday: 'short'});
  const month = eventDate.toLocaleString('en-us', {month: 'short'});
  const day = eventDate.getDate();
  const year = eventDate.getFullYear();
  return `${dayOfWeek}, ${day} ${month} ${year}`;
};

const openMap = (link: any) => {
  Linking.openURL(link).catch(err =>
    console.error('An error occurred trying to open the map:', err),
  );
};

const handleShare = async (event: any) => {
  try {
    await Share.share({
      message: `Check out this event: ${event.eventName}\nDate: ${formatDate(
        event.eventStartDate,
      )}\nLocation: ${event.address}, ${event.city}, ${event.state} - ${
        event.pincode
      }\nKnow more : ${event.ctaLink}`,
      // }\nDescription: ${event.description}\nKnow more : ${event.ctaLink}`,
    });
  } catch (error) {
    console.error('Error sharing event:', error);
  }
};

const EventDetail = ({route, navigation}: any) => {
  const {event} = route.params;
  console.log("event",event)
  const [showFullDescription, setShowFullDescription] = useState(false);
  const CHARACTER_LIMIT = 400;

  const truncatedText = event.description.slice(0, CHARACTER_LIMIT);
  const shouldShowMoreButton = event.description.length > CHARACTER_LIMIT;

  const handleTextLayout = (event: any) => {
    const {lines} = event.nativeEvent;
    if (lines.length > 8) {
      setShowFullDescription(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}>
            <Image
              source={require('../../../assets/header/backIcon.png')}
              style={{height: 24, width: 24}}
            />
            {/* <Icon name="chevron-back" size={22} color="#181818" /> */}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleShare(event)}
            style={styles.iconButton}>
            {/* <Icon name="share-outline" size={20} color="#181818" /> */}
            <Image
              source={require('../../../assets/icons/shareIcon.png')}
              style={{height: 24, width: 24}}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image source={{uri: event.eventPhoto}} style={styles.eventPhoto} />
        </View>

        <View style={styles.content}>
          <Text style={styles.eventName}>{event.eventName}</Text>

          <View style={styles.eventInfo}>
            <View style={styles.icon}>
            {/* <Icon name="calendar" size={14} color="#FFFFFF" /> */}
            <Image
              source={require('../../../assets/events/calenderIcon.png')}
              style={{height: 16, width: 16}}
            />
            </View>
            <Text style={styles.eventInfoText}>
              {formatDate(event.eventStartDate)} -{' '}
              {formatDate(event.eventEndDate)}
            </Text>
          </View>
          <View style={styles.eventInfo}>
            <View style={styles.icon}>
              {/* <Icon name="time" size={14} color="#FFFFFF" /> */}
              <Image
              source={require('../../../assets/events/clockIcon.png')}
              style={{height: 16, width: 16}}
            />
            </View>
            <Text style={styles.eventInfoText}>
              {event.eventStartTime}
            </Text>
          </View>

          <View style={styles.eventInfo}>
            <View style={styles.icon}>
            {/* <Icon name="location" size={14} color="#FFFFFF"/> */}
            <Image
              source={require('../../../assets/events/locationIcon.png')}
              style={{height: 16, width: 16}}
            />
            </View>
            <Text style={[styles.eventInfoText, {flex: 1}]}>{event.address}</Text>
          </View>
          {/* <LinearGradient
            colors={['#FAE1C3', '#FFF3E2']}  // Gradient colors
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.iconContainer}
          >
            <View style={styles.circle}>
              <Icon name="location" size={30} color="#A37449" />
            </View>
          </LinearGradient> */}



          <Text
            style={styles.eventMapLink}
            onPress={() => openMap(event.mapLink)}>
            View on map
          </Text>

          <Text style={styles.sectionTitle}>About Event</Text>
          <Text
            style={styles.eventDescription}
            numberOfLines={showFullDescription ? null : 11}
            onTextLayout={handleTextLayout}>
            {showFullDescription ? event.description : truncatedText}
            {shouldShowMoreButton && (
              <Text
                onPress={() => setShowFullDescription(!showFullDescription)}
                style={styles.seeMoreText}>
                {showFullDescription ? ' less' : '...more'}
              </Text>
            )}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() =>
            navigation.navigate('WebViewScreen', {url: event.ctaLink})
          }>
          <Text style={styles.registerButtonText}>Get more info</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    paddingBottom: 20, // Add padding to ensure space for the button
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 3,
  },
  iconButton: {
    height:40,
    width:40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    justifyContent: 'center',
    alignItems:'center',
    // shadowColor: '#A6A6A6',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.25,
    // shadowRadius: 8,
    // elevation: 8,
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    justifyContent: 'center',
    shadowColor: '#A6A6A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 16,
    resizeMode: 'contain',
  },
  eventPhoto: {
    width: '90%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'contain',
    marginBottom: 5,
    objectFit:'contain',
  },
  content: {
    flex: 1, // Takes up the remaining space
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventName: {
    fontSize: FontSizes.large,
    fontWeight: '800',
    color: Color.black,
    marginBottom: 16,
    fontFamily: FontFamilies.semibold,
    letterSpacing:LetterSpacings.wide,
    lineHeight: LineHeights.medium,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 10,
    marginHorizontal:1,
  },
  icon:{
    backgroundColor: Color.black,
    borderRadius:20,
    height: 33,
    width: 33,
    justifyContent:'center',
    alignItems:'center',
  },
  eventInfoText: {
    marginLeft: 12,
    fontSize: FontSizes.medium2,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    color: Color.black,
    letterSpacing: LetterSpacings.wide,
    lineHeight: FontSizes.medium2 * 1.4, // Increased line height for better alignment
    flex: 1, // Take up all available space to show full address
  },
  eventMapLink: {
    fontSize: FontSizes.medium,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    // textDecorationLine: 'underline',
    marginBottom: 20,
    marginLeft: 40,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,  // Half of width/height for a perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',  // Fallback background color in case gradient doesn't load
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: '800',
    fontFamily: FontFamilies.semibold,
    marginBottom: 10,
    color:Color.black,
    lineHeight:LineHeights.medium,
  },
  eventDescription: {
    fontSize: FontSizes.medium,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    color: Color.black,
    lineHeight: 20,
  },
  seeMoreText: {
    color: Color.grey,
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: '#fff',
    margin:5,
  },
  registerButton: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontFamily: FontFamilies.semibold,
    fontSize: 15,
    fontWeight: '400',
  },
});

export default EventDetail;
