/* eslint-disable prettier/prettier */
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Divider } from 'react-native-paper';

const Stats = ({profile, images}) => {
  const navigation = useNavigation();
  const handleNavigation = (userId: any, route : string) => {
    if(route == 'following'){
      if(profile.followingCount > 0){
        navigation.navigate('FollowingList', { userId });
      }
    }else if(route == 'followers'){
      if(profile.followerCount > 0){
      navigation.navigate('FollowersList', { userId });
      }
    }else {
      console.warn("No route specified")
    }
  };
  return (
    <>
    
    <View style={styles.statsContainer}>
      <TouchableOpacity style={styles.statsBox}>
        <Text style={styles.statsCount}>
          {profile.postCount || images.length}
        </Text>
        <Text style={styles.statsLabel}>Posts</Text>
      </TouchableOpacity>
      {/* <View style={styles.statsBox}> */}
      <TouchableOpacity style={styles.statsBox}  onPress={() => handleNavigation(profile.userId, 'following')}>
        <Text style={styles.statsCount}>{profile.followingCount || 0}</Text>
        <Text style={styles.statsLabel}>Following</Text>
      </TouchableOpacity>
      {/* </View> */}
      {/* <View style={styles.statsBox}> */}
      <TouchableOpacity style={styles.statsBox} onPress={() => handleNavigation(profile.userId, 'followers')}>
        <Text style={styles.statsCount}>{profile.followerCount || 0}</Text>
        <Text style={styles.statsLabel}>Followers</Text>
      </TouchableOpacity>
      {/* </View> */}
    </View>
    <Divider style={styles.divider} />
    </>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statsBox: {
    alignItems: 'center',
    flex: 1,
  },
  statsCount: {
    fontSize: 20,
    fontWeight: '600',
  },
  statsLabel: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Gilroy-Regular',
  },
  divider : {
    marginTop : 16,
  }
});

export default Stats;
