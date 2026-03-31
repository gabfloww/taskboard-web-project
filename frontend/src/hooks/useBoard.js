import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';

export function useBoard() {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchColumns = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getColumns();
      setColumns(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchColumns(); }, [fetchColumns]);

  // ── Columns ──────────────────────────────────────────────
  const addColumn = async (title, color) => {
    const col = await api.createColumn({ title, color });
    setColumns(prev => [...prev, col]);
  };

  const renameColumn = async (id, title) => {
    const updated = await api.updateColumn(id, { title });
    setColumns(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteColumn = async (id) => {
    await api.deleteColumn(id);
    setColumns(prev => prev.filter(c => c.id !== id));
  };

  // ── Tasks ─────────────────────────────────────────────────
  const addTask = async (columnId, title, description, priority) => {
    const task = await api.createTask({ columnId, title, description, priority });
    setColumns(prev => prev.map(c =>
      c.id === columnId ? { ...c, tasks: [...c.tasks, task] } : c
    ));
  };

  const updateTask = async (taskId, data) => {
    const updated = await api.updateTask(taskId, data);
    setColumns(prev => prev.map(c => ({
      ...c,
      tasks: c.tasks.map(t => t.id === taskId ? { ...t, ...updated } : t),
    })));
  };

  const deleteTask = async (taskId, columnId) => {
    await api.deleteTask(taskId);
    setColumns(prev => prev.map(c =>
      c.id === columnId ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) } : c
    ));
  };

  // ── Drag and Drop ─────────────────────────────────────────
  const moveTask = async (taskId, fromColumnId, toColumnId, newIndex) => {
    // Optimistic update
    let movedTask = null;
    let newColumns = columns.map(c => {
      if (c.id === fromColumnId) {
        movedTask = c.tasks.find(t => t.id === taskId);
        return { ...c, tasks: c.tasks.filter(t => t.id !== taskId) };
      }
      return c;
    });

    if (!movedTask) return;
    movedTask = { ...movedTask, columnId: toColumnId };

    newColumns = newColumns.map(c => {
      if (c.id === toColumnId) {
        const tasks = [...c.tasks];
        tasks.splice(newIndex, 0, movedTask);
        return { ...c, tasks };
      }
      return c;
    });

    setColumns(newColumns);

    // Persist positions
    const reorderPayload = [];
    newColumns.forEach(col => {
      col.tasks.forEach((t, i) => {
        reorderPayload.push({ id: t.id, columnId: col.id, position: i });
      });
    });

    try {
      await api.reorderTasks(reorderPayload);
    } catch {
      // Revert on error
      fetchColumns();
    }
  };

  return {
    columns, loading, error,
    addColumn, renameColumn, deleteColumn,
    addTask, updateTask, deleteTask, moveTask,
    refresh: fetchColumns,
  };
}
