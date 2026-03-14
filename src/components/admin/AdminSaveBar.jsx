export default function AdminSaveBar({ saving, onSave, dirty }) {
  return (
    <div className={`admin-save-bar${dirty ? ' admin-save-bar--dirty' : ''}`}>
      <span className="admin-save-bar__hint">
        {dirty ? 'Unsaved changes' : 'All changes saved'}
        <span className="admin-save-bar__kbd"><kbd>Ctrl</kbd>+<kbd>S</kbd></span>
      </span>
      <button className="admin-btn admin-btn--primary" onClick={onSave} disabled={saving}>
        {saving ? (
          <>
            <svg className="admin-spinner" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
            Saving...
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save Changes
          </>
        )}
      </button>
    </div>
  );
}
