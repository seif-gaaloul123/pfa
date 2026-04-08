import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DoctorRoute } from './components/RoleRoute';
import DoctorLayout from './components/DoctorLayout';
import PatientLayout from './components/PatientLayout';

import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookPage from './pages/BookPage';

import DoctorDashboardPage from './pages/DoctorDashboardPage';
import DoctorPatientsPage from './pages/DoctorPatientsPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import FilesVaultPage from './pages/FilesVaultPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/book" element={<PatientLayout />}>
        <Route index element={<BookPage />} />
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

      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}
