import AWS from "aws-sdk";
import { PermissionsAndroid, Platform } from "react-native";
import RNFS from "react-native-fs";
import { Buffer } from "buffer";

const S3_BUCKET = "csappproduction-storage";
const REGION = "ap-south-1";
const ACCESS_KEY = "AKIAU6GDZYODLC5QOLPX";
const SECRET_KEY = "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";
// AWS configuration
AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  region: REGION,
});

const s3 = new AWS.S3();

  const uploadFileToS3 = async (filePath,fileType,bucketUrl) => {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      const blob = await response.blob();

      const params = {
        Bucket: S3_BUCKET,
        Key: bucketUrl,
        Body: blob,
        ContentType: fileType,
        ACL: 'public-read',
      };
     const data = await s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

export default uploadFileToS3;
