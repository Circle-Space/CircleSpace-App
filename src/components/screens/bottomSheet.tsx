/* eslint-disable prettier/prettier */
// CommentsBottomSheet.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { FontFamilies } from '../../styles/constants';

const CommentsBottomSheet = ({comments, onClose}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments</Text>
      {/* Render your comments here */}
      {comments.map((comment, index) => (
        <View key={index} style={styles.commentContainer}>
          <Text style={styles.comment}>{comment.text}</Text>
          <Text style={styles.commentAuthor}>{comment.author}</Text>
        </View>
      ))}
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: FontFamilies.semibold,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentContainer: {
    marginBottom: 10,
  },
  comment: {
    fontSize: 16,
    marginBottom: 5,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    color: '#888',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: 'blue',
  },
});

export default CommentsBottomSheet;
