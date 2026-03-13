import { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/sections/HeroSection';
import AuditionProcess from '../components/sections/AuditionProcess';
import WhyHMR from '../components/sections/WhyHMR';
import LatestContent from '../components/sections/LatestContent';
import Credibility from '../components/sections/Credibility';
import MarqueeSection from '../components/sections/MarqueeSection';
import Roadmap from '../components/sections/Roadmap';
import CTASection from '../components/sections/CTASection';
import Footer from '../components/layout/Footer';
import BackToTop from '../components/ui/BackToTop';

const SECTION_MAP = {
  hero: HeroSection,
  auditionProcess: AuditionProcess,
  whyHMR: WhyHMR,
  latestContent: LatestContent,
  credibility: Credibility,
  marquee: MarqueeSection,
  roadmap: Roadmap,
  cta: CTASection,
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
];

export default function HomePage() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);

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
        return Component ? <Component key={s.id} /> : null;
      })}
      <Footer />
      <BackToTop />
    </>
  );
}
