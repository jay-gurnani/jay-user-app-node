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
import AWSXRay from 'aws-xray-sdk-core';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

const segment = AWSXRay.getSegment();
const traceId = segment?.trace_id || 'no-trace-id';

console.log(`[trace-id: ${traceId}] Profile routes initialized`);


router.get('/profile', getProfileHandler);
router.post('/profile', uploadProfileHandler);
router.get('/profile/:user_sub', getProfileBySubHandler);
router.post('/upload-image', upload.single('file'),uploadImageHandler);
router.get('/get-image', getImageHandler);
router.get('/get-image/:user_sub', getImageBySubHandler);
export default router;
