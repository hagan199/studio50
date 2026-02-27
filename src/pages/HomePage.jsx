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

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <AuditionProcess />
      <WhyHMR />
      <LatestContent />
      <Credibility />
      <MarqueeSection />
      <Roadmap />
      <CTASection />
      <Footer />
    </>
  );
}
