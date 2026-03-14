import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/sections/HeroSection';
import AuditionProcess from '../components/sections/AuditionProcess';
import WhyHMR from '../components/sections/WhyHMR';
import LatestContent from '../components/sections/LatestContent';
import Credibility from '../components/sections/Credibility';
import MarqueeSection from '../components/sections/MarqueeSection';
import Roadmap from '../components/sections/Roadmap';
import ServicesSection from '../components/sections/ServicesSection';
import CTASection from '../components/sections/CTASection';
import ContactSection from '../components/sections/ContactSection';
import Footer from '../components/layout/Footer';
import BackToTop from '../components/ui/BackToTop';

const SECTION_LABELS = {
  hero: 'Hero',
  auditionProcess: 'Audition Process',
  whyHMR: 'Why HMR',
  latestContent: 'Latest Content',
  credibility: 'Credibility',
  marquee: 'Marquee',
  roadmap: 'Roadmap',
  cta: 'CTA Section',
  contact: 'Contact',
  services: 'Services',
};

const SECTION_MAP = {
  hero: HeroSection,
  auditionProcess: AuditionProcess,
  whyHMR: WhyHMR,
  latestContent: LatestContent,
  credibility: Credibility,
  marquee: MarqueeSection,
  roadmap: Roadmap,
  cta: CTASection,
  contact: ContactSection,
  services: ServicesSection,
};

const DEFAULT_SECTIONS = [
  { id: 'hero', visible: true, order: 0 },
  { id: 'auditionProcess', visible: true, order: 1 },
  { id: 'whyHMR', visible: true, order: 2 },
  { id: 'latestContent', visible: true, order: 3 },
  { id: 'credibility', visible: true, order: 4 },
  { id: 'marquee', visible: true, order: 5 },
  { id: 'roadmap', visible: true, order: 6 },
  { id: 'cta', visible: true, order: 7 },
  { id: 'contact', visible: true, order: 8 },
];

export default function HomePage() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get('edit') === '1';

  useEffect(() => {
    api.get('/api/content')
      .then((res) => {
        if (res.data.sections?.length) setSections(res.data.sections);
      })
      .catch(() => {});
  }, []);

  const visibleSections = sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <Navbar />
      {visibleSections.map((s) => {
        const Component = SECTION_MAP[s.id];
        if (!Component) return null;
        if (editMode) {
          return (
            <div
              key={s.id}
              className="edit-wrap"
              onClick={() => window.parent.postMessage({ type: 'ADMIN_EDIT_SECTION', section: s.id }, '*')}
            >
              <div className="edit-wrap__badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit {SECTION_LABELS[s.id] || s.id}
              </div>
              <Component />
            </div>
          );
        }
        return <Component key={s.id} />;
      })}
      <Footer />
      <BackToTop />
    </>
  );
}
