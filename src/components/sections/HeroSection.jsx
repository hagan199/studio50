import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import api from '../../utils/api';
import './HeroSection.css';

export default function HeroSection() {
  const [content, setContent] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    api.get('/api/content').then((res) => setContent(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!content || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-bg-image', {
        scale: 1.15,
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

  if (!content) return null;

  const { hero, brand } = content;

  return (
    <section className="hero-track" ref={sectionRef}>
      <div className="hero-img-w" id="img-culture">
        <img
          src={hero.backgroundImageUrl || '/images/frican-students-walking-outdoors.avif'}
          alt={brand.name}
          className="hero-bg-image"
        />
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
          <a href="#programs" className="button cta">
            <div className="clip">
              <div className="clip-text-w">
                <div className="btn-text">View Program Structure</div>
              </div>
              <div className="clip-text-w bottom">
                <div className="btn-text">View Program Structure</div>
              </div>
            </div>
          </a>
          <a href="#awards" className="button cta">
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
