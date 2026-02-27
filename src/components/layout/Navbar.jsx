import { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Navbar.css';

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'About Us', href: '#about' },
  { label: 'Programs & Zonal Activities', href: '#programs' },
  { label: 'Awards & Partners', href: '#awards' },
  { label: 'Auditions', href: '#auditions' },
  { label: 'Contact Us', href: '#contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    api.get('/api/content').then((res) => setBrand(res.data.brand)).catch(() => {});
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-container">
        <a href="#" className="brand-link">
          <img
            src={brand?.logoUrl || '/images/hmr-logo-new.avif'}
            alt={brand?.name || 'Hype My Region'}
            className="brand-img"
          />
        </a>
        <div className={`nav-menu${menuOpen ? ' open' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`nav-link${link.label === 'Home' ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
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
          <a href="#auditions" className="nav-link cta-link" onClick={() => setMenuOpen(false)}>
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
