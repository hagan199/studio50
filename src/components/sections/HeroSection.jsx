import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import api from '../../utils/api';
import './HeroSection.css';

const DEFAULT_SLIDES = [
  '/images/frican-students-walking-outdoors.avif',
  '/images/band-playing-together.avif',
  '/images/audition-homepage-img.avif',
  '/images/performing-arts.avif',
];

export default function HeroSection() {
  const [content, setContent] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    api.get('/api/content').then((res) => setContent(res.data)).catch(() => {});
  }, []);

  const slides = content?.hero?.galleryImages?.length
    ? content.hero.galleryImages
    : content?.hero?.backgroundImageUrl
      ? [content.hero.backgroundImageUrl, ...DEFAULT_SLIDES.filter(s => s !== content.hero.backgroundImageUrl)]
      : DEFAULT_SLIDES;

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!content) return;
    intervalRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(intervalRef.current);
  }, [content, nextSlide]);

  const handleMouseEnter = () => clearInterval(intervalRef.current);
  const handleMouseLeave = () => {
    intervalRef.current = setInterval(nextSlide, 5000);
  };

  useEffect(() => {
    if (!content || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-label', {
        y: 30,
        opacity: 0,
        duration: 0.8,
      })
      .from('.hero-heading', {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
      }, '-=0.5')
      .from('.hero-divider', {
        scaleX: 0,
        opacity: 0,
        duration: 0.8,
      }, '-=0.6')
      .from('.section-paragraph', {
        y: 40,
        opacity: 0,
        duration: 0.9,
      }, '-=0.5')
      .from('.hero-buttons .button', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
      }, '-=0.4')
      .from('.hero-slide-nav', {
        y: 20,
        opacity: 0,
        duration: 0.6,
      }, '-=0.3');
    }, sectionRef);

    return () => ctx.revert();
  }, [content]);

  if (!content) {
    return (
      <section className="hero">
        <div className="hero__bg">
          <div className="skeleton-block dark" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, borderRadius: 0 }} />
        </div>
        <div className="hero__content">
          <div className="skeleton-block" style={{ width: 120, height: 28, marginBottom: 24, borderRadius: 50 }} />
          <div className="skeleton-block" style={{ width: '70%', height: '3.5rem', marginBottom: 16 }} />
          <div className="skeleton-block" style={{ width: '50%', height: '3.5rem', marginBottom: 24 }} />
          <div className="skeleton-block" style={{ width: '60%', height: '1rem', marginBottom: 10 }} />
          <div className="skeleton-block" style={{ width: '45%', height: '1rem', marginBottom: 40 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton-block" style={{ width: 160, height: 50, borderRadius: 8 }} />
            <div className="skeleton-block" style={{ width: 180, height: 50, borderRadius: 8 }} />
          </div>
        </div>
      </section>
    );
  }

  const { hero, brand } = content;

  return (
    <section
      className="hero"
      ref={sectionRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Full-screen background slider */}
      <div className="hero__bg">
        {slides.map((src, i) => (
          <div
            key={src}
            className={`hero__slide ${i === currentSlide ? 'active' : ''}`}
          >
            <img
              src={src}
              alt={`${brand.name} slide ${i + 1}`}
              className="hero__slide-img"
            />
          </div>
        ))}
        <div className="hero__overlay" />
      </div>

      {/* Content + Slide nav in aligned container */}
      <div className="hero__inner">
        <div className="hero__content">
          <span className="hero-label">{brand.shortName || 'Studio 50'}</span>
          <h1 className="hero-heading">{hero.headline}</h1>
          <div className="hero-divider" />
          <p className="section-paragraph">{hero.subheadline}</p>

          <div className="hero-buttons">
            <a href={hero.ctaLink || '#auditions'} className="button hero-btn primary">
              <span>{hero.ctaText || 'Apply to Audition'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="#services" className="button hero-btn secondary">
              <span>Our Services</span>
            </a>
          </div>
        </div>

        {/* Slide navigation */}
        <div className="hero-slide-nav">
        <div className="hero-slide-counter">
          <span className="hero-slide-current">{String(currentSlide + 1).padStart(2, '0')}</span>
          <span className="hero-slide-sep">/</span>
          <span className="hero-slide-total">{String(slides.length).padStart(2, '0')}</span>
        </div>
        <div className="hero-slide-bars">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-bar ${i === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
      </div>

    </section>
  );
}
