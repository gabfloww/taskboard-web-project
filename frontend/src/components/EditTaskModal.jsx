import React, { useState, useEffect, useRef } from 'react';
import styles from './EditTaskModal.module.css';

const PRIORITIES = ['low', 'medium', 'high'];
const P_COLORS = { high: '#f43f5e', medium: '#f59e0b', low: '#10b981' };

export function EditTaskModal({ task, columns, onSave, onClose }) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [columnId, setColumnId] = useState(task.columnId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = async () => {
    const t = title.trim();
    if (!t) { setError('Title is required'); return; }
    if (t.length > 120) { setError('Max 120 characters'); return; }
    setSaving(true);
    try {
      await onSave(task.id, {
        title: t,
        description: desc.trim() || null,
        priority,
        columnId,
      });
      onClose();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Edit Task</h3>
          <button className={styles.closeBtn} onClick={onClose} title="Close (Esc)">✕</button>
        </div>

        <div className={styles.body}>
          {error && <p className={styles.error}>{error}</p>}

          <label className={styles.label}>Title *</label>
          <input
            ref={titleRef}
            value={title}
            onChange={e => { setTitle(e.target.value); setError(''); }}
            maxLength={120}
            placeholder="Task title"
          />

          <label className={styles.label}>Description</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            maxLength={500}
            placeholder="Optional description…"
            rows={3}
          />

          <label className={styles.label}>Priority</label>
          <div className={styles.priorityRow}>
            {PRIORITIES.map(p => (
              <button
                key={p}
                className={`${styles.pBtn} ${priority === p ? styles.pActive : ''}`}
                style={priority === p ? { color: P_COLORS[p], borderColor: P_COLORS[p] + '60', background: P_COLORS[p] + '18' } : {}}
                onClick={() => setPriority(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <label className={styles.label}>Column</label>
          <select
            className={styles.select}
            value={columnId}
            onChange={e => setColumnId(parseInt(e.target.value))}
          >
            {columns.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
