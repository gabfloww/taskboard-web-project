import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useBoard } from './hooks/useBoard.js';
import { Column } from './components/Column.jsx';
import { TaskCardOverlay } from './components/TaskCard.jsx';
import { EditTaskModal } from './components/EditTaskModal.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import styles from './App.module.css';

export default function App() {
  const {
    columns, loading, error,
    addColumn, renameColumn, deleteColumn,
    addTask, updateTask, deleteTask, moveTask,
  } = useBoard();

  const [activeTask, setActiveTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type:'task'|'column', id, columnId? }
  const [addingCol, setAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColColor, setNewColColor] = useState('#6366f1');
  const [colSaving, setColSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ── DnD handlers ──────────────────────────────────────────
  const handleDragStart = ({ active }) => {
    if (active.data.current?.type === 'task') {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeData = active.data.current;
    if (activeData?.type !== 'task') return;

    const task = activeData.task;
    const overId = over.id;

    // Determine target column and index
    let toColumnId, newIndex;

    if (String(overId).startsWith('col-')) {
      // Dropped on empty column droppable
      toColumnId = parseInt(overId.replace('col-', ''));
      const toCol = columns.find(c => c.id === toColumnId);
      newIndex = toCol ? toCol.tasks.length : 0;
    } else if (String(overId).startsWith('task-')) {
      // Dropped onto another task
      const overTaskId = parseInt(overId.replace('task-', ''));
      const toCol = columns.find(c => c.tasks.some(t => t.id === overTaskId));
      if (!toCol) return;
      toColumnId = toCol.id;
      newIndex = toCol.tasks.findIndex(t => t.id === overTaskId);
      if (newIndex < 0) newIndex = toCol.tasks.length;
    } else {
      return;
    }

    await moveTask(task.id, task.columnId, toColumnId, newIndex);
  };

  // ── Column add ────────────────────────────────────────────
  const handleAddColumn = async () => {
    const t = newColTitle.trim();
    if (!t) return;
    setColSaving(true);
    try {
      await addColumn(t, newColColor);
      setNewColTitle(''); setNewColColor('#6366f1');
      setAddingCol(false);
    } finally {
      setColSaving(false);
    }
  };

  // ── Confirm helpers ───────────────────────────────────────
  const handleConfirm = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'task') {
      await deleteTask(confirmDelete.id, confirmDelete.columnId);
    } else {
      await deleteColumn(confirmDelete.id);
    }
    setConfirmDelete(null);
  };

  // ── Render ────────────────────────────────────────────────
  const totalTasks = columns.reduce((n, c) => n + c.tasks.length, 0);

  return (
    <div className={styles.app}>
      {/* Header */}
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

      {/* Board */}
      <main className={styles.board}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Loading board…</span>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            ⚠️ Could not connect to the API. Make sure the backend is running on port 3001.
          </div>
        )}

        {!loading && (
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

              {/* Add Column */}
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
        )}
      </main>

      {/* Modals */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          columns={columns}
          onSave={async (id, data) => {
            await updateTask(id, data);
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
