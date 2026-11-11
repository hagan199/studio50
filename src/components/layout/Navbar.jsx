import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { pendingRequests } from '../../utils/api';
import { isAnchorHref, isExternalHref, isHomeHref, isRouteHref, resolveSiteHref } from '../../utils/links';
import './Navbar.css';

// Only used if /api/menu fails — never rendered while the real menu loads,
// otherwise its different order shows for a moment and the links jump.
const fallbackNavLinks = [
  { label: 'Home', href: '#' },
  { label: 'About Us', href: '#about' },
  { label: 'Programs & Zonal Activities', href: '#programs' },
  { label: 'Awards & Partners', href: '#awards' },
  { label: 'Auditions', href: '#auditions' },
  { label: 'Our Team', href: '#team' },
  { label: 'Contact Us', href: '#contact' },
  { label: 'Graduation', href: '/graduation' }, 
];

const DEFAULT_NAVIGATION = { ctaText: 'Get in Touch', ctaLink: '#contact' };

// Every page renders its own Navbar, so it remounts on each route change.
// Keep the last menu/brand here so a remount starts from what was already on
// screen instead of blanking or flashing defaults; each mount still refetches.
const navCache = { links: null, brand: null, navigation: null };

// Landing correction (see keepAligned). Cross-page "/#section" arrivals hold
// the target for HASH_ALIGN_MAX_MS while the page loads; on-page clicks for
// CLICK_ALIGN_MAX_MS after their smooth scroll. "Settled" = API requests done
// and the target in place for HASH_SETTLE_MS.
const HASH_SETTLE_MS = 600;
const HASH_ALIGN_MAX_MS = 8000;
const CLICK_ALIGN_MAX_MS = 4000;
const USER_SCROLL_EVENTS = ['wheel', 'touchmove', 'keydown', 'mousedown'];
// Longest a clicked link stays lit while its smooth scroll travels.
const CLICK_LOCK_MS = 2500;

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

// Scroll position that puts el just below the fixed navbar. Uses the layout
// position (offsetTop chain), not getBoundingClientRect: scroll-in animations
// start elements shifted (e.g. service cards begin 50px low), and aiming at
// that shifted spot leaves the target under the navbar once it slides up.
function layoutTop(el) {
  let top = 0;
  for (let node = el; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}

function targetTop(el) {
  const navHeight = document.querySelector('.navbar')?.offsetHeight || 65;
  return Math.max(0, Math.round(layoutTop(el) - navHeight - 10));
}

// Briefly ring the element a link scrolled to. Service cards sit three to a
// row on desktop, so the row alone doesn't show which card was asked for.
function flashTarget(el) {
  if (!el || !el.classList.contains('service-card')) return;
  el.classList.remove('nav-target-flash');
  void el.offsetWidth; // restart the animation if it is already running
  el.classList.add('nav-target-flash');
  el.addEventListener('animationend', () => el.classList.remove('nav-target-flash'), { once: true });
}

/**
 * Keep the element from resolve() just below the navbar while the page around
 * it is still changing: sections render as their data arrives and lazy images
 * grow as they load, both of which move the target after a scroll was aimed.
 * Corrections are instant and only made while no scroll is in motion, so a
 * smooth scroll is never cut short. Ends after maxMs, or as soon as the user
 * scrolls, taps, clicks or presses a key. Returns a stop function.
 */
function keepAligned(resolve, { maxMs, waitForMotion = false, onSettled = null }) {
  const started = Date.now();
  let prevY = waitForMotion ? window.scrollY : null;
  let settledAt = null;
  let done = false;
  let timer;

  const stop = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, stop));
  };
  USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }));

  const tick = () => {
    if (done) return;
    const el = resolve();
    const y = window.scrollY;
    const idle = prevY === null || Math.abs(y - prevY) < 1;
    prevY = y;
    if (el && idle) {
      // Compare with where the page actually is, not where we last aimed: an
      // early scroll can be capped by a page that hasn't grown yet.
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const want = Math.min(targetTop(el), maxY);
      if (Math.abs(y - want) > 2) {
        // Instant, not smooth: a smooth scroll aimed at a moving target falls short.
        window.scrollTo({ top: want, behavior: 'instant' });
        prevY = want;
        settledAt = null;
      } else if (settledAt === null) {
        settledAt = Date.now();
      }
    }
    if (onSettled && settledAt !== null && pendingRequests() === 0 && Date.now() - settledAt > HASH_SETTLE_MS) {
      onSettled(el);
      onSettled = null;
    }
    if (Date.now() - started > maxMs) return stop();
    timer = setTimeout(tick, 100);
  };
  // With waitForMotion the first check comes after a smooth scroll has begun,
  // so it sees the motion and waits for it to finish.
  if (waitForMotion) timer = setTimeout(tick, 150);
  else tick();
  return stop;
}

