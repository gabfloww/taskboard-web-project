import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './TaskCard.module.css';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#f43f5e', bg: '#f43f5e18' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#f59e0b18' },
  low:    { label: 'Low',    color: '#10b981', bg: '#10b98118' },
};

export function TaskCard({ task, onEdit, onDelete }) {
  const [hovering, setHovering] = useState(false);
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: `task-${task.id}`, data: { type: 'task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const date = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Drag handle */}
      <div className={styles.handle} {...attributes} {...listeners}>
        <DragIcon />
      </div>

      <div className={styles.body}>
        <p className={styles.title}>{task.title}</p>
        {task.description && (
          <p className={styles.desc}>{task.description}</p>
        )}
        <div className={styles.meta}>
          <span
            className={styles.priority}
            style={{ color: p.color, background: p.bg }}
          >
            {p.label}
          </span>
          <span className={styles.date}>{date}</span>
        </div>
      </div>

      {hovering && (
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            title="Edit task"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          >
            <EditIcon />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.delete}`}
            title="Delete task"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  );
}

// Ghost shown inside source column while dragging
export function TaskCardOverlay({ task }) {
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  return (
    <div className={`${styles.card} ${styles.overlay}`}>
      <div className={styles.body}>
        <p className={styles.title}>{task.title}</p>
        <div className={styles.meta}>
          <span className={styles.priority} style={{ color: p.color, background: p.bg }}>
            {p.label}
          </span>
        </div>
      </div>
    </div>
  );
}

const DragIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
    <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
    <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
