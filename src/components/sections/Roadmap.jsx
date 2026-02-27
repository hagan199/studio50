import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './Roadmap.css';

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
      <div className="short-container roadmap-content">
        <h2 className="section-heading" data-animate="fade-up">{data.heading}</h2>
        <p className="section-title small white" data-animate="fade-up" data-delay="0.1">
          {data.subheading}
        </p>
        <div className="roadmap-grid" data-animate="stagger-children" data-stagger="0.2" data-delay="0.2">
          {data.stages.map((stage, idx) => (
            <a
              key={stage.id || idx}
              href="#"
              className="link-blur-w"
              onMouseEnter={() => setActiveStage(idx)}
              onMouseLeave={() => setActiveStage(null)}
              onClick={(e) => e.preventDefault()}
            >
              <div className="no-w red">
                <h4 className="section-small-title white">{idx + 1}</h4>
              </div>
              <h3 className="section-title small white">{stage.title}</h3>
              <p className={`stage-desc ${activeStage === idx ? 'show' : ''}`}>
                {stage.desc}
              </p>
            </a>
          ))}
        </div>
        <div className="note-box" data-animate="blur-in" data-delay="0.4">
          <h4 className="section-small-title">
            "{data.quote}"
          </h4>
        </div>
      </div>
    </section>
  );
}
