import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import dotenv from "dotenv";
import { createResponse } from '../utils/response.js';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import fetch from 'node-fetch';
import cookie from 'cookie';

dotenv.config();
let pemsCache = null;
let pem = null

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

export async function verifyToken(event) {
  const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
  if (!cookieHeader) {
    return createResponse(401, { error: "Not authenticated" });
  }

  const token = cookieHeader
    .split(";")
    .find(c => c.trim().startsWith("idToken="))
    ?.split("=")[1];

  if (!token) {
    return createResponse(401, { error: "Token not found" });
  }
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
    const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;

    const cookies = [
      cookie.serialize("accessToken", AccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 60 * 60,
      }),
      cookie.serialize("idToken", IdToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 60 * 60,
      }),
      cookie.serialize("refreshToken", RefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 60 * 60 * 24 * 7,
      }),
    ];
    return createResponse(200, { success: true }, {}, {
      "Set-Cookie": cookies,
    });

  } catch (err) {
    console.error("Login error:", err);
    return createResponse(401, { error: err.message });
  }
}

export async function logoutHandler(event) {
  return createResponse(
    200,
    { message: "Logged out successfully" },
    {
      'Set-Cookie': 'token=; HttpOnly; Secure; SameSite=None; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    }
  );
}

export async function meHandler(event) {
  const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
  if (!cookieHeader) {
    return createResponse(401, { error: "Not authenticated" });
  }

  const token = cookieHeader
    .split(";")
    .find(c => c.trim().startsWith("idToken="))
    ?.split("=")[1];

  if (!token) {
    return createResponse(401, { error: "Token not found" });
  }

  try {
    const decoded = jwt.decode(token);
    return createResponse(200, {
      sub: decoded.sub,
      roles: decoded["cognito:groups"] || [],
    });
  } catch (err) {
    console.error("JWT decode failed:", err);
    return createResponse(401, { error: "Invalid token" });
  }
}

export async function confirmSignUpHandler(event) {
  try {
    const { username, code } = JSON.parse(event.body);
    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
      ConfirmationCode: code,
    });

    await client.send(command);
    return createResponse(200, { message: "User confirmed successfully" });
  } catch (err) {
    console.error("Confirm sign-up error:", err);
    return createResponse(400, { error: err.message });
  }
}

export async function resendConfirmationCodeHandler(event) {
  try {
    const { username } = JSON.parse(event.body);
    const command = new ResendConfirmationCodeCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
    });

    await client.send(command);
    return createResponse(200, { message: "Confirmation code resent successfully" });
  } catch (err) {
    console.error("Resend confirmation code error:", err);
    return createResponse(400, { error: err.message });
  }
}

export async function forgotPasswordHandler(event) {
  try {
    const { username } = JSON.parse(event.body);

    const command = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
    });

    await client.send(command);
    return createResponse(200, { message: "Password reset code sent to user" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return createResponse(400, { error: err.message });
  }
}

export async function confirmForgotPasswordHandler(event) {
  try {
    const { username, confirmationCode, newPassword } = JSON.parse(event.body);
    const command = new ConfirmForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    });

    await client.send(command);
    return createResponse(200, { message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Confirm forgot password error:", err);
    return createResponse(400, { error: err.message });
  }
}