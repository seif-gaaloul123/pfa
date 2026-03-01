import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import FileUploadPage from './pages/FileUploadPage';

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Medical CRM</h1>
        <div className="header-right">
          {user && (
            <>
              <span>{user.email} ({user.role})</span>
              <button onClick={logout}>Déconnexion</button>
            </>
          )}
        </div>
      </header>

      <div className="app-body">
        {user && (
          <nav className="sidebar">
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/patients">Patients</Link></li>
              <li><Link to="/appointments">Rendez-vous</Link></li>
              <li><Link to="/upload">Upload fichiers</Link></li>
            </ul>
          </nav>
        )}

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <PrivateRoute>
                  <PatientsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  <AppointmentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <FileUploadPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
