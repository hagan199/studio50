export default function AdminToast({ toast }) {
  return (
    <div className={`admin-toast ${toast ? 'admin-toast--visible' : ''} ${toast?.type === 'error' ? 'admin-toast--error' : 'admin-toast--success'}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {toast?.type === 'error'
          ? <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
          : <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
        }
      </svg>
      {toast?.msg}
    </div>
  );
}
