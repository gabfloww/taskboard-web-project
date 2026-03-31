import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking...');
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    // Test API connection
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setApiStatus('✅ API Connected'))
      .catch(e => setApiStatus('❌ API Error: ' + e.message));

    // Fetch columns
    fetch('/api/columns')
      .then(r => r.json())
      .then(data => {
        setColumns(data || []);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleAddColumn = async () => {
    if (!title.trim()) return;
    try {
      const res = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const col = await res.json();
      setColumns([...columns, col]);
      setTitle('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>TaskBoard</h1>
      <p style={{ fontSize: '18px' }}>{apiStatus}</p>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New column title"
              style={{ padding: '8px', marginRight: '8px' }}
            />
            <button onClick={handleAddColumn} style={{ padding: '8px 16px' }}>
              Add Column
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {columns.map((col) => (
              <div key={col.id} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: col.color + '20' }}>
                <h2>{col.title}</h2>
                <p>{col.tasks?.length || 0} tasks</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
