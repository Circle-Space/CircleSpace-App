// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';

// // Dummy Data (To be replaced by API calls)
// const dummyNames = [
//   { id: '1', username: "john_doe", profilePic: "", firstName: 'John', lastName: 'Doe', isFollowing: false },
//   { id: '2', username: "jane_smith", profilePic: "", businessName: 'Jane Smith', isFollowing: true },
// ];

// const dummyTags = [
//   { id: '1', tag: 'InteriorDesign' },
//   { id: '2', tag: 'ProjectManagement' },
//   { id: '3', tag: 'Architecture' },
//   { id: '4', tag: 'Sustainability' },
//   { id: '5', tag: 'Innovation' },
// ];

// // Get initials based on firstName/lastName or businessName
// const getInitials = (businessName: string, firstName: string, lastName: string) => {
//   if (businessName) {
//     return businessName.charAt(0).toUpperCase();
//   }
//   const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
//   const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
//   return firstInitial + lastInitial;
// };

// // People tab - fetches and displays the list of names
// const PeopleFilter = ({ searchTerm }: { searchTerm: string }) => {
//   const navigation = useNavigation();
//   const [names, setNames] = useState<any[]>(dummyNames);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     // Simulating data fetching (eventually replace with API calls)
//     const fetchNames = async () => {
//       setLoading(true);
//       try {
//         await new Promise(resolve => setTimeout(resolve, 500)); // Simulated delay
//         setNames(dummyNames); // Replace with API response
//       } catch (error) {
//         console.error('Error fetching names:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchNames();
//   }, []);

//   // Filter names based on search term
//   const filteredNames = names.filter((name) =>
//     (name.firstName || name.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const routeToProfile = (userId: any) => {
//     navigation.navigate('OtherUserProfile', {
//       userId,
//       isSelfProfile: false,
//     });
//   };

//   // Follow/Unfollow logic (dummy handler)
//   const handleFollowToggle = (item: any) => {
//     setNames((prevNames) =>
//       prevNames.map((name) =>
//         name.id === item.id ? { ...name, isFollowing: !name.isFollowing } : name
//       )
//     );
//   };

//   const renderItem = ({ item }: any) => (
//     <View style={styles.followerItem}>
//       <TouchableOpacity onPress={() => routeToProfile(item.id)}>
//         {item?.profilePic ? (
//           <Image source={{ uri: item?.profilePic }} style={styles.avatar} />
//         ) : (
//           <View style={styles.initialsAvatar}>
//             <Text style={styles.initialsText}>
//               {getInitials(item?.businessName, item?.firstName, item?.lastName)}
//             </Text>
//           </View>
//         )}
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => routeToProfile(item.id)} style={styles.followerInfo}>
//         <Text style={styles.name}>
//           {item?.businessName || `${item?.firstName} ${item?.lastName}`}
//         </Text>
//         <Text style={styles.username}>{item.username}</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         style={[
//           styles.followButton,
//           item.isFollowing ? styles.followingButton : styles.followButton,
//         ]}
//         onPress={() => handleFollowToggle(item)}>
//         <Text style={[item.isFollowing ? styles.followButtonText : styles.followingButtonText,]}>
//           {item.isFollowing ? 'Following' : 'Follow'}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading) {
//     return <ActivityIndicator size="large" color="#007BFF" />;
//   }

//   return (
//     <FlatList
//       data={filteredNames}
//       keyExtractor={(item) => item.id}
//       renderItem={renderItem}
//       ListEmptyComponent={<Text style={styles.noResultsText}>No names found</Text>}
//     />
//   );
// };

