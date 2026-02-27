import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './LatestContent.css';

export default function LatestContent() {
  const [data, setData] = useState(null);
  const ref = useScrollAnimation([data]);

  useEffect(() => {
    api.get('/api/content').then((res) => setData(res.data.latestContent)).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <section className="section latest-content" id="programs" ref={ref}>
      <div className="short-container">
        <h2 className="section-heading black" data-animate="fade-up">{data.heading}</h2>
      </div>
      <div className="video-grid" data-animate="stagger-children" data-stagger="0.18">
        {data.items.map((item) => (
          <div key={item.id} className={`bg-video-w${item.wide ? ' wide' : ''}`}>
            {item.type === 'video' ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="bg-video"
                poster={item.poster || undefined}
              >
                {item.videoMp4 && <source src={item.videoMp4} type="video/mp4" />}
                {item.videoWebm && <source src={item.videoWebm} type="video/webm" />}
              </video>
            ) : (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="video-thumbnail"
              />
            )}
            <div className="overlay">
              <h3 className="section-title small white">{item.title}</h3>
              {item.subtitle && <h4 className="section-small-title small white">{item.subtitle}</h4>}
              {item.tag && (
                <div className="tag">
                  <div className="tag-text">{item.tag}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
