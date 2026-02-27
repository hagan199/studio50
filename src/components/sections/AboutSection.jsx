import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../../utils/api';
import './AboutSection.css';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const [content, setContent] = useState(null);
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    api.get('/api/content').then((res) => setContent(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!content || !sectionRef.current) return;

    gsap.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: titleRef.current, start: 'top 85%' },
    });

    gsap.from(textRef.current, {
      y: 40,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: textRef.current, start: 'top 85%' },
    });

    if (imageRef.current) {
      gsap.from(imageRef.current, {
        x: 80,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: imageRef.current, start: 'top 80%' },
      });

      gsap.to(imageRef.current.querySelector('img'), {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [content]);

  if (!content) return null;

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="container about__inner">
        <div className="about__text">
          <div ref={titleRef}>
            <span className="about__label">{content.about.sectionTitle}</span>
            <h2 className="about__title">{content.about.sectionSubtitle}</h2>
          </div>
          <div ref={textRef}>
            <p className="about__desc">{content.about.text}</p>
            <div className="about__stats">
              <div className="about__stat">
                <span className="about__stat-number">50+</span>
                <span className="about__stat-label">Projects Delivered</span>
              </div>
              <div className="about__stat">
                <span className="about__stat-number">6</span>
                <span className="about__stat-label">Core Services</span>
              </div>
              <div className="about__stat">
                <span className="about__stat-number">100%</span>
                <span className="about__stat-label">Client Satisfaction</span>
              </div>
            </div>
          </div>
        </div>

        <div className="about__image" ref={imageRef}>
          {content.about.imageUrl ? (
            <img src={content.about.imageUrl} alt="About Studio 50" loading="lazy" />
          ) : (
            <div className="about__image-placeholder">
              <div className="about__image-gradient" />
              <span className="about__image-logo">{content.brand.shortName}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
