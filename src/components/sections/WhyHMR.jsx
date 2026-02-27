import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './WhyHMR.css';

const checkIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABVUlEQVR4nN2UwU7DMAyGo6HtWVAFq//lQZhghVdijOv2BGg8EoOxKwiOg8OaVCoyDaysSZpFXCCS1ahNP9t/bAvxr1eZJL0CuFDAXAMLBbyzmf28GAzO+UwUXANnmmilgdJrRI8aOA2POssONHDdCkbDJqUQnZDIY+ClyWbcLkssHMbSdGiXJkl6QZrjpyngRQOzWhZL68VztcTA837/yGQ//XpfEGUNB4rodk/4ay7lMf+7kfJQET3Xvt3Y9H/4DbiubGHLYL1zaGb0dcrCT+sZonWbg6kNoALgTgcauPdI8BQgS70f7poZVPPGKUUeELn3knlw+fQOhZsMRmJ3lVJ2uUlcFbNpk2ULXzknLE9FV0OpkMgrBydWeM3JZN+O1lv4pRf+KZUQHQ1cRcDHQeP6O5M0HdruxAJetsrizEbKLg8uLjuubQW8sZk9vxvxmSj4n1kfTh/YRUvQ3PYAAAAASUVORK5CYII=";

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
                <img src={checkIcon} alt="Check" />
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
                <img src={checkIcon} alt="Check" />
                <h5 className="section-small-title">{item}</h5>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
