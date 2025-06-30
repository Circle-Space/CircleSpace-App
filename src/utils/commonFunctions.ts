import AsyncStorage from '@react-native-async-storage/async-storage';

export const getSavedToken = async () => {
  const savedToken = await AsyncStorage.getItem('userToken');
  return savedToken;
};

export const getUserInfo = async () => {
  const userData = await AsyncStorage.getItem('user');
  if (userData) {
    return JSON.parse(userData);
  }
  return null;
};

export const getLoggedInUserId = async () => {
  const userData = await AsyncStorage.getItem('user');
  if (userData) {
    return JSON.parse(userData)?._id;
  }
  return null;
};

export const getAccountType = async () => {
  const accountType_ = await AsyncStorage.getItem('accountType');
  return accountType_;
};

export const getInitials = (
  userName?: string
) => {
  if (userName) {
    return `${userName?.charAt(0)}`?.toUpperCase();
  }
  return 'U';
};

export const getUsername = (
  userName?: string,
  numberofCharacters?: number
) => {
  console.log("userName in getUsername", userName);
  console.log("numberofCharacters in getUsername", numberofCharacters);
  if (userName) {
    const slicedUserName = userName?.slice(0, numberofCharacters || 15);
    return slicedUserName.length < userName.length ? `${slicedUserName}...` : slicedUserName;
  }
  return '';
};

export const getName = (
  name?: string,
  numberofCharacters?: number
) => {
  console.log("name in getName", name);
  console.log("numberofCharacters in getName", numberofCharacters);
  if (name) {
    const slicedName = name?.slice(0, numberofCharacters || 15);
    return slicedName.length < name.length ? `${slicedName}...` : slicedName;
  }
  return '';
};
