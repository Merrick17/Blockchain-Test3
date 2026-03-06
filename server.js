const express = require('express');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const logger = require('./utils/logger');

const corsMiddleware = require('./middleware/cors.middleware');
const requestLogger = require('./middleware/logger.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const notFound = require('./middleware/notFound.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

const apiRoutes = require('./routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

// ── Global middleware ──────────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

// ── Health check (no rate limit, no auth) ─────────────────────────────────────
app.use('/health', healthRoutes);

// ── API routes ─────────────────────────────────────────────────────────────────
app.use('/api', apiLimiter, apiRoutes);

// ── Static build (production) ──────────────────────────────────────────────────
const buildPath = path.join(__dirname, 'build');
const indexPath = path.join(buildPath, 'index.html');

if (fs.existsSync(indexPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(indexPath));
} else {
  app.get('/', (req, res) => {
    res.status(503).send(
      '<h1>Build required</h1><p>Run <code>npm run build</code> first, then <code>npm run server</code>.</p>' +
        '<p>Or use dev setup: Terminal 1: <code>npm start</code> (port 3000), Terminal 2: <code>npm run dev</code> (port 3002).</p>'
    );
  });
}

// ── Error handling (must be last) ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────────────────────
const server = app.listen(config.port, () => {
  logger.info(`Environment : ${config.env}`);
  logger.info(`Server      : http://localhost:${config.port}`);
  logger.info(`API         : http://localhost:${config.port}/api`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${config.port} is already in use.`);
    logger.error('Set a different port via PORT= environment variable.');
    process.exit(1);
  } else {
    throw err;
  }
});

module.exports = app;
