import AWS from 'aws-sdk';
import dotenv from "dotenv";
dotenv.config();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TableName; // must exist in DynamoDB

const db = {
  async getProfile(userId) {
    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: {
        user_id: userId
      }
    }).promise();

    return result.Item || null;
  },

  async saveOrUpdateProfile(profile) {
    const { user_id, name, gender, height, bio, dob } = profile;

    return await dynamodb.put({
      TableName: TABLE_NAME,
      Item: {
        user_id,
        name,
        gender,
        height,
        bio,
        dob
      }
    }).promise();
  }
};

export default db;
