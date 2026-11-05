import { useState } from 'react';

/** Collapsible editor panel used across CMS pages. */
export function Section({ title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`admin-section${open ? ' admin-section--open' : ''}`}>
      <button className="admin-section__toggle" onClick={() => setOpen(!open)}>
        <span className="admin-section__title">
          {title}
          {count !== undefined && <span className="admin-section__count">{count}</span>}
        </span>
        <svg className="admin-section__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && <div className="admin-section__body">{children}</div>}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="admin-loading">
      <div className="admin-loading__bar" />
      <div className="admin-loading__bar" />
      <div className="admin-loading__bar" />
      <div className="admin-loading__bar" />
    </div>
  );
}
