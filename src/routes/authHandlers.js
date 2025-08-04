import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import dotenv from "dotenv";
import { createResponse } from '../utils/response.js';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import fetch from 'node-fetch';

dotenv.config();
let pemsCache = null;
let pem = null

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

export async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.split(' ')[1];
  const decodedHeader = jwt.decode(token, { complete: true });
  // req.user = decodedHeader.payload.sub;
  if (!decodedHeader || !decodedHeader.header.kid) {
    throw new Error('Invalid token');
  }

  if (!pemsCache) {
    const region = process.env.COGNITO_REGION;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
    
    const response = await fetch(jwksUrl);
    const data = await response.json();
    
    if (!data.keys || !Array.isArray(data.keys)) {
      throw new Error('Invalid JWK response: keys not found');
    }

    pemsCache = {};
    for (const key of data.keys) {
      pemsCache[key.kid] = jwkToPem(key);
    }
  }

  pem = pemsCache[decodedHeader.header.kid];
  if (!pem) {
    throw new Error('Unknown kid in token');
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

export async function signupHandler(event) {
  try {
    const { username, password } = JSON.parse(event.body);

    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
      Password: password,
    });

    const response = await client.send(command);

    return createResponse(200, { message: "Signup successful", data: response });
  } catch (err) {
    console.error('Signup error:', err);
    return createResponse(400, { error: err.message });
  }
}

export async function loginHandler(event) {
  try {
    
    const { username, password } = JSON.parse(event.body);

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    });
    const response = await client.send(command);
    return createResponse(200, {
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
    });
  } catch (err) {
    console.error('Login error:', err);
    return createResponse(401, { error: err.message });
  }
}
