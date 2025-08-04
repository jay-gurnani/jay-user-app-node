// routes/adminHandlers.js
import AWS from 'aws-sdk';
import { createResponse } from '../utils/response.js';

const cognito = new AWS.CognitoIdentityServiceProvider();
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

export const listUsersHandler = async () => {
  try {
    const result = await cognito.listUsers({ UserPoolId: USER_POOL_ID }).promise();

    const users = result.Users.map((user) => {
      const emailAttr = user.Attributes.find((attr) => attr.Name === 'email');
      return {
        user_id: user.Username,
        name: emailAttr ? emailAttr.Value : '',
      };
    });

    return createResponse(200, { users });
  } catch (error) {
    console.error('listUsersHandler error:', error);
    return createResponse(500, { error: 'Failed to list users.' });
  }
};
