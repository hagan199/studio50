import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLogin from './components/admin/AdminLogin';
import AdminPage from './pages/AdminPage';
import api from './utils/api';

function useSeoMeta() {
  useEffect(() => {
    api.get('/api/seo').then((res) => {
      const s = res.data;
      if (s.pageTitle) document.title = s.pageTitle;

      const setMeta = (name, content) => {
        if (!content) return;
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
        el.setAttribute('content', content);
      };
      const setOg = (prop, content) => {
        if (!content) return;
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
        el.setAttribute('content', content);
      };

      setMeta('description', s.metaDescription);
      setMeta('keywords', s.keywords);
      setMeta('theme-color', s.themeColor);
      setOg('og:title', s.ogTitle);
      setOg('og:description', s.ogDescription);
      setOg('og:image', s.ogImage);
      setOg('og:type', 'website');

      if (s.favicon) {
        let link = document.querySelector('link[rel="icon"]');
        if (link) link.href = s.favicon;
      }
      if (s.appleTouchIcon) {
        let link = document.querySelector('link[rel="apple-touch-icon"]');
        if (link) link.href = s.appleTouchIcon;
      }
    }).catch(() => {});
  }, []);
}

export default function App() {
  useSeoMeta();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<AdminPage />} />
    </Routes>
  );
}
