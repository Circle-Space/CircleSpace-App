import RNFS from "react-native-fs";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import FileViewer from "react-native-file-viewer";
// Request storage permission (Android only)

// Request storage permission (Android only)
const requestStoragePermission = async () => {
  if (Platform.OS === "android") {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      if (
        granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("You can access storage and media");
      } else {
        console.log("Permission denied");
      }
      // const granted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      //   {
      //     title: 'Storage Permission Required',
      //     message: 'This app needs access to your storage to download and open files',
      //     buttonNeutral: 'Ask Me Later',
      //     buttonNegative: 'Cancel',
      //     buttonPositive: 'OK',
      //   }
      // );

      // if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      //   console.log('You can use the storage');
      //   return true;
      // } else {
      //   console.log('Storage permission denied');
      //   return false;
      // }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; // iOS permissions are handled differently
};

// Function to show a notification
const showNotification = (title: string, message: string) => {
  Alert.alert(title, message);
};

// Function to download the file
const handleDownloadFiles = async (
  url: string,
  fileName: string,
  callBack: any
) => {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    Alert.alert("Storage permission denied");
    return;
  }
  const checkIfFileExists = async (filePath: string) => {
    try {
      const fileExists = await RNFS.exists(filePath);
      return fileExists;
    } catch (error) {
      console.error("Error checking file existence:", error);
      return false;
    }
  };
  const openFile = async (filePath: string) => {
    const fileExists = await checkIfFileExists(filePath);
    if (fileExists) {
      try {
        // Adding delay to prevent lock issues
        await new Promise((resolve) => setTimeout(resolve, 500));

        await FileViewer.open(filePath);
        console.log("File opened successfully");
      } catch (error) {
        console.error("File open error:", error);
        Alert.alert(
          "Unable to open the file. Please ensure there is an appropriate app installed to open this file type."
        );
      }
    } else {
      console.log("File does not exist, cannot open.");
    }
  };

  const downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  const fileExists = await checkIfFileExists(downloadDest);
  if (fileExists) {
    await openFile(downloadDest); // Open the file if it already exists

    return;
  }
  callBack(true);
  RNFS.downloadFile({
    fromUrl: url,
    toFile: downloadDest,
  })
    .promise.then(async (res) => {
      console.log("File downloaded to:", downloadDest);
      callBack(false);

      // Open the downloaded file using react-native-file-viewer
      try {
        await FileViewer.open(downloadDest);
        console.log("File opened successfully");
      } catch (error) {
        console.error("File open error:", error);
        Alert.alert("Unable to open the file.");
      }
    })
    .catch((error) => {
      console.error("File download error:", error);
      showNotification(
        "Download Failed",
        "There was an error downloading the file."
      );
    });
};
export default handleDownloadFiles;

// Usage
