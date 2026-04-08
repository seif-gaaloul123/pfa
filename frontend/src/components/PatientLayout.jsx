import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function PatientLayout() {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const isPatient = userRole === 'patient';

  const handleLogout = () => {
    logout();
    navigate('/welcome', { replace: true });
  };

  if (!isPatient) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Portail patient
          </div>
          <div className="mt-1 truncate text-sm font-medium text-slate-900">
            {user?.firstName} {user?.lastName}
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <Link
            to="/book"
            className="block rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-800"
          >
            Prendre un rendez-vous
          </Link>
          <Link
            to="/register"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Mettre à jour mon profil
          </Link>
          <Link
            to="/welcome"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Accueil public
          </Link>
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Déconnexion
          </button>
        </div>
      </aside>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
