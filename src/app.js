const express = require('express');
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');

const app = express();

// Middlewares
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint (for Docker & Load Balancer)
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'task-manager-backend',
    version: '1.0.0'
  });
});

// Mount Resource Routers
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/tasks', tasksRouter);

// 404 Route Handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

module.exports = app;
