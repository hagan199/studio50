import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SECTION_ROUTES = {
  hero: '/admin',
  auditionProcess: '/admin',
  whyHMR: '/admin',
  latestContent: '/admin',
  credibility: '/admin',
  marquee: '/admin',
  roadmap: '/admin',
  cta: '/admin',
  contact: '/admin/contact',
  services: '/admin/services',
};

export default function PreviewPane({ onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'ADMIN_EDIT_SECTION') {
        const route = SECTION_ROUTES[e.data.section] || '/admin';
        navigate(route);
        onClose();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="admin-preview">
      <div className="admin-preview__bar">
        <div className="admin-preview__bar-left">
          <span className="admin-preview__dot" />
          <span className="admin-preview__bar-title">Live Preview</span>
          <span className="admin-preview__bar-hint">Tap any section to open its editor</span>
        </div>
        <button className="admin-preview__close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Close Preview
        </button>
      </div>
      <div className="admin-preview__frame-wrap">
        <iframe
          src="/?edit=1"
          className="admin-preview__frame"
          title="Site Preview"
        />
      </div>
    </div>
  );
}
