import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/layout/Navbar';
import BackToTop from '../components/ui/BackToTop';
import ContactSection from '../components/sections/ContactSection';
import Lightbox from '../components/graduation/Lightbox';
import VideoModal from '../components/ui/VideoModal';
import { ExpandIcon, PlayIcon } from '../components/graduation/icons';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { galleryImages, isPlayableUrl, projectCover, safeHref, videoThumbSrc } from '../utils/media';
import '../components/team/TeamMember.css';

const ALL = '__all__';
const SITE_TITLE = 'studio50';

const ArrowIcon = ({ dir = 'right' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={dir === 'left' ? { transform: 'rotate(180deg)' } : undefined}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const paragraphs = (text = '') => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/** Readable name for a social/professional link when no label was given. */
function linkLabel(link) {
  if (link.label) return link.label;
  try {
    const host = new URL(safeHref(link.url)).hostname.replace(/^www\./, '');
    return host.split('.')[0].replace(/^\w/, (c) => c.toUpperCase());
  } catch {
    return link.url;
  }
}

function ProjectCard({ project, index, onOpen }) {
  const images = galleryImages(project);
  const isVideo = project.type === 'video';
  const cover = projectCover(project);
  return (
    <button
      type="button"
      className={`tm-work${index % 5 === 0 ? ' is-feature' : ''}`}
      onClick={onOpen}
      aria-label={`${isVideo ? 'Play' : 'Open'} ${project.title || 'project'}`}
    >
      <span className="tm-work__media">
        {cover ? (
          <img src={cover} alt="" loading="lazy" decoding="async" />
        ) : isVideo ? (
          <video src={videoThumbSrc(project.videoUrl)} muted playsInline preload="metadata" aria-hidden="true" tabIndex={-1} />
        ) : null}
        <span className="tm-work__shade" aria-hidden="true" />
        <span className="tm-work__icon" aria-hidden="true">{isVideo ? <PlayIcon width={20} height={20} /> : <ExpandIcon />}</span>
        {!isVideo && images.length > 1 && <span className="tm-work__count">{images.length} photos</span>}
      </span>
      <span className="tm-work__info">
        {project.category && <span className="tm-work__cat">{project.category}</span>}
        {project.title && <span className="tm-work__title">{project.title}</span>}
        {project.description && <span className="tm-work__desc">{project.description}</span>}
      </span>
    </button>
  );
}

export default function TeamMemberPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get('preview') === '1';
  const [state, setState] = useState({ status: 'loading', member: null });
  const [filter, setFilter] = useState(ALL);
  const [gallery, setGallery] = useState(null);
  const [video, setVideo] = useState(null);
  const ref = useScrollAnimation([state.member, filter]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setFilter(ALL);
    setState({ status: 'loading', member: null });
    api.get(`/api/team/${encodeURIComponent(slug)}`, { params: preview ? { preview: 1 } : undefined })
      .then((res) => setState({ status: 'ready', member: res.data.member }))
      .catch((err) => setState({ status: err.response?.status === 404 ? 'missing' : 'error', member: null }));
  }, [slug, preview]);

  const member = state.member;

  useEffect(() => {
    if (!member?.name) return undefined;
    document.title = `${member.name} — ${SITE_TITLE}`;
    return () => { document.title = SITE_TITLE; };
  }, [member?.name]);

  // Projects a visitor can actually open.
  const projects = useMemo(() => (member?.projects || []).filter((p) =>
    p.type === 'video' ? isPlayableUrl(p.videoUrl) : galleryImages(p).length > 0
  ), [member]);
  const categories = useMemo(() => [...new Set(projects.map((p) => p.category).filter(Boolean))], [projects]);
  const visible = filter === ALL ? projects : projects.filter((p) => p.category === filter);

  const openProject = (project) => {
    if (project.type === 'video') {
      setVideo({ src: project.videoUrl, poster: project.poster, title: project.title, description: project.description });
    } else {
      setGallery({
        index: 0,
        items: galleryImages(project).map((img) => ({ url: img.url, title: project.title, caption: img.caption || project.description || '' })),
      });
    }
  };

  if (state.status !== 'ready') {
    return (
      <div className="tm-page">
        <Navbar />
        <main id="main" className="tm-state">
          {state.status === 'loading' ? (
            <span className="tm-state__spinner" aria-label="Loading profile" />
          ) : (
            <div className="tm-state__box">
              <h1>{state.status === 'missing' ? 'Profile not found' : 'Something went wrong'}</h1>
              <p>{state.status === 'missing' ? 'This team member’s portfolio is not available.' : 'We couldn’t load this portfolio. Please try again shortly.'}</p>
              <Link to="/#team" className="tm-btn tm-btn--light"><ArrowIcon dir="left" /> Meet the team</Link>
            </div>
          )}
        </main>
        <ContactSection />
      </div>
    );
  }

  const firstName = member.name.split(/\s+/)[0];
  const enquiryHref = safeHref(member.enquiryLink) || (member.email ? `mailto:${member.email}` : '/#contact');
  const enquiryExternal = /^https?:/i.test(enquiryHref);
  const links = (member.links || []).map((l) => ({ ...l, href: safeHref(l.url) })).filter((l) => l.href);
  const bio = paragraphs(member.bio);

  return (
    <div className="tm-page" ref={ref}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />

      {preview && (
        <div className="tm-preview-bar" role="status">
          Preview mode{member.published === false ? ' — this profile is not published yet' : ''}. Unpublished projects are included.
        </div>
      )}

      <main id="main">
        {/* ── Hero ── */}
        <section className="tm-hero">
          {member.coverImage && <div className="tm-hero__bg" style={{ backgroundImage: `url("${member.coverImage}")` }} aria-hidden="true" />}
          <div className="tm-container tm-hero__grid">
            <div className="tm-hero__text">
              <Link to="/#team" className="tm-back"><ArrowIcon dir="left" /> Our Team</Link>
              {member.position && <span className="tm-hero__position" data-animate="fade-up">{member.position}</span>}
              <h1 className="tm-hero__name" data-animate="fade-up" data-delay="0.05">{member.name}</h1>
              {member.intro && <p className="tm-hero__intro" data-animate="fade-up" data-delay="0.12">{member.intro}</p>}
              {member.shortIntro && <p className="tm-hero__short" data-animate="fade-up" data-delay="0.18">{member.shortIntro}</p>}
              <div className="tm-hero__actions" data-animate="fade-up" data-delay="0.24">
                {projects.length > 0 && (
                  <a href="#work" className="tm-btn tm-btn--light" onClick={(e) => { e.preventDefault(); document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    View work <ArrowIcon />
                  </a>
                )}
                <a href={enquiryHref} className="tm-btn tm-btn--ghost" {...(enquiryExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {member.enquiryText || `Work with ${firstName}`}
                </a>
              </div>
            </div>
            <div className="tm-hero__portrait" data-animate="fade-left">
              <div className="tm-hero__frame">
                {member.photo ? <img src={member.photo} alt={member.name} decoding="async" /> : <span className="tm-hero__initial">{firstName[0]}</span>}
              </div>
              {projects.length > 0 && (
                <span className="tm-hero__stat"><strong>{String(projects.length).padStart(2, '0')}</strong> selected works</span>
              )}
            </div>
          </div>
        </section>

        {/* ── About ── */}
        {(bio.length > 0 || member.skills?.length > 0) && (
          <section className="tm-section tm-about">
            <div className="tm-container tm-about__grid">
              <div className="tm-about__side" data-animate="fade-up">
                <span className="tm-eyebrow">About</span>
                <h2 className="tm-section__title">Meet {firstName}</h2>
              </div>
              <div className="tm-about__body">
                {bio.map((p, i) => <p key={i} data-animate="fade-up" data-delay={Math.min(i, 4) * 0.06}>{p}</p>)}
                {member.skills?.length > 0 && (
                  <div className="tm-skills" data-animate="fade-up">
                    <h3 className="tm-skills__title">Expertise</h3>
                    <ul className="tm-skills__list">
                      {member.skills.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Selected works ── */}
        {projects.length > 0 && (
          <section className="tm-section tm-works" id="work">
            <div className="tm-container">
              <div className="tm-works__head" data-animate="fade-up">
                <div>
                  <span className="tm-eyebrow">Portfolio</span>
                  <h2 className="tm-section__title">Selected Works</h2>
                </div>
                {categories.length > 1 && (
                  <div className="tm-filters" role="group" aria-label="Filter projects by category">
                    {[ALL, ...categories].map((c) => (
                      <button key={c} type="button" className={`tm-filter${filter === c ? ' is-active' : ''}`} aria-pressed={filter === c} onClick={() => setFilter(c)}>
                        {c === ALL ? 'All' : c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="tm-works__grid" key={filter}>
                {visible.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} onOpen={() => openProject(project)} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Connect / enquiry ── */}
        <section className="tm-section tm-connect">
          <div className="tm-container tm-connect__inner" data-animate="fade-up">
            <span className="tm-eyebrow">Let’s collaborate</span>
            <h2 className="tm-connect__title">Have a project in mind for {firstName}?</h2>
            <a href={enquiryHref} className="tm-btn tm-btn--dark" {...(enquiryExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {member.enquiryText || `Work with ${firstName}`} <ArrowIcon />
            </a>
            {(links.length > 0 || member.email) && (
              <ul className="tm-links">
                {member.email && <li><a href={`mailto:${member.email}`}>{member.email}</a></li>}
                {links.map((l) => (
                  <li key={l.href}><a href={l.href} target="_blank" rel="noopener noreferrer">{linkLabel(l)} <span aria-hidden="true">↗</span></a></li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <ContactSection />
      <BackToTop />

      <Lightbox
        items={gallery?.items || []}
        index={gallery ? gallery.index : null}
        onChange={(index) => setGallery((g) => ({ ...g, index }))}
        onClose={() => setGallery(null)}
      />
      <VideoModal video={video} onClose={() => setVideo(null)} />
    </div>
  );
}
