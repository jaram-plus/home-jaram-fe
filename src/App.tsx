import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/login/LoginPage';
import PeoplePage from '@/features/people/PeoplePage';
import SeminarPage from '@/features/seminar/SeminarPage';
import StudyPage from '@/features/study/StudyPage';
import AdminPage from '@/features/admin/AdminPage';
import ProfilePage from '@/features/profile/ProfilePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/apply" element={<LoginPage initialView="signup" />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/seminar" element={<SeminarPage />} />
      <Route path="/study" element={<StudyPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}
