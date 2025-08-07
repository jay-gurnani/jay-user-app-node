import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/auth.js';
import profileRoutes from './src/routes/profile.js';
import adminRoutes from './src/routes/admin.js';
import AWSXRay from 'aws-xray-sdk';
import http from 'http';
import https from 'https';

const app = express();

// Capture all HTTP(s) traffic and AWS SDK calls
AWSXRay.captureHTTPsGlobal(http);
AWSXRay.captureHTTPsGlobal(https);

// X-Ray tracing middleware (must be early in the stack)
app.use(AWSXRay.express.openSegment('UserApp')); // 'UserApp' is the service name

app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API routes
app.use('/api/', authRoutes);
app.use('/api/', profileRoutes);
app.use('/api/', adminRoutes);

// Serve frontend build
app.use(express.static(path.join(__dirname, 'build')));

// Fallback to index.html for React Router
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Close the X-Ray segment
app.use(AWSXRay.express.closeSegment());

// Error handler
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default app;
