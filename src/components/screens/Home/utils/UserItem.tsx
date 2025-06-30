import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import FollowButton from './FollowButton'; // Import the FollowButton component
import { Color, FontFamilies } from '../../../../styles/constants';
import { getInitials } from '../../../../utils/commonFunctions';


const UserItem = ({ item, routeToProfile, onFollowToggle }) => (
  <View style={styles.followerItem}>
    <TouchableOpacity onPress={() => routeToProfile(item.id)}>
      {item?.profilePic ? (
        <Image source={{ uri: item?.profilePic }} style={styles.avatar} />
      ) : (
        <View style={styles.initialsAvatar}>
          <Text style={styles.initialsText}>
            {getInitials(item?.username)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
    <TouchableOpacity onPress={() => routeToProfile(item.id)} style={styles.followerInfo}>
      <Text style={styles.name}>
        {item?.businessName || `${item?.firstName} ${item?.lastName}`}
      </Text>
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
    <FollowButton isFollowing={item.isFollowing} onPress={() => onFollowToggle(item)} />
  </View>
);

const styles = StyleSheet.create({
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 25,
    marginRight: 15,
  },
  initialsAvatar: {
    width: 36,
    height: 36,
    borderRadius: 25,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  initialsText: {
    color: Color.white,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
  },
  followerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '400',
    color: '#1E1E1E',
  },
  username: {
    marginTop: 4,
    fontSize: 11,
    color: '#B9B9BB',
    fontWeight: '400',
  },
});

export default UserItem;
