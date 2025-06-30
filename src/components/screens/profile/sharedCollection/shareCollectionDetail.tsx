import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  ToastAndroid,
  Platform,
  Clipboard,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Divider} from 'react-native-paper';
import CustomAlertModal from '../../../commons/customAlert';
import {del} from '../../../../services/dataRequest';
import {handleShareCollection} from '../../jobs/utils/utils';
import {getInitials} from '../../../../utils/commonFunctions';
import { Color } from '../../../../styles/constants';

const {width} = Dimensions.get('window');
const ITEM_SIZE = (width - 40) / 2; // For a two-column layout

const ShareCollectionDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {item} = route.params; // Access the passed 'item' object

  const {title, createdBy, photos, collaborators, isOwner} = item;
  console.log('collabo ::', collaborators);

  //   MENU
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  const handleClose = () => {
    setDeleteMenuVisible(false);
  };

  const routeToProfile = async () => {
    try {
      const account_ = await AsyncStorage.getItem('user');
      const currentUser = JSON.parse(account_ || '{}')._id;
      navigation.navigate('Profile', {id: currentUser});
    } catch (error) {
      console.error('Error routing to profile:', error);
    }
  };

  const handleConfirmDelete = async () => {
    setMenuVisible(false);
    const id = item?.id;
    const res = await del(`shared-drive/set-collection-deleted`, id);
    if (res) {
      setDeleteMenuVisible(false);
      routeToProfile();
    } else {
      Alert.alert('Something went wrong');
      setDeleteMenuVisible(false);
    }
  };

  const handleMenuOptionSelect = (option: string) => {
    setMenuVisible(false);
    switch (option) {
      case 'delete':
        setDeleteMenuVisible(true);
        break;
      case 'edit':
        setEditModalVisible(true);
        break;
      case 'share':
        handleShareCollection(item?._id);
        console.log('Share board selected');
        break;
      case 'copy':
        const linkToCopy = `https://app.circlespace.in/collection/${item._id}`; // Replace with the actual link
        Clipboard.setString(linkToCopy); // Copies the link to clipboard
        if (Platform.OS === 'android') {
          ToastAndroid.show('Link copied to clipboard!', ToastAndroid.SHORT);
        } else {
          Alert.alert('Success', 'Link copied to clipboard!');
        }
        console.log('Copy link selected');
        break;
      default:
        break;
    }
  };

  const renderPhotoItem = ({item, index}) => {
    let borderRadiusStyle = {};
    const totalImages = Math.min(photos.length, 4);

    if (totalImages === 1) {
      borderRadiusStyle = {borderRadius: 12};
    } else if (totalImages === 2) {
      borderRadiusStyle =
        index === 0
          ? {borderTopLeftRadius: 12, borderBottomLeftRadius: 12}
          : {borderTopRightRadius: 12, borderBottomRightRadius: 12};
    } else if (totalImages === 3) {
      borderRadiusStyle =
        index === 0
          ? {borderTopLeftRadius: 12}
          : index === 1
          ? {borderTopRightRadius: 12}
          : {borderBottomLeftRadius: 12, borderBottomRightRadius: 12};
    } else if (totalImages >= 4) {
      borderRadiusStyle =
        index === 0
          ? {borderTopLeftRadius: 12}
          : index === 1
          ? {borderTopRightRadius: 12}
          : index === 2
          ? {borderBottomLeftRadius: 12}
          : {borderBottomRightRadius: 12};
    }

    return (
      <View style={styles.photoContainer}>
        <Image
          source={{uri: item}}
          style={[styles.photo, borderRadiusStyle]}
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title and Owner Info */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Image
            source={{
              uri: createdBy?.profilePic || 'https://via.placeholder.com/64',
            }}
            style={styles.profilePic}
          />
          <View>
            <Text style={styles.title}>{title || 'Untitled Collection'}</Text>
            <Text style={styles.subtitle}>
              by <Text style={styles.ownerName}>{createdBy?.username}</Text>
            </Text>
            <Text style={styles.photoCount}>{photos?.length || 0} Photos</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleMenuToggle} style={styles.menuButton}>
          <Icon name="more-vert" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {/* Photo Grid */}
      <FlatList
        data={photos}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.photoRow}
        renderItem={renderPhotoItem}
        scrollEnabled={false} // Disable internal scrolling, so ScrollView handles it
        ListFooterComponent={
          isOwner ? (
            <TouchableOpacity
              style={styles.addImagesContainer}
              onPress={() => console.log('Add Images Pressed')}>
              <Text style={styles.addImagesText}>+ Add Images</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Collaborators Section */}
      {collaborators?.length > 0 && (
        <View style={styles.collaboratorsContainer}>
          <Text style={styles.collaboratorsTitle}>Collaborators</Text>
          <FlatList
            data={collaborators}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <View style={styles.collaborator}>
                {item?.user?.profilePic ? (
                  <Image
                    source={{
                      uri: item?.user?.profilePic,
                    }}
                    style={styles.collaboratorAvatar}
                  />
                ) : (
                  <View style={styles.initialsAvatar}>
                    <Text style={styles.initialsText}>
                      {getInitials(
                        item?.user?.username
                      )}
                    </Text>
                  </View>
                )}
                <Text style={styles.collaboratorName}>
                  {item?.user?.username || 'Collaborator'}
                </Text>
              </View>
            )}
          />
        </View>
      )}
      {menuVisible && (
        <View style={styles.menu}>
          {/* Render Delete and Edit options only if canEdit is true */}
          <TouchableOpacity
            onPress={() => handleMenuOptionSelect('delete')}
            style={styles.menuItem}>
            <Text style={[styles.menuItemText, styles.deleteText]}>
              Delete Collection
            </Text>
          </TouchableOpacity>
          <Divider />
          {/* <TouchableOpacity
            onPress={() => handleMenuOptionSelect('edit')}
            style={styles.menuItem}>
            <Text style={styles.menuItemText}>Edit</Text>
          </TouchableOpacity>
          <Divider /> */}

          {/* Always render Share, Copy link, and Cancel options */}
          <TouchableOpacity
            onPress={() => handleMenuOptionSelect('share')}
            style={styles.menuItem}>
            <Text style={styles.menuItemText}>Share to</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            onPress={() => handleMenuOptionSelect('copy')}
            style={styles.menuItem}>
            <Text style={styles.menuItemText}>Copy link</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            onPress={() => handleMenuOptionSelect('cancel')}
            style={styles.menuItem}>
            <Text style={styles.menuItemText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <CustomAlertModal
        visible={deleteMenuVisible}
        title="Delete Collection"
        description="You can’t recover your collection afterward. Are you sure you want to delete this collection?"
        buttonOneText="Delete"
        buttonTwoText="Cancel"
        onPressButton1={handleConfirmDelete}
        onPressButton2={handleClose}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  profilePic: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#CCC',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7D7D7D',
    marginTop: 4,
    fontFamily: 'Gilroy-SemiBold',
  },
  ownerName: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'Gilroy-Regular',
    fontWeight: '400',
  },
  photoCount: {
    fontSize: 13,
    color: '#7D7D7D',
    marginTop: 4,
    fontFamily: 'Gilroy-Regular',
  },
  photoRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  photoContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  addImagesContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  addImagesText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  collaboratorsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  collaboratorsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    fontFamily: 'Gilroy-SemiBold',
  },
  collaborator: {
    alignItems: 'center',
    marginRight: 16,
  },
  collaboratorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CCC',
  },
  collaboratorName: {
    fontSize: 12,
    color: '#7D7D7D',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Gilroy-Regular',
  },
  menuButton: {
    padding: 10,
  },
  menu: {
    position: 'absolute',
    right: 20,
    top: 80,
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
    width: 200,
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 13,
    color: '#000',
    fontFamily: 'Gilroy-Medium',
  },
  deleteText: {
    color: '#ED4956',
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
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: 'Gilroy-Regular',
  },
});

export default ShareCollectionDetail;
