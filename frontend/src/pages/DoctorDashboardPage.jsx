import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../api';
import { useAuth } from '../AuthContext';
import { getStaffDisplayName } from '../authUtils';

const TND_PER_VISIT = 85;

function formatTnd(n) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);
}

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const doctorName = getStaffDisplayName(user);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          api.get('/patients'),
          api.get('/appointments')
        ]);
        setPatients(pRes.data);
        setAppointments(aRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const myAppointments = useMemo(() => {
    if (!user?.id) return [];
    return appointments.filter((a) => a.doctorId === user.id);
  }, [appointments, user?.id]);

  const stats = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');

    const monthPrefix = `${y}-${m}`;
    const monthVisits = myAppointments.filter((a) => String(a.date).startsWith(monthPrefix));
    const recettesMensuelles = monthVisits.length * TND_PER_VISIT;

    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const py = day.getFullYear();
      const pm = String(day.getMonth() + 1).padStart(2, '0');
      const pd = String(day.getDate()).padStart(2, '0');
      const prefix = `${py}-${pm}-${pd}`;
      const label = day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      const count = myAppointments.filter((a) => String(a.date).startsWith(prefix)).length;
      weekData.push({ name: label, visites: count });
    }

    return {
      totalPatients: patients.length,
      recettesMensuelles,
      weekData
    };
  }, [patients.length, myAppointments]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-500">Chargement…</div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Tableau de bord — {doctorName || 'Médecin'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Activité clinique (Tunisie) — vue consolidée pour votre pratique.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total patients
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{stats.totalPatients}</div>
              <p className="mt-2 text-xs text-slate-500">Dossiers enregistrés à la clinique</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recettes mensuelles (TND)
              </div>
              <div className="mt-2 text-3xl font-bold text-blue-700 tabular-nums">
                {formatTnd(stats.recettesMensuelles)} <span className="text-lg font-semibold">TND</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Estimation sur la base des consultations du mois ({TND_PER_VISIT} TND / visite)
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <span className="text-lg font-bold">د.ت</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card-md">
        <h2 className="text-lg font-semibold text-slate-900">Activité sur 7 jours</h2>
        <p className="text-sm text-slate-500">Vos rendez-vous par jour</p>
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weekData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)'
                }}
              />
              <Bar dataKey="visites" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
