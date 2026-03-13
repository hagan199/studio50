import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './AuditionProcess.css';

export default function AuditionProcess() {
  const [data, setData] = useState(null);
  const ref = useScrollAnimation([data]);

  useEffect(() => {
    api.get('/api/content').then((res) => setData(res.data.auditionProcess)).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <section className="ap-section" id="auditions" ref={ref}>
      <div className="ap-glow" aria-hidden="true" />

      <div className="ap-header" data-animate="fade-up">
        <span className="ap-eyebrow">The Process</span>
        <h2 className="ap-heading">{data.heading}</h2>
        <p className="ap-subheading">{data.subheading}</p>
      </div>

      <div className="ap-steps" data-animate="stagger-children" data-stagger="0.15">
        {data.steps.map((step, i) => (
          <div key={step.id} className="ap-step">
            <div className="ap-step-top">
              <div className="ap-num">{i + 1}</div>
              {i < data.steps.length - 1 && <div className="ap-connector" aria-hidden="true" />}
            </div>
            <div className="ap-card">
              <h3 className="ap-card-title">{step.title}</h3>
              <p className="ap-card-desc">{step.desc}</p>
              {step.linkLabel && step.linkHref && (
                <a href={step.linkHref} className="ap-card-link">
                  {step.linkLabel}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {(data.paymentNote || data.pwdNote) && (
        <div className="ap-note" data-animate="fade-up" data-delay="0.3">
          {data.paymentNote && (
            <p><strong>A. Payment Note: </strong>{data.paymentNote}</p>
          )}
          {data.pwdNote && (
            <p><strong>B. PWD Clarity: </strong>{data.pwdNote}</p>
          )}
        </div>
      )}
    </section>
  );
}
