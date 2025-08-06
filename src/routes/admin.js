// routes/admin.js
import express from 'express';
import { listUsersHandler } from './adminHandlers.js';
import { verifyToken } from './authHandlers.js';

const router = express.Router();

const adminAuthMiddleware = async (req, res, next) => {
  try {
    // const token = req.headers.authorization || req.headers.Authorization;
    const user = await verifyToken(req);

    if (user['cognito:groups']?.includes('admin')) {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

router.get('/admin/users', adminAuthMiddleware, async (req, res) => {
  const result = await listUsersHandler();
  res.status(result.statusCode).json(JSON.parse(result.body));
});

export default router;
