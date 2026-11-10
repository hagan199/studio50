import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BackToTop from '../components/ui/BackToTop';
import EditableSection from '../components/ui/EditableSection';
import ContactSection from '../components/sections/ContactSection';
import GraduationHero from '../components/graduation/GraduationHero';
import GraduationGallery from '../components/graduation/GraduationGallery';
import GraduationPackages from '../components/graduation/GraduationPackages';
import GraduationAdditionalServices from '../components/graduation/GraduationAdditionalServices';
import GraduationReels from '../components/graduation/GraduationReels';
import GraduationPhotos from '../components/graduation/GraduationPhotos';
import '../components/graduation/Graduation.css';

const SECTIONS = {
  hero: { label: 'Graduation Hero', render: (d, brand) => <GraduationHero hero={d?.hero} brand={brand} /> },
  gallery: { label: 'Graduation Gallery', render: (d) => <GraduationGallery gallery={d.gallery} /> },
  packages: { label: 'Graduation Packages', render: (d) => <GraduationPackages packages={d.packages} /> },
  additionalServices: { label: 'Additional Services', render: (d) => <GraduationAdditionalServices additionalServices={d.additionalServices} /> },
  reels: { label: 'Graduation Reels', render: (d) => <GraduationReels reels={d.reels} /> },
  photos: { label: 'Graduation Photos', render: (d) => <GraduationPhotos photos={d.photos} /> },
  contact: { label: 'Contact', render: () => <ContactSection /> },
};

const DEFAULT_ORDER = ['hero', 'gallery', 'packages', 'additionalServices', 'reels', 'photos', 'contact'];

export default function GraduationPage() {
  const [data, setData] = useState(null);
  const [brand, setBrand] = useState(null);
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get('edit') === '1';

  useEffect(() => {
    api.get('/api/graduation').then((res) => setData(res.data)).catch(() => {});
    api.get('/api/content').then((res) => setBrand(res.data?.brand)).catch(() => {});
  }, []);

  const sections = data?.sections?.length
    ? data.sections.filter((s) => s.visible && SECTIONS[s.id]).sort((a, b) => a.order - b.order)
    : DEFAULT_ORDER.map((id) => ({ id }));

  return (
    <div className="grad-page">
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        {data
          ? sections.map((s) => (
              <EditableSection key={s.id} editMode={editMode} section="graduation" label={SECTIONS[s.id].label}>
                {SECTIONS[s.id].render(data, brand)}
              </EditableSection>
            ))
          : <GraduationHero hero={null} />}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
