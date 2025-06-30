import { Location } from 'aws-sdk';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import LoginBottomSheet from '../../commons/loginBottomSheet';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color, FontFamilies, FontSizes, LetterSpacings, LineHeights } from '../../../styles/constants';
import GetStartedModal from '../../commons/getStartedModal';

const formatDate = (isoDate: any) => {
  const eventDate = new Date(isoDate);
  const dayOfWeek = eventDate.toLocaleString('en-us', {weekday: 'short'});
  const month = eventDate.toLocaleString('en-us', {month: 'long'});
  const day = eventDate.getDate();
  return `${dayOfWeek}, ${day} ${month}`;
};


const EventCard = ({event, navigation,accountType}:any) => {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const routeToDetail = (event:any)=>{
    console.log(event);
    console.log(accountType);
    if(accountType == 'temp'){
      // navigation.navigate('Landing');
      setIsModalVisible(true);
    }else{
    navigation.navigate('EventDetail', {event})
    }}
  return(
  <Pressable
    style={styles.container}
    onPress={() => routeToDetail(event)}>
    <View style={styles.eventCard}>
      <Image source={{uri: event.eventPhoto}} style={styles.eventPhoto} />
      {/* <View style={styles.dateBadge}>
        <Text style={styles.dateText}>{formatDate(event.eventStartDate)}</Text>
      </View> */}
    </View>
    <View style={styles.eventContent}>
      <View style={styles.eventNameContainer}>
        <Text style={styles.eventName} numberOfLines={1} ellipsizeMode='tail'>
          {event.eventName}
        </Text>
      </View>
      <Text style={[styles.dateText, styles.dateBadge]}>
        {formatDate(event.eventStartDate)}
      </Text>
      <View style={styles.location}>
      {/* <Icon name="location" size={12} color={Color.black} /> */}
      {/* <Image
        source={require('../../../assets/icons/locationBlackIcon.png')} // Local image file
        style={styles.icon} // Define size and other styles
      /> */}
      <Text style={styles.eventDetails} numberOfLines={1}>
        {event.city}
      </Text>
      </View>
    </View>
    {loginModalVisible && (
        <LoginBottomSheet
          visible={loginModalVisible}
          onClose={() => {
            setLoginModalVisible(false);
          }}
          showIcon={true}
        />
    )}
    {/* Render the GetStartedModal */}
     <GetStartedModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
  </Pressable>
)};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    marginLeft:5,
    width: Dimensions.get('window').width * 0.44,
    height: Dimensions.get('window').width * 0.64,
    backgroundColor: Color.secondarygrey,
    borderRadius: 12,
    // // iOS shadow
    // shadowColor: '#1D242A',  // Shadow color (same as the CSS color without the alpha channel)
    // shadowOffset: { width: 0, height: 8 },  // X and Y offset
    // shadowOpacity: 0.08, // Corresponds to the alpha in CSS (#1D242A14 -> 14 in hex is 8% opacity)
    // shadowRadius: 34.69, // Equivalent to the blur radius in CSS
    
    // // Android shadow
    // elevation: 4, // This should be adjusted to match the desired shadow effect on Android
    paddingVertical: 8,
    paddingHorizontal: 8,
    overflow:'hidden',

  },
  eventCard: {
    borderRadius: 12,
    // overflow: 'hidden',
  },
  eventPhoto: {
    width: '100%',
    height: Dimensions.get('window').width * 0.4,
    borderRadius: 12,
    objectFit:'cover',
  },
  // dateBadge: {
  //   position: 'absolute',
  //   bottom: 20,
  //   left: '50%',
  //   transform: [{translateX: -50}],
  //   backgroundColor: '#FFFFFF',
  //   paddingVertical: 5,
  //   paddingHorizontal: 15,
  //   borderRadius: 10,
  //   shadowColor: '#000',
  //   shadowOpacity: 0.1,
  //   shadowRadius: 5,
  //   elevation: 3,
  // },
  // dateText: {
  //   fontSize: 12,
  //   fontFamily: 'Gilroy-SemiBold',
  //   color: '#C38E4A',
  //   fontWeight: '400',
  // },
  eventContent: {
    // backgroundColor: '#fff',
    paddingVertical: 10,
    // gap:6,
  },
  eventNameContainer: {
    height:'23%',
    justifyContent:'center',
  },
  eventName: {
    color: Color.black,
    fontSize: FontSizes.medium,
    letterSpacing:LetterSpacings.wide,
    fontWeight: '800',
    fontFamily: FontFamilies.semibold,
    // marginBottom: 5,
    lineHeight: LineHeights.small,
  },
  dateBadge:{
    width: '80%',
    minHeight: 18,  // Hug height
    paddingVertical: 4, // Padding for top and bottom
    // paddingHorizontal: 6, // Padding for left and right
    borderRadius: 8,  // Top-left corner
    borderTopLeftRadius: 8,
    // borderWidth: 0.5,  // Border on top
    // backgroundColor: Color.white,
    borderColor: Color.black, // Default color, adjust as needed
    // textAlign: 'center',
    justifyContent:"center",
  },
  dateText: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: Color.primarygrey,
  },
  location:{
    flexDirection:'row',
    alignItems:'center',
  },
  icon: {
    width: 14, // Width of the icon
    height: 14, // Height of the icon
    resizeMode: 'contain', // Keep the aspect ratio
    marginRight: 5, // Space between the icon and the text
  },
  eventDetails: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    color: Color.primarygrey,
    // letterSpacing:LetterSpacings.wide,
  },
});

export default EventCard;