function scrollToHref(href) {
  if (!href || href === '#' || href === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    const el = findElement(href);
    if (el) {
      window.scrollTo({ top: targetTop(el), behavior: 'smooth' });
      flashTarget(el);
    }
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brand, setBrand] = useState(navCache.brand);
  const [contentLoaded, setContentLoaded] = useState(navCache.brand !== null);
  const [navigation, setNavigation] = useState(navCache.navigation || DEFAULT_NAVIGATION);
  const [navLinks, setNavLinks] = useState(navCache.links || []);
  const [activeHref, setActiveHref] = useState('#');
  const preferredHrefRef = useRef(null); // last link picked; wins ties for "active"
  const clickLockRef = useRef(null); // { href, until } while a click's scroll runs
  const clickAlignStopRef = useRef(null); // stops the post-click landing correction
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
        const nextBrand = res.data.brand || {};
        const nextNavigation = { ...DEFAULT_NAVIGATION, ...(res.data.navigation || {}) };
        navCache.brand = nextBrand;
        navCache.navigation = nextNavigation;
        setBrand(nextBrand);
        setNavigation(nextNavigation);
      })
      .catch(() => {
        if (!navCache.brand) setBrand({ name: 'Hype My Region', logoUrl: '/images/hmr-logo-new.avif' });
      })
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
        const next = items.length ? items : fallbackNavLinks;
        navCache.links = next;
        setNavLinks(next);
      })
      .catch(() => {
        if (!navCache.links) setNavLinks(fallbackNavLinks);
      });
  }, []);

  // Arriving on the homepage from another page with "/#section". Each section
  // renders only once its own API data arrives, so the target can exist while
  // the sections above it are still empty — scrolling to it once lands near
  // the top of the page. Keep it aligned while the layout fills in, and stop
  // as soon as the user scrolls themselves.
  useEffect(() => {
    if (!isHome || !location.hash) return;
    const hash = location.hash;
    preferredHrefRef.current = hash;
    return keepAligned(() => findElement(hash), {
      maxMs: HASH_ALIGN_MAX_MS,
      onSettled: flashTarget,
    });
  }, [isHome, location.hash, location.key]);

  // Stop any in-flight alignment from an earlier click when leaving the page.
  useEffect(() => () => clickAlignStopRef.current?.(), []);

  // Active link tracking. The active link is the one whose target sits under
  // the navbar line. Several targets can share that line (service cards are
  // three to a row on desktop); then the link the user picked wins, otherwise
  // the first in menu order. (An IntersectionObserver used to do this and lit
  // whichever card entered its band last — often not the one clicked.)
  useEffect(() => {
    // Anchors only refer to homepage sections; elsewhere a fuzzy id match
    // would light up the wrong link.
    if (!isHome) return;
    const hrefs = navLinks.map((l) => l.href).filter(isAnchorHref);
    let frame = 0;

    // Layout positions, not getBoundingClientRect, so a card still mid
    // entrance animation counts where it is about to settle.
    const underLine = (href, line) => {
      const el = findElement(href);
      if (!el) return false;
      // Zero-height anchor spans stand for the section that contains them.
      const box = el.offsetHeight === 0 && el.parentElement ? el.parentElement : el;
      const top = layoutTop(el) - window.scrollY;
      const bottom = layoutTop(box) + box.offsetHeight - window.scrollY;
      return top <= line && bottom > line;
    };

    const compute = () => {
      frame = 0;
      const line = (document.querySelector('.navbar')?.offsetHeight || 65) + 20;
      const hits = hrefs.filter((href) => underLine(href, line));
      const atTop = window.scrollY < 50;

      // While a click's smooth scroll is travelling, keep the clicked link lit
      // instead of flashing every section passed on the way.
      const lock = clickLockRef.current;
      if (lock) {
        const reached = isHomeHref(lock.href) ? atTop : hits.includes(lock.href);
        if (reached || Date.now() > lock.until) clickLockRef.current = null;
        else return;
      }

      if (atTop) return setActiveHref('#');
      if (hits.includes(preferredHrefRef.current)) return setActiveHref(preferredHrefRef.current);
      // Targets can nest (Photography's "What we do" sits inside About): the
      // one starting nearest the line is the most specific. Ties keep menu order.
      const best = hits.reduce((pick, href) => {
        if (!pick) return href;
        return layoutTop(findElement(href)) > layoutTop(findElement(pick)) ? href : pick;
      }, null);
      setActiveHref(best || '');
    };

    const schedule = () => { if (!frame) frame = requestAnimationFrame(compute); };
    const release = () => { clickLockRef.current = null; };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, release, { passive: true }));
    // Sections fill in after load and move things without any scroll event.
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, release));
    };
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
    preferredHrefRef.current = href;
    if (!isHome) {
      navigate(resolveSiteHref(href, location.pathname));
      if (isHomeHref(href)) window.scrollTo({ top: 0 });
      return;
    }
    clickLockRef.current = { href, until: Date.now() + CLICK_LOCK_MS };
    setActiveHref(isHomeHref(href) ? '#' : href);
    clickAlignStopRef.current?.();
    clickAlignStopRef.current = null;
    requestAnimationFrame(() => {
      scrollToHref(href);
      // Lazy images above the target can load while the smooth scroll runs
      // and push it down; correct the landing once the scroll has finished.
      if (!isHomeHref(href)) {
        clickAlignStopRef.current = keepAligned(() => findElement(href), {
          maxMs: CLICK_ALIGN_MAX_MS,
          waitForMotion: true,
        });
      }
    });
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
