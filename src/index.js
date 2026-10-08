/**
 * Main Application Entry Point
 * Express server for Home Credit LAP Voice Agent
 */

import express from 'express';
import dotenv from 'dotenv';
import { config } from './config/config.js';
import apiRoutes from './api/routes.js';
import { voiceRoutes, initializeTwilio } from './voice/VoiceRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (web interface)
app.use(express.static('public'));

// Initialize Twilio if credentials are provided
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
  initializeTwilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    process.env.TWILIO_PHONE_NUMBER
  );
  console.log('✓ Twilio voice calling enabled');
} else {
  console.log('⚠ Twilio not configured - voice calls disabled');
  console.log('  To enable: Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env');
}

// CORS middleware (for web clients)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/api/voice', voiceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Home Credit LAP Qualification Voice Agent',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      startSession: 'POST /api/sessions/start',
      sendMessage: 'POST /api/sessions/:sessionId/message',
      getSession: 'GET /api/sessions/:sessionId',
      listSessions: 'GET /api/sessions',
      deleteSession: 'DELETE /api/sessions/:sessionId'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
const PORT = config.server.port;

app.listen(PORT, () => {
  console.log('========================================');
  console.log('HOME CREDIT LAP VOICE AGENT');
  console.log('========================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.server.env}`);
  console.log(`Company: ${config.company.name}`);
  console.log(`Default Agent: ${config.company.defaultAgentName} (${config.company.defaultAgentGender})`);
  console.log('========================================');
  console.log(`API Documentation: http://localhost:${PORT}/`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
