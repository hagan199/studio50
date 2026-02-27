import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './CTASection.css';

export default function CTASection() {
  const [data, setData] = useState(null);
  const ref = useScrollAnimation([data]);

  useEffect(() => {
    api.get('/api/content').then((res) => setData(res.data.cta)).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <section className="section cta-section" ref={ref}>
      <div className="short-container">
        <h2 className="hero-heading black center" data-animate="fade-up">{data.heading}</h2>
        <h4 className="section-title small black cta-subtitle" data-animate="fade-up" data-delay="0.15">
          {data.subtitle}
        </h4>
      </div>
      <a href={data.buttonLink} className="button plain" data-animate="scale-in" data-delay="0.3">
        <div className="clip">
          <div className="clip-text-w">
            <div className="btn-text">{data.buttonText}</div>
          </div>
          <div className="clip-text-w bottom">
            <div className="btn-text">{data.buttonText}</div>
          </div>
        </div>
      </a>
    </section>
  );
}
