import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getStaffDisplayName } from '../authUtils';
import Sidebar from './Sidebar';

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = getStaffDisplayName(user);

  const handleLogout = () => {
    logout();
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Espace clinique · Tunis</div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:inline">
              <span className="font-medium text-slate-900">{displayName}</span>
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {user?.role}
              </span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Déconnexion
            </button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
