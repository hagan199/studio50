import { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import { prefersReducedMotion } from '../../utils/motion';
import { serviceAnchorId } from '../../utils/links';
import './MarqueeSection.css';

// Ids the homepage sections already use; a service with one of these names
// must not add a second element with the same id.
const SECTION_IDS = new Set(['services', 'awards', 'about', 'auditions', 'programs', 'contact', 'main', 'root']);

export default function MarqueeSection() {
  const [data, setData] = useState(null);
  const [serviceAnchors, setServiceAnchors] = useState([]);
  const marqueeRef = useRef(null);
  const animRef = useScrollAnimation([data]);

  useEffect(() => {
    api.get('/api/content').then((res) => {
      setData(res.data.marquee);
      // Menu links such as #photography were generated for the services grid.
      // While that grid is switched off (the default — see HomePage), this
      // block is the services section, so it carries those anchors instead.
      // When the grid is on it owns the ids, and duplicates would steal them.
      const gridShown = res.data.sections?.find((s) => s.id === 'services')?.visible === true;
      if (gridShown) return;
      api.get('/api/services').then((svc) => {
        const ids = (svc.data?.items || []).map((item) => serviceAnchorId(item.title)).filter(Boolean);
        setServiceAnchors([...new Set(ids)].filter((id) => !SECTION_IDS.has(id)));
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el || !data) return;
    // Endless horizontal motion is exactly what reduced-motion users opt out of.
    if (prefersReducedMotion()) {
      el.style.transform = 'translateX(0)';
      return;
    }
    let animId;
    let pos = 0;
    const speed = 0.5;
    const animate = () => {
      pos -= speed;
      const firstChild = el.querySelector('.marquee-child-content');
      if (firstChild && Math.abs(pos) >= firstChild.scrollWidth) {
        pos = 0;
      }
      el.style.transform = `translateX(${pos}px)`;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [data]);

  if (!data) return null;

  const renderItems = () =>
    data.categories.map((cat, i) => (
      <div key={cat.id || i} className={`marque-img-grid${cat.alt ? ' alt' : ''}`}>
        <img src={cat.imageUrl} loading="lazy" alt={cat.label} className="marquee-img" />
        <p className="section-title alt">{cat.label}</p>
      </div>
    ));

  return (
    <section className="scroll-div gray" id="services" ref={animRef}>
      {/* Keeps older #awards links working now that this is the services block */}
      <span id="awards" aria-hidden="true" />
      {serviceAnchors.map((id) => <span key={id} id={id} aria-hidden="true" />)}
      <div className="short-container">
        <h2 className="section-heading dark" data-animate="fade-up">{data.heading}</h2>
        <p className="section-title small dark" data-animate="fade-up" data-delay="0.1">
          {data.subheading}
        </p>
      </div>
      <div className="marqee-block" data-animate="scale-in" data-delay="0.2">
        <div className="marque-flex-parent" ref={marqueeRef}>
          <div className="marquee-child-content">{renderItems()}</div>
          <div className="marquee-child-content">{renderItems()}</div>
        </div>
      </div>
      <div className="bg-overlay-marquee"></div>
      <div className="short-container">
        <p className="section-title colored" data-animate="fade-up" data-delay="0.15">
          {data.footerNote}
        </p>
      </div>
    </section>
  );
}
