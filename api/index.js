import express from 'express';
import cors from 'cors';
import columnRoutes from '../backend/src/routes/columns.js';
import taskRoutes from '../backend/src/routes/tasks.js';

const app = express();

// CORS configuration for development and production
const corsOrigin = process.env.NODE_ENV === 'production'
  ? process.env.VERCEL_URL || '*'
  : 'http://localhost:5173';

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Routes
app.use('/columns', columnRoutes);
app.use('/tasks', taskRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
