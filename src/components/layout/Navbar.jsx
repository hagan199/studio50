import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './Navbar.css';

const fallbackNavLinks = [
  { label: 'Home', href: '#' },
  { label: 'About Us', href: '#about' },
  { label: 'Programs & Zonal Activities', href: '#programs' },
  { label: 'Awards & Partners', href: '#awards' },
  { label: 'Auditions', href: '#auditions' },
  { label: 'Contact Us', href: '#contact' },
];

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

function scrollToHref(href) {
  if (!href || href === '#' || href === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    const el = findElement(href);
    if (el) {
      const navHeight = document.querySelector('.navbar')?.offsetHeight || 65;
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 10;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brand, setBrand] = useState(null);
  const [navLinks, setNavLinks] = useState(fallbackNavLinks);
  const [activeHref, setActiveHref] = useState('#');

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
    api.get('/api/content').then((res) => setBrand(res.data.brand)).catch(() => {});
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

  // Active section tracking via IntersectionObserver
  useEffect(() => {
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
  }, [navLinks]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen);
    return () => document.body.classList.remove('nav-open');
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleNavClick = useCallback((e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    document.body.classList.remove('nav-open');
    requestAnimationFrame(() => scrollToHref(href));
  }, []);

  const isActive = (href) => {
    if (href === '#' || href === '/') return activeHref === '#';
    return activeHref === href;
  };

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-progress" aria-hidden="true" />
      <div className="nav-container">
        <a href="#" className="brand-link" onClick={(e) => handleNavClick(e, '#')}>
          <img
            src={brand?.logoUrl || '/images/hmr-logo-new.avif'}
            alt={brand?.name || 'Hype My Region'}
            className="brand-img"
          />
        </a>
        <div className={`nav-overlay${menuOpen ? ' visible' : ''}`} onClick={closeMenu} />
        <div className={`nav-menu${menuOpen ? ' open' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`nav-link${isActive(link.href) ? ' active' : ''}`}
              onClick={(e) => handleNavClick(e, link.href)}
            >
              <div className="clip">
                <div className="clip-text-w">
                  <div className="btn-text">{link.label}</div>
                </div>
                <div className="clip-text-w bottom">
                  <div className="btn-text">{link.label}</div>
                </div>
              </div>
            </a>
          ))}
          <a href="#auditions" className="nav-link cta-link" onClick={(e) => handleNavClick(e, '#auditions')}>
            <div className="clip">
              <div className="clip-text-w">
                <div className="btn-text">Get Audition Forms</div>
              </div>
              <div className="clip-text-w bottom">
                <div className="btn-text">Get Audition Forms</div>
              </div>
            </div>
          </a>
        </div>
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
