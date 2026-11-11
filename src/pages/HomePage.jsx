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
import TeamSection from '../components/sections/TeamSection';
import BackToTop from '../components/ui/BackToTop';
import EditableSection from '../components/ui/EditableSection';
import { DEFAULT_SECTIONS, resolveSections } from '../utils/sections';

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
  team: 'Our Team',
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
  team: TeamSection,
};

// The last saved layout, kept across client-side navigation so returning to
// the homepage does not wait on the API again.
let layoutCache = null;

export default function HomePage() {
  // Do not render anything until the CMS layout is known. Starting from
  // DEFAULT_SECTIONS (every section visible, default order) made sections the
  // CMS hides flash on each refresh, then disappear when the layout arrived.
  const [sections, setSections] = useState(layoutCache);
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get('edit') === '1';

  useEffect(() => {
    api.get('/api/content')
      .then((res) => {
        layoutCache = resolveSections(res.data);
        setSections(layoutCache);
      })
      // API unreachable: fall back to the default layout rather than a blank page.
      .catch(() => setSections((current) => current || DEFAULT_SECTIONS));
  }, []);

  const visibleSections = (sections || [])
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
      <BackToTop />
    </>
  );
}
