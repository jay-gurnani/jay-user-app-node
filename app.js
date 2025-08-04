import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './src/routes/auth.js';
import profileRoutes from './src/routes/profile.js';
import adminRoutes from './src/routes/admin.js';

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend build
app.use(express.static(path.join(__dirname, 'build')));

// API routes
app.use(authRoutes);
app.use(profileRoutes);
app.use(adminRoutes);

// Fallback to index.html for React Router
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

export default app;
