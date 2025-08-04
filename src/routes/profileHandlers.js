import db from '../utils/db.js';
import S3 from '../utils/s3.js';
import { verifyToken } from './authHandlers.js';

export async function uploadProfileHandler(req, res) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const user = await verifyToken(authHeader);
    const userId = user.sub;
    console.log('User from token:', user);
    const { name, gender, height, bio, dob } = req.body;
    
    await db.saveOrUpdateProfile({
      user_id: userId,
      name,
      gender,
      height,
      bio,
      dob,
    });

    res.status(200).json({ message: 'Profile saved successfully.' });
  } catch (error) {
    console.error('uploadProfileHandler error:', error);
    res.status(500).json({ error: 'Failed to save profile.' });
  }
}

export async function uploadImageHandler(req, res) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const user = await verifyToken(authHeader);
    const userId = user.sub;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = 'profile.jpg';

    const result = await S3.uploadProfileImage(userId, fileName, fileBuffer);
    res.status(200).json({ url: result.Location });
  } catch (error) {
    console.error('uploadImageHandler error:', error);
    res.status(500).json({ error: 'Failed to upload image.' });
  }
}


export async function getImageHandler(req, res) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const user = await verifyToken(authHeader);
    const userId = user.sub;

    const fileKey = `profile-images/${userId}/profile.jpg`; // adjust filename logic if needed

    const url = await S3.getProfileImageUrl(fileKey);
    if (!url) {
      return res.status(404).json({ error: 'Image not found.' });
    }

    res.status(200).json({ url });
  } catch (error) {
    console.error('getImageHandler error:', error);
    res.status(500).json({ error: 'Failed to get image URL.' });
  }
}


export async function getProfileHandler(req, res) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const user = await verifyToken(authHeader);
    const userId = user.sub;

    const profile = await db.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error('getProfileHandler error:', error);
    res.status(500).json({ error: 'Failed to get profile.' });
  }
}

export async function getProfileBySubHandler(req, res) {
  try {
    const userId = req.params.user_sub;
    const profile = await db.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found for given sub.' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error('getProfileBySubHandler error:', error);
    res.status(500).json({ error: 'Failed to get profile by sub.' });
  }
}

export async function getImageBySubHandler(req, res) {
  try {
    const userId = req.params.user_sub;
    const url = await S3.getProfileImageUrl(userId);
    if (!url) {
      return res.status(404).json({ error: 'Image not found.' });
    }
    res.status(200).json({ url });
  } catch (error) {
    console.error('getImageBySubHandler error:', error);
    res.status(500).json({ error: 'Failed to get image by sub.' });
  }
}