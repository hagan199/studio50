import useScrollAnimation from '../../hooks/useScrollAnimation';
import GradSectionHeader from './GradSectionHeader';
import { CameraIcon, CheckIcon, ClockIcon, SparkIcon } from './icons';

const list = (value) => (Array.isArray(value) ? value.filter((v) => String(v).trim()) : []);

export default function GraduationPackages({ packages }) {
  const ref = useScrollAnimation([packages]);
  const items = (packages?.items || []).filter((p) => p?.name);
  if (!items.length) return null;

  return (
    <section className="grad-section grad-packages" id="graduation-packages" ref={ref}>
      <div className="grad-container">
        <GradSectionHeader label={packages.label} heading={packages.heading} description={packages.description} />

        <div
          className={`grad-packages__grid grad-packages__grid--${Math.min(items.length, 3)}`}
          data-animate="stagger-children"
          data-stagger="0.12"
        >
          {items.map((pkg) => {
            const inclusions = list(pkg.inclusions);
            const benefits = list(pkg.benefits);
            return (
              <article key={pkg.id || pkg.name} className={`grad-package${pkg.featured ? ' is-featured' : ''}`}>
                {pkg.badge && <span className="grad-package__badge">{pkg.badge}</span>}
                <h3 className="grad-package__name">{pkg.name}</h3>
                {pkg.description && <p className="grad-package__desc">{pkg.description}</p>}

                {pkg.price && (
                  <div className="grad-package__price">
                    {packages.currency && <span className="grad-package__currency">{packages.currency}</span>}
                    <span className="grad-package__amount">{pkg.price}</span>
                    {pkg.priceNote && <span className="grad-package__note">{pkg.priceNote}</span>}
                  </div>
                )}

                {(pkg.photos || pkg.duration) && (
                  <div className="grad-package__stats">
                    {pkg.photos && (
                      <span className="grad-package__stat">
                        <CameraIcon /> {pkg.photos} edited photos
                      </span>
                    )}
                    {pkg.duration && (
                      <span className="grad-package__stat">
                        <ClockIcon /> {pkg.duration}
                      </span>
                    )}
                  </div>
                )}

                {inclusions.length > 0 && (
                  <ul className="grad-package__list">
                    {inclusions.map((text, i) => (
                      <li key={i}><CheckIcon /> {text}</li>
                    ))}
                  </ul>
                )}

                {benefits.length > 0 && (
                  <div className="grad-package__extras">
                    <span className="grad-package__extras-label">Also included</span>
                    <ul className="grad-package__list grad-package__list--extras">
                      {benefits.map((text, i) => (
                        <li key={i}><SparkIcon /> {text}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grad-package__cta-wrap">
                  <a href={pkg.ctaLink || '#contact'} className={`button grad-package__cta ${pkg.featured ? 'plain' : 'black'}`}>
                    <div className="clip">
                      <div className="clip-text-w"><div className="btn-text">{pkg.ctaText || 'Book now'}</div></div>
                      <div className="clip-text-w bottom" aria-hidden="true"><div className="btn-text">{pkg.ctaText || 'Book now'}</div></div>
                    </div>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
