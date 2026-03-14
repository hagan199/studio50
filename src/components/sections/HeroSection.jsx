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

  // Auto-advance slides
  useEffect(() => {
    if (!content) return;
    intervalRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(intervalRef.current);
  }, [content, nextSlide]);

  // Pause on hover
  const handleMouseEnter = () => clearInterval(intervalRef.current);
  const handleMouseLeave = () => {
    intervalRef.current = setInterval(nextSlide, 5000);
  };

  useEffect(() => {
    if (!content || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-slider', {
        scale: 1.05,
        opacity: 0,
        duration: 1.6,
        ease: 'power2.out',
      })
      .from('.hero-heading', {
        y: 80,
        opacity: 0,
        duration: 1.1,
        ease: 'power4.out',
      }, '-=0.9')
      .from('.section-paragraph', {
        y: 40,
        opacity: 0,
        duration: 0.9,
      }, '-=0.6')
      .from('.button-w .button', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
      }, '-=0.5');
    }, sectionRef);

    return () => ctx.revert();
  }, [content]);

  if (!content) {
    return (
      <section className="hero-track">
        <div className="hero-img-w">
          <div className="skeleton-block dark" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, borderRadius: 0 }} />
        </div>
        <div className="hero-sticky">
          <div className="skeleton-block dark" style={{ width: '80%', height: '3.5rem', marginBottom: 20 }} />
          <div className="skeleton-block dark" style={{ width: '60%', height: '1rem', marginBottom: 10 }} />
          <div className="skeleton-block dark" style={{ width: '50%', height: '1rem', marginBottom: 30 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="skeleton-block dark" style={{ width: 160, height: 48 }} />
            <div className="skeleton-block dark" style={{ width: 160, height: 48 }} />
          </div>
        </div>
      </section>
    );
  }

  const { hero, brand } = content;

  return (
    <section className="hero-track" ref={sectionRef}>
      <div
        className="hero-img-w"
        id="img-culture"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="hero-slider">
          {slides.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${brand.name} slide ${i + 1}`}
              className={`hero-slide-image ${i === currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>
        <div className="hero-img-overlay" />
        <div className="hero-slide-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="hero-sticky">
        <h1 className="hero-heading">
          {hero.headline}
        </h1>
        <p className="section-paragraph">
          {hero.subheadline}
        </p>
        <div className="button-w">
          <a href={hero.ctaLink || '#auditions'} className="button cta">
            <div className="clip">
              <div className="clip-text-w">
                <div className="btn-text">{hero.ctaText || 'Apply to Audition'}</div>
              </div>
              <div className="clip-text-w bottom">
                <div className="btn-text">{hero.ctaText || 'Apply to Audition'}</div>
              </div>
            </div>
          </a>
          <a href="#programs" className="button outline">
            <div className="clip">
              <div className="clip-text-w">
                <div className="btn-text">View Program Structure</div>
              </div>
              <div className="clip-text-w bottom">
                <div className="btn-text">View Program Structure</div>
              </div>
            </div>
          </a>
          <a href="#awards" className="button outline">
            <div className="clip">
              <div className="clip-text-w">
                <div className="btn-text">Partner With Us</div>
              </div>
              <div className="clip-text-w bottom">
                <div className="btn-text">Partner With Us</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
