import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../db.js';

const router = Router();

// POST create task
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('columnId').isInt().withMessage('columnId must be an integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const columnId = parseInt(req.body.columnId);
      const maxPos = await prisma.task.aggregate({
        where: { columnId },
        _max: { position: true },
      });
      const position = (maxPos._max.position ?? -1) + 1;

      const task = await prisma.task.create({
        data: {
          title: req.body.title,
          description: req.body.description || null,
          priority: req.body.priority || 'medium',
          position,
          columnId,
        },
      });
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

// PATCH update task (edit or move)
router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('title').optional().trim().notEmpty().isLength({ max: 120 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('columnId').optional().isInt(),
    body('position').optional().isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const task = await prisma.task.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...(req.body.title !== undefined && { title: req.body.title }),
          ...(req.body.description !== undefined && { description: req.body.description }),
          ...(req.body.priority && { priority: req.body.priority }),
          ...(req.body.columnId !== undefined && { columnId: parseInt(req.body.columnId) }),
          ...(req.body.position !== undefined && { position: req.body.position }),
        },
      });
      res.json(task);
    } catch (err) {
      res.status(404).json({ error: 'Task not found' });
    }
  }
);

// POST bulk reorder tasks (drag-and-drop)
router.post('/reorder', async (req, res) => {
  // body: { tasks: [{ id, columnId, position }] }
  const { tasks } = req.body;
  if (!Array.isArray(tasks)) return res.status(400).json({ error: 'tasks array required' });

  try {
    await prisma.$transaction(
      tasks.map((t) =>
        prisma.task.update({
          where: { id: t.id },
          data: { columnId: t.columnId, position: t.position },
        })
      )
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

// DELETE task
router.delete('/:id', [param('id').isInt()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await prisma.task.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: 'Task not found' });
  }
});

export default router;
