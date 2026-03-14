import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Shared hook for admin save operations.
 * Handles: async save, success/error toast, Ctrl+S shortcut.
 * @param {() => Promise<void>} onSave - async function to call on save
 */
export default function useAdminSave(onSave) {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type: 'success'|'error' }
  const fnRef = useRef(onSave);
  fnRef.current = onSave;

  const save = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      await fnRef.current();
      setToast({ msg: 'Saved successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3500);
    } catch {
      setToast({ msg: 'Failed to save. Please try again.', type: 'error' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSaving(false);
    }
  }, [saving]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  return { saving, toast, save };
}
