import { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './MarqueeSection.css';

export default function MarqueeSection() {
  const [data, setData] = useState(null);
  const marqueeRef = useRef(null);
  const animRef = useScrollAnimation([data]);

  useEffect(() => {
    api.get('/api/content').then((res) => setData(res.data.marquee)).catch(() => {});
  }, []);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el || !data) return;
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
    <section className="scroll-div gray" id="awards" ref={animRef}>
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
