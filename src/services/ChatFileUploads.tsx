import AWS from "aws-sdk";

const S3_BUCKET = "cs-production-storage";
const REGION = "ap-south-1";
const ACCESS_KEY = "AKIAU6GDZYODGHPEKSGW";
const SECRET_KEY = "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";
AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  region: REGION,
});

const s3 = new AWS.S3();
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
const createChunks = (file: any) => {
  const chunks = [];
  let currentByte = 0;
  console.log("file", file);

  while (currentByte < file.size) {
    const chunk = file?.slice(currentByte, currentByte + CHUNK_SIZE);
    chunks.push(chunk);
    currentByte += CHUNK_SIZE;
  }

  return chunks;
};

export const getFileBlobFromUri = async (uri: any) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

export const uploadFileInChunks = async (
  blob: any,
  fileName: any,
  fileType: any,
  uniqueFileKey:any,
  setProgress:any
) => {
  const chunks = createChunks(blob);
  const uploadId = await initiateMultipartUpload(fileName, fileType);
  const uploadPromises = chunks?.map((chunk, index) => {
    return uploadChunk(
      uploadId,
      chunk,
      index + 1,
      fileName,

      (progressData: any) => {
        let progressPercentage = Math.round(
          (progressData.loaded / progressData.total) * 100
        );
        if (progressPercentage < 100) {
          console.log(progressPercentage);
        } else if (progressPercentage == 100) {
          console.log(progressPercentage);
        }
        // Update progress for the specific file
        setProgress((prev: any) => ({ ...prev, [uniqueFileKey]: progressPercentage }));
      }
    ); // Part numbers start from 1
  });

  const parts = await Promise.all(uploadPromises);
  // Complete multipart upload after all chunks are uploaded
  const result = await completeMultipartUpload(uploadId, parts, fileName);
  return result;
};

const initiateMultipartUpload = (fileName: any, fileType: any) => {
  return new Promise((resolve, reject) => {
    s3.createMultipartUpload(
      {
        Bucket: S3_BUCKET,
        Key: fileName,
        ContentType: fileType, // Set ContentType here
        ACL: 'public-read',
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.UploadId);
        }
      }
    );
  });
};

const uploadChunk = (
  uploadId: any,
  chunk: any,
  partNumber: any,
  fileName: any,

  onProgress: any
) => {
  return new Promise((resolve, reject) => {
    s3.uploadPart(
      {
        Bucket: S3_BUCKET,
        Key: fileName,
        PartNumber: partNumber,
        UploadId: uploadId,
        Body: chunk,
        
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            ETag: data.ETag,
            PartNumber: partNumber,
          });
        }
      }
    ).on("httpUploadProgress", onProgress);
  });
};

const completeMultipartUpload = (uploadId: any, parts: any, fileName: any) => {
  return new Promise((resolve, reject) => {
    s3.completeMultipartUpload(
      {
        Bucket: S3_BUCKET,
        Key: fileName,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
        
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log("Complete Multipart Upload Response:", data); // Log the response
          resolve(data?.Location); // Ensure that the data is resolved properly
        }
      }
    );
  });
};
