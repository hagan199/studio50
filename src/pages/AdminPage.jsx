import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import ContentEditor from '../components/admin/ContentEditor';
import ServicesEditor from '../components/admin/ServicesEditor';
import ContactEditor from '../components/admin/ContactEditor';
import ThemeEditor from '../components/admin/ThemeEditor';
import ImageUploader from '../components/admin/ImageUploader';

export default function AdminPage() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<ContentEditor />} />
        <Route path="services" element={<ServicesEditor />} />
        <Route path="contact" element={<ContactEditor />} />
        <Route path="theme" element={<ThemeEditor />} />
        <Route path="images" element={<ImageUploader />} />
      </Route>
    </Routes>
  );
}
