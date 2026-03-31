import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Column } from './components/Column.jsx';
import { TaskCardOverlay } from './components/TaskCard.jsx';
import { EditTaskModal } from './components/EditTaskModal.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import styles from './App.module.css';

export default function App() {
  const [columns, setColumns] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [addingCol, setAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColColor, setNewColColor] = useState('#6366f1');
  const [colSaving, setColSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taskboard_columns');
    if (saved) {
      try {
        setColumns(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load columns:', e);
      }
    } else {
      // Initialize with one empty column
      const initial = [{ id: 1, title: 'To Do', color: '#6366f1', position: 0, tasks: [] }];
      setColumns(initial);
      localStorage.setItem('taskboard_columns', JSON.stringify(initial));
    }
  }, []);

  // Save to localStorage whenever columns change
  useEffect(() => {
    if (columns.length > 0) {
      localStorage.setItem('taskboard_columns', JSON.stringify(columns));
    }
  }, [columns]);

  const handleDragStart = ({ active }) => {
    if (active.data.current?.type === 'task') {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeData = active.data.current;
    if (activeData?.type !== 'task') return;

    const task = activeData.task;
    const overId = over.id;

    let toColumnId, newIndex;

    if (String(overId).startsWith('col-')) {
      toColumnId = parseInt(overId.replace('col-', ''));
      const toCol = columns.find(c => c.id === toColumnId);
      newIndex = toCol ? toCol.tasks.length : 0;
    } else if (String(overId).startsWith('task-')) {
      const overTaskId = parseInt(overId.replace('task-', ''));
      const toCol = columns.find(c => c.tasks.some(t => t.id === overTaskId));
      if (!toCol) return;
      toColumnId = toCol.id;
      newIndex = toCol.tasks.findIndex(t => t.id === overTaskId);
      if (newIndex < 0) newIndex = toCol.tasks.length;
    } else {
      return;
    }

    const fromCol = columns.find(c => c.tasks.some(t => t.id === task.id));
    if (!fromCol) return;

    const newColumns = columns.map(col => {
      if (col.id === fromCol.id) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== task.id) };
      }
      if (col.id === toColumnId) {
        const updated = [...col.tasks];
        updated.splice(newIndex, 0, { ...task, columnId: toColumnId });
        return { ...col, tasks: updated };
      }
      return col;
    });

    setColumns(newColumns);
  };

  const addColumn = (title, color) => {
    const newId = Math.max(...columns.map(c => c.id), 0) + 1;
    const newColumn = { id: newId, title, color, position: columns.length, tasks: [] };
    setColumns([...columns, newColumn]);
  };

  const renameColumn = (id, newTitle) => {
    setColumns(columns.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const deleteColumn = (id) => {
    setColumns(columns.filter(c => c.id !== id));
  };

  const addTask = (columnId, title, description = '', priority = 'medium') => {
    const col = columns.find(c => c.id === columnId);
    if (!col) return;

    const newTaskId = Math.max(...col.tasks.map(t => t.id), 0) + 1;
    const newTask = { id: newTaskId, title, description, priority, columnId, position: col.tasks.length };

    setColumns(columns.map(c =>
      c.id === columnId ? { ...c, tasks: [...c.tasks, newTask] } : c
    ));
  };

  const updateTask = (id, columnId, updates) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? { ...col, tasks: col.tasks.map(t => t.id === id ? { ...t, ...updates } : t) }
        : col
    ));
  };

  const deleteTask = (id, columnId) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? { ...col, tasks: col.tasks.filter(t => t.id !== id) }
        : col
    ));
  };

  const handleAddColumn = async () => {
    const t = newColTitle.trim();
    if (!t) return;
    setColSaving(true);
    try {
      addColumn(t, newColColor);
      setNewColTitle('');
      setNewColColor('#6366f1');
      setAddingCol(false);
    } finally {
      setColSaving(false);
    }
  };

  const handleConfirm = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'task') {
      deleteTask(confirmDelete.id, confirmDelete.columnId);
    } else {
      deleteColumn(confirmDelete.id);
    }
    setConfirmDelete(null);
  };

  const totalTasks = columns.reduce((n, c) => n + c.tasks.length, 0);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>◈</span>
          <span className={styles.logoText}>TaskBoard</span>
        </div>
        <div className={styles.stats}>
          <span>{columns.length} columns</span>
          <span className={styles.dot}>·</span>
          <span>{totalTasks} tasks</span>
        </div>
      </header>

      <main className={styles.board}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.columns}>
            {columns.map(col => (
              <Column
                key={col.id}
                column={col}
                onAddTask={addTask}
                onEditTask={setEditingTask}
                onDeleteTask={(id, colId) => setConfirmDelete({ type: 'task', id, columnId: colId })}
                onRenameColumn={renameColumn}
                onDeleteColumn={(id) => setConfirmDelete({ type: 'column', id })}
              />
            ))}

            {addingCol ? (
              <div className={styles.newCol}>
                <input
                  autoFocus
                  placeholder="Column title…"
                  value={newColTitle}
                  onChange={e => setNewColTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') setAddingCol(false);
                  }}
                  maxLength={60}
                />
                <div className={styles.colorRow}>
                  <span className={styles.colorLabel}>Color:</span>
                  {['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6', '#a855f7', '#ec4899'].map(c => (
                    <button
                      key={c}
                      className={`${styles.colorSwatch} ${newColColor === c ? styles.colorActive : ''}`}
                      style={{ background: c }}
                      onClick={() => setNewColColor(c)}
                    />
                  ))}
                </div>
                <div className={styles.colFormActions}>
                  <button className={styles.saveBtn} onClick={handleAddColumn} disabled={colSaving || !newColTitle.trim()}>
                    {colSaving ? '…' : 'Add column'}
                  </button>
                  <button className={styles.cancelBtn} onClick={() => setAddingCol(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className={styles.addColBtn} onClick={() => setAddingCol(true)}>
                <span className={styles.plus}>+</span>
                <span>Add column</span>
              </button>
            )}
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          columns={columns}
          onSave={async (id, data) => {
            updateTask(id, editingTask.columnId, data);
            setEditingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={
            confirmDelete.type === 'column'
              ? 'Delete this column and all its tasks? This cannot be undone.'
              : 'Delete this task? This cannot be undone.'
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
