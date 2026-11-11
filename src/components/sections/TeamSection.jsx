import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './TeamSection.css';

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default function TeamSection() {
  const [data, setData] = useState(null);
  const ref = useScrollAnimation([data]);

  useEffect(() => {
    api.get('/api/team').then((res) => setData(res.data)).catch(() => setData({ members: [] }));
  }, []);

  const members = data?.members || [];
  // Keep the #team anchor in the page while loading so "Our Team" links from
  // other pages can land here once the section fills in.
  if (!data) return <section className="team-section team-section--loading" id="team" aria-hidden="true" />;
  if (data.section?.visible === false || !members.length) return null;

  const { label, heading, description, ctaText } = data.section || {};

  return (
    <section className="team-section" id="team" ref={ref}>
      <div className="team-section__container">
        <header className="team-section__header">
          <div data-animate="fade-up">
            {label && <span className="team-section__label">{label}</span>}
            <h2 className="team-section__title">{heading || 'Our Team'}</h2>
          </div>
          {description && <p className="team-section__desc" data-animate="fade-up" data-delay="0.1">{description}</p>}
        </header>

        <div className="team-section__grid" data-animate="stagger-children" data-stagger="0.12">
          {members.map((m, i) => (
            <Link key={m.id} to={`/team/${m.slug}`} className="team-card" aria-label={`${m.name}${m.position ? `, ${m.position}` : ''} — view portfolio`}>
              <div className="team-card__media">
                {m.photo ? (
                  <img src={m.photo} alt="" loading="lazy" decoding="async" className="team-card__img" />
                ) : (
                  <span className="team-card__initials" aria-hidden="true">{initials(m.name)}</span>
                )}
                <span className="team-card__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="team-card__shade" aria-hidden="true" />
                <div className="team-card__reveal">
                  {m.shortIntro && <p className="team-card__intro">{m.shortIntro}</p>}
                  <span className="team-card__cta">{ctaText || 'View Portfolio'} <ArrowRight /></span>
                </div>
              </div>
              <div className="team-card__body">
                <h3 className="team-card__name">{m.name}</h3>
                {m.position && <span className="team-card__position">{m.position}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
