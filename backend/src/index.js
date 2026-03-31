import express from 'express';
import cors from 'cors';
import columnRoutes from './routes/columns.js';
import taskRoutes from './routes/tasks.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for development and production
const corsOrigin = process.env.NODE_ENV === 'production'
  ? process.env.VERCEL_URL || '*'
  : 'http://localhost:5173';

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Routes
app.use('/api/columns', columnRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ TaskBoard API running at http://localhost:${PORT}`);
});
