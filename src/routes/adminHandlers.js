// routes/adminHandlers.js
import AWS from 'aws-sdk';
import { createResponse } from '../utils/response.js';
import AWSXRay from 'aws-xray-sdk-core';
const cognito = new AWS.CognitoIdentityServiceProvider();
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const segment = AWSXRay.getSegment(); // gets the current X-Ray segment
const traceId = segment?.trace_id || 'no-trace-id';
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
    console.error(`[trace-id: ${traceId}]`,'listUsersHandler error:', error);
    return createResponse(500, { error: 'Failed to list users.' });
  }
};
