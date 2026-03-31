import express from 'express';
import cors from 'cors';

const app = express();

// CORS configuration
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test columns endpoint
app.get('/columns', (req, res) => {
  res.json([]);
});

app.post('/columns', (req, res) => {
  res.json({ id: 1, title: req.body.title || 'New Column', color: '#6366f1', position: 0 });
});

// Test tasks endpoint
app.post('/tasks', (req, res) => {
  res.json({ id: 1, title: req.body.title || 'New Task', columnId: 1, position: 0 });
});

app.patch('/tasks/:id', (req, res) => {
  res.json({ id: parseInt(req.params.id), ...req.body });
});

app.delete('/tasks/:id', (req, res) => {
  res.status(204).send();
});

app.post('/tasks/reorder', (req, res) => {
  res.json({ success: true });
});

app.patch('/columns/:id', (req, res) => {
  res.json({ id: parseInt(req.params.id), ...req.body });
});

app.delete('/columns/:id', (req, res) => {
  res.status(204).send();
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
