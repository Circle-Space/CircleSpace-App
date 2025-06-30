import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { get } from '../../../../services/dataRequest';
import { Divider } from 'react-native-paper';
import { Color, FontFamilies, FontSizes, LetterSpacings, LineHeights } from '../../../../styles/constants';

// API function to fetch users based on search term
const fetchPeopleAPI = async (searchTerm: string, page: number, token: string) => {
  try {
    const data = await get(
      `search/users?query=${searchTerm}&page=${page}&limit=50`,
      {},
      token,
    );
    return data.users;
  } catch (error) {
    console.error('API fetch error: ', error);
    return [];
  }
};

const UserTaggingInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  iconName,
  readOnly,
  multiline = false,
  defaultOneLine = false,
  numberOfLines = 1,
  error, // Optional error prop
  onFocus, // Optional focus prop
  autoCapitalize = 'none',
  token, // Pass the token for API calls
  onTagUserChange,
}: any) => {
  const [inputValue, setInputValue] = useState(value);
  const [showUserList, setShowUserList] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [taggedUsers, setTaggedUsers] = useState<any[]>([]); // Store tagged users

  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);
  
  // Function to parse input and update the list of tagged users
  const updateTaggedUsersFromInput = (newText: string) => {
    const userTagsInText = [];
    const regex = /@(\w+)/g;
    let match;
    while ((match = regex.exec(newText)) !== null) {
      const username = match[1];
      const taggedUser = taggedUsers.find(user => user.username === username);
      if (taggedUser) {
        userTagsInText.push(taggedUser);
      }
    }

    // Check if any tagged users are missing in the input text
    const updatedTaggedUsers = taggedUsers.filter(user => userTagsInText.includes(user));
    
    // Update the tagged users if any have been removed
    if (updatedTaggedUsers.length !== taggedUsers.length) {
      setTaggedUsers(updatedTaggedUsers);
      if (onTagUserChange) {
        onTagUserChange(updatedTaggedUsers); // Notify parent component
      }
    }
  };

  // Function to handle input changes and fetch users for tagging
  const handleTextChange = async (text: string) => {
    setInputValue(text);
    onChangeText && onChangeText(text);

    // Check if tagged users have been removed
    updateTaggedUsersFromInput(text);

    const atIndex = text.lastIndexOf('@');
    if (atIndex !== -1 && text[atIndex + 1]) {
      const searchQuery = text.slice(atIndex + 1).toLowerCase();

      // Fetch users from the API based on the search term
      const users = await fetchPeopleAPI(searchQuery, page, token);
      setFilteredUsers(users);
      setShowUserList(users.length > 0);
    } else {
      setShowUserList(false);
    }
  };

  // Function to handle the selection of a user from the list
  const handleUserSelect = (user: any) => {
    const atIndex = inputValue.lastIndexOf('@');
    const newText = inputValue.slice(0, atIndex) + `@${user.username} `;
    setInputValue(newText);

    // Add the selected user object to the taggedUsers array
    const updatedTaggedUsers = [...taggedUsers, user];
    setTaggedUsers(updatedTaggedUsers);

    // Notify parent component about the tagged users
    if (onTagUserChange) {
      onTagUserChange(updatedTaggedUsers); // Notify parent with the updated list of tagged users
    }

    setShowUserList(false);
    onChangeText && onChangeText(newText);
  };

  // return (
  //   <View style={styles.container}>
  //     <Text style={styles.label}>{label}</Text>
  //     <View style={[styles.inputContainer, error && styles.errorInputContainer]}>
  //       <Icon name={iconName} size={16} color="#1E1E1E" style={styles.icon} />
  //       <TextInput
  //         style={[styles.input, multiline && !defaultOneLine && styles.multiline, error && styles.errorInput]}
  //         placeholder={placeholder}
  //         placeholderTextColor="#81919E"
  //         value={inputValue}
  //         onChangeText={handleTextChange}
  //         editable={!readOnly}
  //         multiline={multiline}
  //         numberOfLines={numberOfLines}
  //         onFocus={onFocus}
  //         autoCapitalize={autoCapitalize}
  //       />
  //     </View>
  //     {error ? <Text style={styles.errorText}>{error}</Text> : null}
  //     {showUserList && (
  //       <View style={styles.userListContainer}>
  //         <FlatList
  //           data={filteredUsers}
  //           keyExtractor={item => item._id} // Assuming 'id' exists
  //           renderItem={({ item }) => (
  //             <TouchableOpacity onPress={() => handleUserSelect(item)}>
  //               <Text style={styles.userItem}>@{item.username}</Text>
  //             </TouchableOpacity>
  //           )}
  //           onEndReachedThreshold={0.5} // Trigger more users when half of the list is visible
  //         />
  //       </View>
  //     )}
  //   </View>
  // );
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
  
      {/* Render the user list first, above the input */}
      {showUserList && (
        <View style={styles.userListContainer}>
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item._id} // Assuming 'id' exists
            renderItem={({ item, index }) => (
              <View>
                <TouchableOpacity onPress={() => handleUserSelect(item)} style={styles.userItemContainer}>
                  <Text style={styles.userItem}>@{item.username}</Text>
                </TouchableOpacity>
                {/* Add divider between items, except after the last item */}
                {index < filteredUsers.length - 1 && <Divider />}
              </View>
            )}
            keyboardShouldPersistTaps="handled" 
            onEndReachedThreshold={0.5} // Trigger more users when half of the list is visible
          />
        </View>
      )}
  
      {/* Input field */}
      <View style={[styles.inputContainer, error && styles.errorInputContainer]}>
        <Icon name={iconName} size={16} color="#1E1E1E" style={styles.icon} />
        <TextInput
          style={[styles.input, multiline && !defaultOneLine && styles.multiline, error && styles.errorInput]}
          placeholder={placeholder}
          placeholderTextColor={Color.primarygrey}
          value={inputValue}
          onChangeText={handleTextChange}
          editable={!readOnly}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={onFocus}
          autoCapitalize={autoCapitalize}
        />
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );  
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: FontSizes.medium,
    color: '#1E1E1E',
    marginBottom: 8,
    fontWeight: '800',
    fontFamily: FontFamilies.regular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    color: '#81919E',
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 0,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8, // Adjust padding for different platforms
    minHeight: 46, // Ensure minimum height consistency
  },
  errorInputContainer: {
    borderColor: 'black',
    borderWidth: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    color: '#3C4858',
    fontWeight: '400',
    paddingVertical: 0,
  },
  errorInput: {
    borderColor: 'black',
    height: Platform.OS === 'ios' ? 'auto' : 35,
  },
  multiline: {
    minHeight: 60,
    maxHeight: 80,
  },
  errorText: {
    color: 'black',
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    marginTop: 5,
  },
  userListContainer: {
    maxHeight: 150, // Constrain the height so the list can scroll
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1, // Add border around the list
    borderColor: '#ccc',
  },
  userItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333',
  },
});

export default UserTaggingInput;
