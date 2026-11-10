import useScrollAnimation from '../../hooks/useScrollAnimation';
import GradSectionHeader from './GradSectionHeader';

// Service icons — one per service type, with a sensible fallback
const ServiceIcons = {
  studio: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  group: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  frame: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <rect x="7" y="7" width="10" height="10" rx="1" ry="1"/>
    </svg>
  ),
  reel: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
      <line x1="7" y1="2" x2="7" y2="22"/>
      <line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="17" x2="22" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/>
    </svg>
  ),
};

// Map service index (0-3) to icon key
const ICON_KEYS = ['studio', 'group', 'frame', 'reel'];

export default function GraduationAdditionalServices({ additionalServices }) {
  const ref = useScrollAnimation([additionalServices]);

  if (!additionalServices?.visible) return null;

  const items = (additionalServices.items || []).filter((s) => s?.name && s.enabled !== false);

  return (
    <section className="grad-section grad-additional-services" id="graduation-additional-services" ref={ref}>
      <div className="grad-container">
        <GradSectionHeader
          label={additionalServices.label}
          heading={additionalServices.heading}
        />

        {additionalServices.intro && (
          <p className="grad-add-services__intro" data-animate="fade-up" data-delay="0.1">
            {additionalServices.intro}
          </p>
        )}

        {items.length > 0 && (
          <div
            className="grad-add-services__grid"
            data-animate="stagger-children"
            data-stagger="0.1"
          >
            {items.map((svc, i) => {
              const iconKey = ICON_KEYS[i % ICON_KEYS.length];
              return (
                <article key={svc.id || svc.name} className="grad-add-services__card">
                  {svc.image ? (
                    <div className="grad-add-services__img-wrap">
                      <img src={svc.image} alt={svc.name} className="grad-add-services__img" loading="lazy" />
                    </div>
                  ) : (
                    <div className="grad-add-services__icon">
                      {ServiceIcons[iconKey]}
                    </div>
                  )}
                  <h3 className="grad-add-services__name">{svc.name}</h3>
                  {svc.description && (
                    <p className="grad-add-services__desc">{svc.description}</p>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {(additionalServices.closing || additionalServices.ctaText) && (
          <div className="grad-add-services__footer" data-animate="fade-up" data-delay="0.2">
            {additionalServices.closing && (
              <p className="grad-add-services__closing">{additionalServices.closing}</p>
            )}
            {additionalServices.ctaText && (
              <div className="grad-add-services__cta-wrap">
                <a
                  href={additionalServices.ctaLink || '#contact'}
                  className="button black grad-add-services__cta"
                >
                  <div className="clip">
                    <div className="clip-text-w"><div className="btn-text">{additionalServices.ctaText}</div></div>
                    <div className="clip-text-w bottom" aria-hidden="true"><div className="btn-text">{additionalServices.ctaText}</div></div>
                  </div>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
