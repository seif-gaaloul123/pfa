import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DoctorRoute } from './components/RoleRoute';
import DoctorLayout from './components/DoctorLayout';
import PatientLayout from './components/PatientLayout';


import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookPage from './pages/BookPage';
import ProfileDashboardPage from './pages/ProfileDashboardPage';
import MesDocuments from './pages/MesDocuments';
import MesRappels from './pages/MesRappels';
import ContactUrgence from './pages/ContactUrgence';

import DoctorDashboardPage from './pages/DoctorDashboardPage';
import DoctorPatientsPage from './pages/DoctorPatientsPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import FilesVaultPage from './pages/FilesVaultPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<PatientLayout />}>
        <Route path="/book" element={<BookPage />} />
        <Route path="/profile" element={<ProfileDashboardPage />} />
        <Route path="/mes-documents" element={<MesDocuments />} />
        <Route path="/mes-rappels" element={<MesRappels />} />
        <Route path="/contact-urgence" element={<ContactUrgence />} />
      </Route>

      <Route
        element={
          <DoctorRoute>
            <DoctorLayout />
          </DoctorRoute>
        }
      >
        <Route path="/dashboard" element={<DoctorDashboardPage />} />
        <Route path="/patients" element={<DoctorPatientsPage />} />
        <Route path="/patient/:id/history" element={<PatientHistoryPage />} />
        <Route path="/waiting-room" element={<WaitingRoomPage />} />
        <Route path="/files" element={<FilesVaultPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
