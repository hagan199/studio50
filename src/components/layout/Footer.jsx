import './Footer.css';

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'About us', href: '#about' },
  { label: 'Programs & Activities', href: '#programs' },
  { label: 'Awards & Partners', href: '#awards' },
  { label: 'Auditions', href: '#auditions' },
  { label: 'Contact Us', href: '#contact' },
];

export default function Footer() {
  return (
    <footer className="footer-section" id="contact">
      <div className="footer-w">
        <div className="footer-logo-w">
          <a href="#" className="footer-brand-link">
            <img src="/images/hmr-logo-new.avif" alt="HMR" className="footer-logo-img" />
          </a>
        </div>
        <div className="footer-content-w">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="footer-link">
              {link.label}
            </a>
          ))}
        </div>
        <div className="footer-content-w">
          <h3 className="footer-title">Connect with us</h3>
          <a href="mailto:info@hypemyregion.com" className="footer-link alt">
            info@hypemyregion.com
          </a>
          <div className="social-w">
            <a href="https://www.facebook.com/hmrgh" className="social-link-block" target="_blank" rel="noopener noreferrer">
              <img src="/images/Facebook.svg" alt="Facebook" className="social-img" />
            </a>
            <a href="#" className="social-link-block">
              <img src="/images/Instagram.svg" alt="Instagram" className="social-img" />
            </a>
            <a href="https://www.linkedin.com/company/hypemyregion/" className="social-link-block" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="white">
                <path d="M41 4H9C6.24 4 4 6.24 4 9v32c0 2.76 2.24 5 5 5h32c2.76 0 5-2.24 5-5V9c0-2.76-2.24-5-5-5zM17 20v19h-6V20h6zm-3-9.23c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5zM39 39h-6v-9.5c0-2.49-2.01-4.5-4.5-4.5S24 27.01 24 29.5V39h-6V20h6v2.56c1.77-2.03 4.35-3.56 6.5-3.56 5.24 0 8.5 3.93 8.5 9.21V39z"/>
              </svg>
            </a>
            <a href="#" className="social-link-block">
              <img src="/images/X.svg" alt="X" className="social-img" />
            </a>
            <a href="#" className="social-link-block">
              <img src="/images/YouTube.svg" alt="YouTube" className="social-img" />
            </a>
          </div>
        </div>
        <div className="footer-content-w">
          <h3 className="footer-title">Legal & Disclaimer</h3>
          <h4 className="footer-disclaimer">
            Registration for auditions does not constitute a purchase of any prize or guarantee
            of advancement. All outcomes are determined through merit-based judging.
          </h4>
        </div>
        <div className="footer-note-w">
          <div className="footer-link note">&copy; 2026 Hype My Region. All rights reserved.</div>
          <a href="#" className="footer-link note">Privacy Policy</a>
          <a href="#" className="footer-link note">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
}
