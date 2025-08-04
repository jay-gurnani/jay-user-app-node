import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const BUCKET_NAME = process.env.S3_BUCKET;

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

export async function uploadProfileImage(userId, fileName, fileBuffer) {
  const key = `profile-images/${userId}/${fileName}`;

  const result = await s3.upload({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/jpeg', // Or detect dynamically
  }).promise();

  return result;
}

export async function getProfileImageUrl(fileName) {
  const key = fileName;
  try {
    await s3.headObject({ Bucket: BUCKET_NAME, Key: key }).promise();
    console.log(`Image found for key: ${key}`);
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: 3600, // 1 hour
    });

    return signedUrl;
  } catch (err) {
    if (err.code === 'NotFound' || err.statusCode === 404) {
      return null;
    }
    throw err;
  }
}

export default {
  uploadProfileImage,
  getProfileImageUrl
};
