import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { pendingRequests } from '../../utils/api';
import { isExternalHref, isHomeHref, isRouteHref, resolveSiteHref } from '../../utils/links';
import './Navbar.css';

const fallbackNavLinks = [
  { label: 'Home', href: '#' },
  { label: 'Graduation', href: '/graduation' },
  { label: 'About Us', href: '#about' },
  { label: 'Programs & Zonal Activities', href: '#programs' },
  { label: 'Awards & Partners', href: '#awards' },
  { label: 'Auditions', href: '#auditions' },
  { label: 'Contact Us', href: '#contact' },
];

// Cross-page "/#section" arrival: keep re-aligning until API requests are done
// and the target has not moved for HASH_SETTLE_MS, giving up after
// HASH_ALIGN_MAX_MS regardless.
const HASH_SETTLE_MS = 600;
const HASH_ALIGN_MAX_MS = 8000;
const USER_SCROLL_EVENTS = ['wheel', 'touchmove', 'keydown', 'mousedown'];

function findElement(href) {
  if (!href || href === '#' || href === '/') return null;

  // 1. Direct match by ID
  const id = href.replace(/^#/, '');
  const direct = document.getElementById(id);
  if (direct) return direct;

  // 2. Try querySelector (handles complex selectors)
  try {
    const qsel = document.querySelector(href);
    if (qsel) return qsel;
  } catch { /* invalid selector, continue */ }

  // 3. Fuzzy match — strip non-alphanumeric and search all IDs
  const clean = id.replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (clean) {
    const all = document.querySelectorAll('[id]');
    for (const el of all) {
      const elClean = el.id.replace(/[^a-z0-9]/gi, '').toLowerCase();
      if (elClean === clean) return el;
    }
    // 4. Partial / contains match
    for (const el of all) {
      const elClean = el.id.replace(/[^a-z0-9]/gi, '').toLowerCase();
      if (elClean.includes(clean) || clean.includes(elClean)) return el;
    }
  }

  return null;
}

// Scroll position that puts el just below the fixed navbar.
function targetTop(el) {
  const navHeight = document.querySelector('.navbar')?.offsetHeight || 65;
  return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - navHeight - 10));
}

