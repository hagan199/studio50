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
import EditableSection from '../components/ui/EditableSection';

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
  { id: 'marquee', visible: true, order: 1 },
  { id: 'auditionProcess', visible: true, order: 2 },
  { id: 'whyHMR', visible: true, order: 3 },
  { id: 'latestContent', visible: true, order: 4 },
  { id: 'credibility', visible: true, order: 5 },
  { id: 'roadmap', visible: true, order: 6 },
  { id: 'cta', visible: true, order: 7 },
  { id: 'contact', visible: true, order: 8 },
  // The services grid stays in SECTION_MAP so it can be switched back on from
  // the CMS, but it no longer renders by default.
  { id: 'services', visible: false, order: 9 },
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
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
      {visibleSections.map((s) => {
        const Component = SECTION_MAP[s.id];
        if (!Component) return null;
        return (
          <EditableSection key={s.id} editMode={editMode} section={s.id} label={SECTION_LABELS[s.id]}>
            <Component />
          </EditableSection>
        );
      })}
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
