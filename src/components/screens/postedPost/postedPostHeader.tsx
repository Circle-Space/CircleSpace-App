import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {Divider} from 'react-native-paper';

const PostedPostHeader = ({userPhoto, username, postedTime, caption}: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={{uri: userPhoto}} style={styles.userPhoto} />
        <View style={styles.textContainer}>
          <Text style={styles.username}>{username}</Text>
        </View>
        <Text style={styles.postedTime}>{postedTime} ago</Text>
      </View>
      <Divider />
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom:10
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  username: {
    fontFamily: 'Gilroy-ExtraBold',
    fontWeight: 'bold',
  },
  postedTime: {
    color: 'gray',
  },
  caption: {
    paddingVertical: 10,
  },
});

export default PostedPostHeader;
