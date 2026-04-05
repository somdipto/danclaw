/**
 * DanClaw Agent Runtime Server
 * OpenClaw-powered AI agent deployment server
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Track server instance for graceful shutdown
let server = null;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    environment: NODE_ENV
  });
});

// Agent status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    agent: 'danclaw-agent',
    status: 'running',
    openclaw: 'connected',
    openrouter: process.env.OPENROUTER_API_KEY ? 'configured' : 'missing',
    insforge: process.env.INSFORGE_URL ? 'configured' : 'missing'
  });
});

// Agent chat endpoint (OpenClaw integration point)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // TODO: Integrate with OpenClaw SDK for actual AI agent responses
    // For now, return a placeholder response
    res.json({
      response: `Agent received: ${message}`,
      agent: 'danclaw-agent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Agent processing failed' });
  }
});

// Metrics endpoint for monitoring
app.get('/metrics', (req, res) => {
  const memory = process.memoryUsage();
  res.json({
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memory.rss / 1024 / 1024) + 'MB'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown handler
function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server = app.listen(PORT, () => {
  console.log(`DanClaw Agent Runtime running on port ${PORT}`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