function scrollToHref(href) {
  if (!href || href === '#' || href === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    const el = findElement(href);
    if (el) window.scrollTo({ top: targetTop(el), behavior: 'smooth' });
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brand, setBrand] = useState(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [navigation, setNavigation] = useState({
    ctaText: 'Get in Touch',
    ctaLink: '#auditions',
  });
  const [navLinks, setNavLinks] = useState(fallbackNavLinks);
  const [activeHref, setActiveHref] = useState('#');
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  // Scroll position + progress bar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      document.documentElement.style.setProperty('--scroll-progress', `${pct}%`);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    api.get('/api/content')
      .then((res) => {
        setBrand(res.data.brand);
        setNavigation((prev) => ({
          ...prev,
          ...(res.data.navigation || {}),
        }));
      })
      .catch(() => setBrand({ name: 'Hype My Region', logoUrl: '/images/hmr-logo-new.avif' }))
      .finally(() => setContentLoaded(true));
  }, []);

  useEffect(() => {
    api
      .get('/api/menu')
      .then((res) => {
        const items = (res.data?.items || [])
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item) => ({ label: item.label, href: item.href }))
          .filter((item) => item.label && item.href);
        if (items.length) setNavLinks(items);
      })
      .catch(() => {});
  }, []);

  // Arriving on the homepage from another page with "/#section". Each section
  // renders only once its own API data arrives, so the target can exist while
  // the sections above it are still empty — scrolling to it once lands near
  // the top of the page. Keep it aligned while the layout fills in, and stop
  // as soon as the user scrolls themselves.
  useEffect(() => {
    if (!isHome || !location.hash) return;
    const hash = location.hash;
    const started = Date.now();
    let lastTop = null;
    let settledAt = null;
    let timer;

    const stop = () => {
      clearTimeout(timer);
      USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, stop));
    };
    USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }));

    const align = () => {
      const el = findElement(hash);
      if (el) {
        const top = targetTop(el);
        if (lastTop === null || Math.abs(top - lastTop) > 2) {
          // Instant, not smooth: a smooth scroll aimed at a moving target
          // falls short when content above it loads mid-animation.
          window.scrollTo({ top, behavior: 'instant' });
          lastTop = top;
          settledAt = Date.now();
        }
      }
      const settled =
        settledAt !== null && pendingRequests() === 0 && Date.now() - settledAt > HASH_SETTLE_MS;
      if (settled || Date.now() - started > HASH_ALIGN_MAX_MS) return stop();
      timer = setTimeout(align, 100);
    };
    align();
    return stop;
  }, [isHome, location.hash, location.key]);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    // Anchors only refer to homepage sections; elsewhere a fuzzy id match
    // would light up the wrong link.
    if (!isHome) return;
    const sectionHrefs = navLinks
      .filter((l) => l.href.startsWith('#') && l.href.length > 1)
      .map((l) => l.href);

    // Map each href to the element it resolves to
    const hrefToEl = new Map();
    sectionHrefs.forEach((href) => {
      const el = findElement(href);
      if (el) hrefToEl.set(el, href);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const href = hrefToEl.get(entry.target);
            if (href) setActiveHref(href);
          }
        });
      },
      { threshold: 0.25, rootMargin: '-70px 0px -45% 0px' }
    );

    hrefToEl.forEach((_, el) => observer.observe(el));

    return () => observer.disconnect();
  }, [navLinks, isHome]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen);
    return () => document.body.classList.remove('nav-open');
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleNavClick = useCallback((e, href) => {
    setMenuOpen(false);
    document.body.classList.remove('nav-open');
    // External links and modified clicks (new tab etc.) keep browser behaviour.
    if (isExternalHref(href) || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();

    if (isRouteHref(href)) {
      if (location.pathname !== href) navigate(href);
      window.scrollTo({ top: 0 });
      return;
    }
    if (!isHome) {
      navigate(resolveSiteHref(href, location.pathname));
      if (isHomeHref(href)) window.scrollTo({ top: 0 });
      return;
    }
    requestAnimationFrame(() => scrollToHref(href));
  }, [isHome, location.pathname, navigate]);

  const isActive = (href) => {
    if (isRouteHref(href)) return location.pathname === href;
    if (!isHome) return false;
    if (isHomeHref(href)) return activeHref === '#';
    return activeHref === href;
  };

  const linkHref = (href) => resolveSiteHref(href, location.pathname);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-progress" aria-hidden="true" />
      <div className="nav-container">
        <a href={linkHref('#')} className="brand-link" onClick={(e) => handleNavClick(e, '#')} aria-label={brand?.name || 'Home'}>
          {contentLoaded && (
            <img
              src={brand?.logoUrl || '/images/hmr-logo-new.avif'}
              alt={brand?.name || 'Hype My Region'}
              className="brand-img"
            />
          )}
        </a>
        <div className={`nav-overlay${menuOpen ? ' visible' : ''}`} onClick={closeMenu} />
        <div className={`nav-menu${menuOpen ? ' open' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={linkHref(link.href)}
              className={`nav-link${isActive(link.href) ? ' active' : ''}`}
              aria-current={isRouteHref(link.href) && isActive(link.href) ? 'page' : undefined}
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
          <a href={linkHref(navigation.ctaLink)} className="nav-link cta-link mobile-only" onClick={(e) => handleNavClick(e, navigation.ctaLink)}>
            {navigation.ctaText}
          </a>
        </div>
        <a href={linkHref(navigation.ctaLink)} className="nav-cta desktop-only" onClick={(e) => handleNavClick(e, navigation.ctaLink)}>
          {navigation.ctaText}
        </a>
        <button
          className={`menu-button${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
