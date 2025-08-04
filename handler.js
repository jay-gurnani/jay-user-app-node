// import { signupHandler, loginHandler } from "./src/routes/auth.js";
// import { listUsersHandler } from './src/routes/admin.js';
// import {
//   uploadProfileHandler,
//   uploadImageHandler,
//   getImageHandler,
//   getProfileHandler,
//   getProfileBySubHandler
// } from './src/routes/profile.js';

// export const signup = async (event) => await signupHandler(event);
// export const login = async (event) => await loginHandler(event);
// export const uploadProfile = async (event) => await uploadProfileHandler(event);
// export const uploadImage = async (event) => await uploadImageHandler(event);
// export const getImage = async (event) => await getImageHandler(event);
// export const getProfile = async (event) => await getProfileHandler(event);
// export const getProfileBySub = async (event) => await getProfileBySubHandler(event);
// export const listUsers = async (event) => await listUsersHandler(event);
import serverless from "serverless-http";
import app from "./app.js";

export const handler = serverless(app);