import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../../utils/api';
import './ServicesSection.css';

gsap.registerPlugin(ScrollTrigger);

const ICONS = {
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  ),
  palette: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  broadcast: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
  ),
};

export default function ServicesSection() {
  const [services, setServices] = useState(null);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    api.get('/api/services').then((res) => setServices(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!services || !cardsRef.current) return;

    // Title animation
    gsap.from(titleRef.current, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 85%',
      },
    });

    // Staggered card reveal
    const cards = cardsRef.current.querySelectorAll('.service-card');
    gsap.from(cards, {
      y: 50,
      opacity: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: cardsRef.current,
        start: 'top 80%',
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [services]);

  const handleCardHover = (e, enter) => {
    gsap.to(e.currentTarget, {
      scale: enter ? 1.03 : 1,
      y: enter ? -8 : 0,
      duration: 0.35,
      ease: 'power2.out',
    });
    gsap.to(e.currentTarget.querySelector('.service-card__icon'), {
      scale: enter ? 1.15 : 1,
      rotation: enter ? 5 : 0,
      duration: 0.35,
      ease: 'power2.out',
    });
  };

  if (!services) return null;

  return (
    <section className="services" id="services" ref={sectionRef}>
      <div className="container">
        <div className="services__header" ref={titleRef}>
          <span className="services__label">What we Do</span>
          <h2 className="services__title">{services.sectionTitle}</h2>
        </div>

        <div className="services__grid" ref={cardsRef}>
          {services.items
            .sort((a, b) => a.order - b.order)
            .map((service) => (
              <div
                key={service.id}
                className="service-card"
                onMouseEnter={(e) => handleCardHover(e, true)}
                onMouseLeave={(e) => handleCardHover(e, false)}
              >
                {service.imageUrl && (
                  <div className="service-card__image">
                    <img src={service.imageUrl} alt={service.title} loading="lazy" />
                  </div>
                )}
                <div className="service-card__icon">
                  {ICONS[service.icon] || ICONS.camera}
                </div>
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__desc">{service.description}</p>
                <div className="service-card__number">
                  {String(service.order).padStart(2, '0')}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
