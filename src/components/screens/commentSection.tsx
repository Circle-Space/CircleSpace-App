/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FontFamilies } from '../../styles/constants';

const CommentsSection = ({comments}) => {
  const [commentText, setCommentText] = useState('');
  const [commentList, setCommentList] = useState(comments);

  const handleCommentSubmit = () => {
    if (commentText.trim() === '') {
      return; // Don't add empty comments
    }
    const newComment = {
      id: commentList.length + 1,
      text: commentText,
      user: 'Anonymous', // Replace with actual user information as needed
      timestamp: new Date().toISOString(), // Replace with actual timestamp logic
    };
    setCommentList([...commentList, newComment]);
    setCommentText('');
  };

  const renderCommentItem = ({item}) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentText}>{item.text}</Text>
      <Text style={styles.commentUser}>- {item.user}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={commentList}
        renderItem={renderCommentItem}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={
          <View style={styles.commentHeader}>
            <Text style={styles.headerText}>Comments</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.noCommentsText}>No comments yet.</Text>
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleCommentSubmit}>
          <Icon name="send" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  commentHeader: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FontFamilies.semibold,
  },
  commentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  commentText: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
  },
  commentUser: {
    fontSize: 12,
    color: '#888',
    fontFamily: FontFamilies.regular,
  },
  noCommentsText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#888',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
});

export default CommentsSection;
