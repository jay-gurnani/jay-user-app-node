import express from 'express';
import multer from 'multer';


import {
  uploadProfileHandler,
  uploadImageHandler,
  getImageHandler,
  getProfileHandler,
  getProfileBySubHandler,
  getImageBySubHandler,
} from './profileHandlers.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();
console.log('Profile routes initialized');
// router.use(authenticate)
// Match FastAPI-style routes
router.get('/profile', getProfileHandler);              // /profile GET
router.post('/profile', uploadProfileHandler);          // /profile POST
router.get('/profile/:user_sub', getProfileBySubHandler); // /profile/{sub} GET
router.post('/upload-image', upload.single('file'),uploadImageHandler);       // /upload-image POST
router.get('/get-image', getImageHandler);              // /get-image GET
router.get('/get-image/:user_sub', getImageBySubHandler); // /get-image/{sub} GET

export default router;
