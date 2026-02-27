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
    <section className="scroll-div white" id="auditions" ref={ref}>
      <div className="short-container">
        <h2 className="section-heading black" data-animate="fade-up">{data.heading}</h2>
        <p className="section-title small black" data-animate="fade-up" data-delay="0.1">
          {data.subheading}
        </p>
      </div>
      <div className="section-grid-w _4-1" data-animate="stagger-children" data-stagger="0.15">
        {data.steps.map((step, i) => (
          <div key={step.id} className="award-small-w">
            <div className="no-w">
              <h4 className="section-small-title">{i + 1}</h4>
            </div>
            <h3 className="section-title black">{step.title}</h3>
            <h4 className="section-small-title small black">{step.desc}</h4>
            {step.linkLabel && step.linkHref && (
              <a href={step.linkHref} className="button plain">
                <div className="clip">
                  <div className="clip-text-w">
                    <div className="btn-text">{step.linkLabel}</div>
                  </div>
                  <div className="clip-text-w bottom">
                    <div className="btn-text">{step.linkLabel}</div>
                  </div>
                </div>
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="short-container" data-animate="fade-up" data-delay="0.3">
        <p className="section-title small black">
          <strong>A. Payment Note: </strong>{data.paymentNote}
          <br /><br />
          <strong>B. PWD Clarity: </strong>{data.pwdNote}
        </p>
      </div>
    </section>
  );
}
