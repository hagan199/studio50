import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './Credibility.css';

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="check-icon-svg">
    <circle cx="10" cy="10" r="10" fill="#079133" opacity="0.15" />
    <path d="M6 10l3 3 5-6" stroke="#079133" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Credibility() {
  const [data, setData] = useState(null);
  const ref = useScrollAnimation([data]);

  useEffect(() => {
    api.get('/api/content').then((res) => setData(res.data.credibility)).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <section className="section-flex-long" ref={ref}>
      <div className="section-child-flex bg-home" data-animate="fade-left" data-duration="1.2">
        <div className="credibility-img-overlay" />
      </div>
      <div className="section-child-flex long">
        <h3 className="test-text" data-animate="fade-up">{data.title}</h3>
        <ul className="content-list-w" data-animate="stagger-children" data-stagger="0.1" data-delay="0.15">
          {data.items.map((item) => (
            <li key={item} className="content-list-item">
              <CheckIcon />
              <h5 className="section-small-title">{item}</h5>
            </li>
          ))}
        </ul>
        <p className="section-title small red" data-animate="fade-up" data-delay="0.3">
          {data.footerText}
        </p>
        <div className="button-w vert" data-animate="fade-up" data-delay="0.4">
          <a href={data.ctaLink} className="button cta">
            <div className="clip">
              <div className="clip-text-w">
                <div className="btn-text">{data.ctaText}</div>
              </div>
              <div className="clip-text-w bottom">
                <div className="btn-text">{data.ctaText}</div>
              </div>
            </div>
          </a>
          <a href={data.secondaryCtaLink} className="button plain">
            <div className="clip">
              <div className="clip-text-w">
                <div className="btn-text">{data.secondaryCtaText}</div>
              </div>
              <div className="clip-text-w bottom">
                <div className="btn-text">{data.secondaryCtaText}</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