// // Tags tab - shows predefined tags
// const TagsFilter = ({ searchTerm }: { searchTerm: string }) => {
//   const [tags, setTags] = useState<any[]>(dummyTags); // Dummy tags data
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchTags = async () => {
//       setLoading(true);
//       try {
//         await new Promise(resolve => setTimeout(resolve, 500)); // Simulated delay
//         setTags(dummyTags); // Replace with API response
//       } catch (error) {
//         console.error('Error fetching tags:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTags();
//   }, []);

//   // Filter tags based on search term
//   const filteredTags = tags.filter(tag =>
//     tag.tag.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const renderTagItem = ({ item }: { item: any }) => (
//     <TouchableOpacity style={styles.option}>
//       <View style={styles.iconWrapper}>
//         <Icon name="pricetag-outline" size={10} color="#000" />
//       </View>
//       <Text style={styles.optionText}>{item.tag}</Text>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return <ActivityIndicator size="large" color="#007BFF" />;
//   }

//   return (
//     <FlatList
//       data={filteredTags}
//       keyExtractor={item => item.id}
//       renderItem={renderTagItem}
//       ListEmptyComponent={<Text style={styles.noResultsText}>No tags found</Text>}
//     />
//   );
// };

// const FeedSearchScreen = () => {
//   const [activeTab, setActiveTab] = useState('People');
//   const [searchTerm, setSearchTerm] = useState('');

//   return (
//     <View style={styles.container}>
//       {/* Back Button and Search Bar */}
//       <View style={styles.headerContainer}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}>
//           <Icon name="chevron-back" size={22} color="#181818" />
//         </TouchableOpacity>
//         <View style={styles.searchInputWrapper}>
//           <Image
//             source={require('../../../assets/icons/searchIcon.png')} // Path to search icon
//             style={styles.searchIcon}
//           />
//           <TextInput
//             style={styles.searchInput}
//             value={searchTerm}
//             placeholder={`Search ${activeTab === 'People' ? 'names' : 'tags'}`}
//             onChangeText={setSearchTerm}
//             placeholderTextColor="#888"
//           />
//         </View>
//       </View>

//       {/* Custom Tab Bar */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tabButton, activeTab === 'People' && styles.activeTab]}
//           onPress={() => setActiveTab('People')}>
//           <Text style={[styles.tabText, activeTab === 'People' && styles.activeTabText]}>
//             People
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tabButton, activeTab === 'Tags' && styles.activeTab]}
//           onPress={() => setActiveTab('Tags')}>
//           <Text style={[styles.tabText, activeTab === 'Tags' && styles.activeTabText]}>
//             Tags
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Tab Content */}
//       <View style={styles.tabContent}>
//         {activeTab === 'People' ? (
//           <PeopleFilter searchTerm={searchTerm} />
//         ) : (
//           <TagsFilter searchTerm={searchTerm} />
//         )}
//       </View>
//     </View>
//   );
// };

// export default FeedSearchScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     paddingHorizontal: 16,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     gap: 4,
//   },
//   backButton: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 10,
//     padding: 4,
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 10,
//   },
//   searchInputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     backgroundColor: '#F3F3F3',
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     height: 44,
//   },
//   searchIcon: {
//     width: 20,
//     height: 20,
//     tintColor: '#828282',
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 10,
//     color: '#81919E',
//     fontSize: 13,
//     fontWeight: '400',
//     fontFamily: 'Gilroy-Medium',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 16,
//   },
//   tabButton: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 2,
//     borderBottomColor: 'transparent',
//   },
//   activeTab: {
//     borderBottomColor: '#121212',
//   },
//   tabText: {
//     fontFamily: 'Gilroy-Medium',
//     fontSize: 14,
//   },
//   activeTabText: {
//     color: '#121212',
//     fontWeight: 'bold',
//   },
//   tabContent: {
//     flex: 1,
//   },
//   followerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderBottomColor: '#ddd',
//     marginBottom: 20,
//   },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 25,
//     marginRight: 15,
//   },
//   initialsAvatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 25,
//     backgroundColor: '#FCEDE3',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   initialsText: {
//     color: '#000',
//     fontSize: 16,
//     fontWeight: '400',
//     fontFamily: 'Gilroy-Regular',
//   },
//   followerInfo: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 13,
//     fontWeight: '400',
//     color: '#1E1E1E',
//   },
//   username: {
//     marginTop: 4,
//     fontSize: 11,
//     color: '#B9B9BB',
//     fontWeight: '400',
//   },
//   followButton: {
//     backgroundColor: '#1E1E1E',
//     height: 30,
//     justifyContent: 'center',
//     alignItems : 'center',
//     paddingHorizontal: 15,
//     borderRadius: 8,
//     width : 100
//   },
//   followingButton: {
//     backgroundColor: '#EBEBEB',
//     height: 30,
//     justifyContent: 'center',
//     alignItems : 'center',
//     paddingHorizontal: 15,
//     borderRadius: 8,
//   },
//   followButtonText: {
//     color: '#1E1E1E',
//     fontSize: 12,
//     fontFamily: 'Gilroy-Regular',
//     fontWeight: '400',
//   },
//   followingButtonText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontFamily: 'Gilroy-Regular',
//     fontWeight: '400',
//   },
//   option: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   iconWrapper: {
//     backgroundColor: '#FCEDE3',
//     borderRadius: 50,
//     padding: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   optionText: {
//     fontSize: 16,
//     marginLeft: 10,
//   },
//   noResultsText: {
//     textAlign: 'center',
//     marginTop: 20,
//     color: '#999',
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PeopleFilter from './utils/PeopleFilter.tsx';
import TagsFilter from './utils/TagsFilter.tsx';
import SearchHeader from './utils/SearchHeader.tsx';
import { SafeAreaView } from 'react-native-safe-area-context';

const FeedSearchScreen = () => {
  const [activeTab, setActiveTab] = useState('People');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <SearchHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'Tags' ? (
          <TagsFilter searchTerm={searchTerm} />
        ) : (
          <PeopleFilter searchTerm={searchTerm} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default FeedSearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  tabContent: {
    flex: 1,
  },
});
