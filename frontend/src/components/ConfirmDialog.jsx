import React from 'react';
import styles from './ConfirmDialog.module.css';

export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={styles.dialog}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
