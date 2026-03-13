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

function scrollToHref(href) {
  if (!href || href === '#' || href === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brand, setBrand] = useState(null);
  const [navLinks, setNavLinks] = useState(fallbackNavLinks);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
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

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
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
              className={`nav-link${link.href === '#' || link.href === '/' ? ' active' : ''}`}
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
