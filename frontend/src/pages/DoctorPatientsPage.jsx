import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/patients')
      .then((res) => setPatients(res.data))
      .catch(() => setError('Impossible de charger les patients'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
        <p className="mt-1 text-sm text-slate-600">
          Dossiers cliniques — sélectionnez une fiche pour consulter l’historique médical.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-500 shadow-card">
          Chargement…
        </div>
      ) : patients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center text-sm text-slate-500">
          Aucun patient enregistré pour le moment.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {patients.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition hover:border-blue-200 hover:shadow-card-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-sm font-bold text-white shadow-md">
                  {(p.firstName?.[0] || '?') + (p.lastName?.[0] || '')}
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  Dossier
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                {p.firstName} {p.lastName}
              </h2>
              <dl className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Naissance</dt>
                  <dd className="font-medium text-slate-800">{p.dateOfBirth || '—'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Contact</dt>
                  <dd className="max-w-[60%] truncate text-right font-medium text-slate-800">
                    {p.email || p.phone || '—'}
                  </dd>
                </div>
              </dl>
              <Link
                to={`/patient/${p.id}/history`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition group-hover:bg-blue-700"
              >
                Ouvrir le dossier médical
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
