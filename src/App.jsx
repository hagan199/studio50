import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLogin from './components/admin/AdminLogin';
import AdminPage from './pages/AdminPage';
import api from './utils/api';

const SITE_TITLE = 'studio50';

// Icons that ship with the repo. If SEO still points at one of these while the
// CMS has a real brand logo, the logo wins — otherwise the tab keeps showing
// the old default mark nobody ever changed.
const PLACEHOLDER_ICONS = new Set(['/images/favicon.png', '/images/webclip.png']);

const pickIcon = (seoValue, brandLogo) => {
  if (seoValue && !(brandLogo && PLACEHOLDER_ICONS.has(seoValue))) return seoValue;
  return brandLogo || seoValue;
};

function useSeoMeta() {
  useEffect(() => {
    document.title = SITE_TITLE;

    // The tab icon should track the brand logo unless SEO overrides it, so a
    // logo change in the CMS doesn't leave a stale favicon behind.
    const brandLogo = api
      .get('/api/content')
      .then((res) => res.data?.brand?.logoUrl || '')
      .catch(() => '');

    api.get('/api/seo').then(async (res) => {
      const s = res.data;
      document.title = SITE_TITLE;

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
      setOg('og:title', SITE_TITLE);
      setOg('og:description', s.ogDescription);
      setOg('og:image', s.ogImage);
      setOg('og:type', 'website');

      const setIcon = (rel, href) => {
        if (!href) return;
        let link = document.querySelector(`link[rel="${rel}"]`);
        if (!link) {
          link = document.createElement('link');
          link.rel = rel;
          document.head.appendChild(link);
        }
        link.href = href;
      };

      const logo = await brandLogo;
      setIcon('icon', pickIcon(s.favicon, logo));
      setIcon('apple-touch-icon', pickIcon(s.appleTouchIcon || s.favicon, logo));
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
