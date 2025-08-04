import AWS from 'aws-sdk';
import crypto from 'crypto';

const client = new AWS.CognitoIdentityServiceProvider();
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

function getSecretHash(username) {
  const hmac = crypto.createHmac('sha256', CLIENT_SECRET);
  hmac.update(username + CLIENT_ID);
  return hmac.digest('base64');
}

export async function signup(username, password) {
  try {
    const response = await client.signUp({
      ClientId: CLIENT_ID,
      USERNAME: username,
      PASSWORD: password,
      UserAttributes: [{ Name: 'email', Value: username }],
    }).promise();
    return createResponse(200, response);
  } catch (err) {
    return createResponse(400, { error: err.message });
  }
}

export async function login(username, password) {
  try {
    const response = await client.initiateAuth({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    }).promise();
    return createResponse(200, response.AuthenticationResult);
  } catch (err) {
    return createResponse(401, { error: err.message });
  }
}
