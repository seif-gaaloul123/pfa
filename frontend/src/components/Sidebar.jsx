import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Columns3,
  FolderOpen,
  Stethoscope
} from './SidebarIcons';
import { useAuth } from '../AuthContext';
import { getStaffDisplayName } from '../authUtils';

const doctorLinks = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/waiting-room', label: 'Salle d’attente', icon: Columns3 },
  { to: '/files', label: 'Documents', icon: FolderOpen }
];

export default function Sidebar() {
  const { user } = useAuth();
  const displayName = getStaffDisplayName(user);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-white">
      <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/40">
          <Stethoscope className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">MedERP</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Clinique
          </div>
        </div>
      </div>

      <div className="border-b border-slate-800 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Session
        </p>
        <p className="mt-1 text-sm font-medium leading-snug text-white">
          Connecté : <span className="text-blue-100">{displayName || '—'}</span>
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </p>
        {doctorLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} end={to === '/dashboard'}>
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-4 text-[11px] leading-relaxed text-slate-500">
        Données sécurisées — usage professionnel
      </div>
    </aside>
  );
}
