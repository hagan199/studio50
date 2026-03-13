import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './WhyHMR.css';

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="check-icon-svg">
    <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
    <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function WhyHMR() {
  const [data, setData] = useState(null);
  const ref = useScrollAnimation([data]);

  useEffect(() => {
    api.get('/api/content').then((res) => setData(res.data.whyHMR)).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <section className="scroll-div blue-dark" id="about" ref={ref}>
      <div className="section-flex">
        <div className="section-child-flex" data-animate="fade-right">
          <h3 className="test-text">{data.whyTitle}</h3>
          <p className="section-paragraph">
            {data.whyIntro}
          </p>
          <p className="section-paragraph">HMR exists to:</p>
          <ul className="content-list-w" data-animate="stagger-children" data-stagger="0.08" data-delay="0.2">
            {data.whyItems.map((item) => (
              <li key={item} className="content-list-item">
                <CheckIcon />
                <h5 className="section-small-title">{item}</h5>
              </li>
            ))}
          </ul>
        </div>
        <div className="div-line"></div>
        <div className="section-child-flex" data-animate="fade-left">
          <h3 className="test-text">{data.whatTitle}</h3>
          <p className="section-title small red">
            {data.whatIntro}
          </p>
          <ul className="content-list-w" data-animate="stagger-children" data-stagger="0.08" data-delay="0.2">
            {data.whatItems.map((item) => (
              <li key={item} className="content-list-item">
                <CheckIcon />
                <h5 className="section-small-title">{item}</h5>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
