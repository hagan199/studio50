import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './Credibility.css';

const checkIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABVUlEQVR4nN2UwU7DMAyGo6HtWVAFq//lQZhghVdijOv2BGg8EoOxKwiOg8OaVCoyDaysSZpFXCCS1ahNP9t/bAvxr1eZJL0CuFDAXAMLBbyzmf28GAzO+UwUXANnmmilgdJrRI8aOA2POssONHDdCkbDJqUQnZDIY+ClyWbcLkssHMbSdGiXJkl6QZrjpyngRQOzWhZL68VztcTA837/yGQ//XpfEGUNB4rodk/4ay7lMf+7kfJQET3Xvt3Y9H/4DbiubGHLYL1zaGb0dcrCT+sZonWbg6kNoALgTgcauPdI8BQgS70f7poZVPPGKUUeELn3knlw+fQOhZsMRmJ3lVJ2uUlcFbNpk2ULXzknLE9FV0OpkMgrBydWeM3JZN+O1lv4pRf+KZUQHQ1cRcDHQeP6O5M0HdruxAJetsrizEbKLg8uLjuubQW8sZk9vxvxmSj4n1kfTh/YRUvQ3PYAAAAASUVORK5CYII=";

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
              <img src={checkIcon} alt="Check" />
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
