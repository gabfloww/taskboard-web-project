import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard.jsx';
import styles from './Column.module.css';

export function Column({
  column,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onRenameColumn,
  onDeleteColumn,
}) {
  const [addingTask, setAddingTask] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');

  const titleInputRef = useRef(null);
  const taskInputRef = useRef(null);

  const { setNodeRef, isOver } = useDroppable({
    id: `col-${column.id}`,
    data: { type: 'column', columnId: column.id },
  });

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (addingTask) taskInputRef.current?.focus();
  }, [addingTask]);

  const handleSaveTitle = async () => {
    const t = newTitle.trim();
    if (!t) { setNewTitle(column.title); setEditingTitle(false); return; }
    if (t !== column.title) await onRenameColumn(column.id, t);
    setEditingTitle(false);
  };

  const handleAddTask = async () => {
    const t = taskTitle.trim();
    if (!t) { setError('Task title is required'); return; }
    if (t.length > 120) { setError('Max 120 characters'); return; }
    setSaving(true);
    try {
      await onAddTask(column.id, t, taskDesc.trim() || undefined, taskPriority);
      setTaskTitle(''); setTaskDesc(''); setTaskPriority('medium');
      setAddingTask(false); setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const taskIds = column.tasks.map(t => `task-${t.id}`);

  return (
    <div className={`${styles.column} ${isOver ? styles.over : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.dot} style={{ background: column.color }} />
          {editingTitle ? (
            <input
              ref={titleInputRef}
              className={styles.titleInput}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') { setNewTitle(column.title); setEditingTitle(false); }
              }}
              maxLength={60}
            />
          ) : (
            <h2
              className={styles.title}
              onDoubleClick={() => setEditingTitle(true)}
              title="Double-click to rename"
            >
              {column.title}
            </h2>
          )}
          <span className={styles.count}>{column.tasks.length}</span>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(m => !m)}
            title="Column options"
          >
            <DotsIcon />
          </button>
          {menuOpen && (
            <div className={styles.menu} onMouseLeave={() => setMenuOpen(false)}>
              <button onClick={() => { setEditingTitle(true); setMenuOpen(false); }}>
                ✏️ Rename
              </button>
              <button
                className={styles.danger}
                onClick={() => { onDeleteColumn(column.id); setMenuOpen(false); }}
              >
                🗑 Delete column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task list */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={styles.taskList}>
          {column.tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={(t) => onDeleteTask(t.id, column.id)}
            />
          ))}
          {column.tasks.length === 0 && (
            <div className={styles.empty}>Drop tasks here</div>
          )}
        </div>
      </SortableContext>

      {/* Add task form */}
      {addingTask ? (
        <div className={styles.addForm}>
          {error && <p className={styles.error}>{error}</p>}
          <input
            ref={taskInputRef}
            placeholder="Task title…"
            value={taskTitle}
            onChange={e => { setTaskTitle(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Escape' && setAddingTask(false)}
            maxLength={120}
          />
          <textarea
            placeholder="Description (optional)"
            value={taskDesc}
            onChange={e => setTaskDesc(e.target.value)}
            rows={2}
            maxLength={500}
          />
          <div className={styles.priorityRow}>
            <span className={styles.priorityLabel}>Priority:</span>
            {['low', 'medium', 'high'].map(p => (
              <button
                key={p}
                className={`${styles.pBtn} ${taskPriority === p ? styles.pActive : ''}`}
                data-p={p}
                onClick={() => setTaskPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleAddTask} disabled={saving}>
              {saving ? '…' : '+ Add task'}
            </button>
            <button className={styles.cancelBtn} onClick={() => { setAddingTask(false); setError(''); }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className={styles.addBtn} onClick={() => setAddingTask(true)}>
          <span>+</span> Add task
        </button>
      )}
    </div>
  );
}

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
);
