import express from 'express';
import cors from 'cors';

const app = express();

// CORS configuration for development and production
const corsOrigin = process.env.NODE_ENV === 'production'
  ? '*'
  : 'http://localhost:5173';

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple routes that don't require database
app.get('/columns', async (req, res) => {
  try {
    const { db } = await import('../backend/src/db.js');
    const columns = await db.column.findMany({ include: { tasks: true } });
    res.json(columns);
  } catch (err) {
    console.error('Error fetching columns:', err);
    res.status(500).json({ error: 'Failed to fetch columns', details: err.message });
  }
});

app.post('/columns', async (req, res) => {
  try {
    const { db } = await import('../backend/src/db.js');
    const { title, color } = req.body;
    const column = await db.column.create({
      data: { title, color: color || '#6366f1', position: 0 },
    });
    res.json(column);
  } catch (err) {
    console.error('Error creating column:', err);
    res.status(500).json({ error: 'Failed to create column', details: err.message });
  }
});

app.patch('/columns/:id', async (req, res) => {
  try {
    const { db } = await import('../backend/src/db.js');
    const { id } = req.params;
    const { title, color, position } = req.body;
    const column = await db.column.update({
      where: { id: parseInt(id) },
      data: { ...(title && { title }), ...(color && { color }), ...(position !== undefined && { position }) },
    });
    res.json(column);
  } catch (err) {
    console.error('Error updating column:', err);
    res.status(500).json({ error: 'Failed to update column', details: err.message });
  }
});

app.delete('/columns/:id', async (req, res) => {
  try {
    const { db } = await import('../backend/src/db.js');
    const { id } = req.params;
    await db.column.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting column:', err);
    res.status(500).json({ error: 'Failed to delete column', details: err.message });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const { db } = await import('../backend/src/db.js');
    const { title, description, priority, columnId } = req.body;
    const task = await db.task.create({
      data: { title, description, priority: priority || 'medium', columnId: parseInt(columnId), position: 0 },
    });
    res.json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
});

app.patch('/tasks/:id', async (req, res) => {
  try {
    const { db } = await import('../backend/src/db.js');
    const { id } = req.params;
    const { title, description, priority, columnId, position } = req.body;
    const task = await db.task.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(columnId && { columnId: parseInt(columnId) }),
        ...(position !== undefined && { position }),
      },
    });
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const { db } = await import('../backend/src/db.js');
    const { id } = req.params;
    await db.task.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
});

app.post('/tasks/reorder', async (req, res) => {
  try {
    const { db } = await import('../backend/src/db.js');
    const { tasks } = req.body;
    await Promise.all(
      tasks.map((t) =>
        db.task.update({
          where: { id: t.id },
          data: { position: t.position, columnId: t.columnId },
        })
      )
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error reordering tasks:', err);
    res.status(500).json({ error: 'Failed to reorder tasks', details: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

export default app;
