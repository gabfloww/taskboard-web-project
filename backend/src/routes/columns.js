import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../db.js';

const router = Router();

// GET all columns with their tasks
router.get('/', async (req, res) => {
  try {
    const columns = await prisma.column.findMany({
      orderBy: { position: 'asc' },
      include: {
        tasks: { orderBy: { position: 'asc' } },
      },
    });
    res.json(columns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
});

// POST create column
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 60 }),
    body('color').optional().isHexColor(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const maxPos = await prisma.column.aggregate({ _max: { position: true } });
      const position = (maxPos._max.position ?? -1) + 1;

      const column = await prisma.column.create({
        data: {
          title: req.body.title,
          color: req.body.color || '#6366f1',
          position,
        },
        include: { tasks: true },
      });
      res.status(201).json(column);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create column' });
    }
  }
);

// PATCH update column
router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('title').optional().trim().notEmpty().isLength({ max: 60 }),
    body('color').optional().isHexColor(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const column = await prisma.column.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...(req.body.title && { title: req.body.title }),
          ...(req.body.color && { color: req.body.color }),
          ...(req.body.position !== undefined && { position: req.body.position }),
        },
        include: { tasks: { orderBy: { position: 'asc' } } },
      });
      res.json(column);
    } catch (err) {
      res.status(404).json({ error: 'Column not found' });
    }
  }
);

// DELETE column
router.delete('/:id', [param('id').isInt()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await prisma.column.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: 'Column not found' });
  }
});

export default router;
