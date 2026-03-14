import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './Roadmap.css';

const STAGE_ICONS = [
  // Microphone
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  // Stage / theater
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  // Trophy
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
];

export default function Roadmap() {
  const [data, setData] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const ref = useScrollAnimation([data]);

  useEffect(() => {
    api.get('/api/content').then((res) => setData(res.data.roadmap)).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <section className="section pro" ref={ref}>
      <div className="roadmap-images">
        {data.stages.map((stage, idx) => (
          <img
            key={stage.id || idx}
            src={stage.imageUrl}
            alt={stage.title}
            className={`large-bg-image ${activeStage === idx ? 'visible' : ''}`}
          />
        ))}
      </div>

      <div className="roadmap-glow roadmap-glow--left" />
      <div className="roadmap-glow roadmap-glow--right" />

      <div className="short-container roadmap-content">
        <div className="roadmap-label" data-animate="fade-up">ROADMAP</div>
        <h2 className="section-heading" data-animate="fade-up">{data.heading}</h2>
        <p className="section-title small white" data-animate="fade-up" data-delay="0.1">
          {data.subheading}
        </p>

        <div className="roadmap-timeline" data-animate="stagger-children" data-stagger="0.2" data-delay="0.2">
          <div className="timeline-line" />
          {data.stages.map((stage, idx) => (
            <a
              key={stage.id || idx}
              href="#"
              className={`roadmap-card ${activeStage === idx ? 'active' : ''}`}
              onMouseEnter={() => setActiveStage(idx)}
              onMouseLeave={() => setActiveStage(null)}
              onClick={(e) => e.preventDefault()}
            >
              <div className="roadmap-card-inner">
                <div className="roadmap-step-badge">
                  <span className="roadmap-step-num">{String(idx + 1).padStart(2, '0')}</span>
                </div>
                <div className="roadmap-icon">
                  {STAGE_ICONS[idx] || STAGE_ICONS[0]}
                </div>
                <h3 className="roadmap-card-title">{stage.title}</h3>
                <p className="roadmap-card-desc">{stage.desc}</p>
                <div className="roadmap-card-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>

              {idx < data.stages.length - 1 && (
                <div className="roadmap-connector">
                  <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                    <path d="M0 12h30l-6-6M30 12l-6 6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </a>
          ))}
        </div>

        <div className="roadmap-quote" data-animate="blur-in" data-delay="0.4">
          <div className="roadmap-quote-mark">&ldquo;</div>
          <h4 className="roadmap-quote-text">
            {data.quote}
          </h4>
          <div className="roadmap-quote-mark">&rdquo;</div>
        </div>
      </div>
    </section>
  );
}
