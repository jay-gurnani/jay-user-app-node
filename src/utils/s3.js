import AWS from './aws-client.js';
import dotenv from 'dotenv';
import AWSXRay from 'aws-xray-sdk-core';

dotenv.config();

const BUCKET_NAME = process.env.S3_BUCKET;
const segment = AWSXRay.getSegment(); // gets the current X-Ray segment
const traceId = segment?.trace_id || 'no-trace-id';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});


export async function configureS3WithCognito(identityId, token) {
  AWS.config.region = 'ap-south-1';
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-south-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // your identity pool ID
    Logins: {
      'cognito-idp.ap-south-1.amazonaws.com/ap-south-1_uQC4jFlhF': token // your user pool ID
    },
    IdentityId: identityId
  });
}


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

export async function getProfileImageUrl(key) {
  try {
    await s3.headObject({ Bucket: BUCKET_NAME, Key: key }).promise();

    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: 3600,
    });
    return signedUrl;
  } catch (err) {
    console.error(`[trace-id: ${traceId}]`,'Error in getProfileImageUrl:', err);
    return null;
  }
}


export default {
  uploadProfileImage,
  getProfileImageUrl,
  configureS3WithCognito
};
