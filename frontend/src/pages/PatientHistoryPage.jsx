import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

const STATUS_LABEL = {
  waiting: 'En attente',
  'in-consultation': 'En consultation',
  finished: 'Terminé'
};

function formatConsultationNote(text) {
  if (!text) return '';
  return String(text).replace(/^\[Démo MedERP Tunis\]\s*/i, '').trim();
}

export default function PatientHistoryPage() {
  const { id } = useParams();
  const { user, userRole } = useAuth();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [files, setFiles] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const [pRes, aRes, dRes, fRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get('/appointments'),
          api.get('/auth/doctors').catch(() => ({ data: [] })),
          api.get('/files').catch(() => ({ data: [] }))
        ]);
        setPatient(pRes.data);
        const mine = aRes.data.filter((a) => a.patientId === id);
        setAppointments(mine);
        setDoctors(dRes.data);
        setFiles(fRes.data || []);
      } catch {
        setError('Patient introuvable ou accès refusé.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const timelineAsc = useMemo(
    () => [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [appointments]
  );

  const doctorName = (doctorId) => {
    const d = doctors.find((x) => x.id === doctorId);
    return d?.name || 'Médecin Inconnu';
  };

  const formatDt = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-500">Chargement…</div>
    );
  }

  if (error || !patient) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-4 text-red-800">
        {error || 'Introuvable'}
        <div className="mt-4">
          <Link to="/patients" className="font-medium text-blue-700 hover:underline">
            ← Retour aux patients
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="space-y-10">
      <div>
        <Link
          to="/patients"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Patients
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Dossier médical : {fullName}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Né(e) le {patient.dateOfBirth || '—'} · {patient.email || patient.phone || 'Contact non renseigné'}
        </p>
        {(patient.allergies || patient.notes) && (
          <div className="mt-5 max-w-2xl rounded-xl border border-amber-100 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 shadow-sm">
            {patient.allergies && (
              <p>
                <span className="font-semibold">Allergies :</span> {patient.allergies}
              </p>
            )}
            {patient.notes && !String(patient.notes).startsWith('Allergies:') && (
              <p className={patient.allergies ? 'mt-2' : ''}>
                <span className="font-semibold">Antécédents :</span> {patient.notes}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Notes de consultation</h2>
          <p className="text-sm text-slate-500">Ordre chronologique (du plus ancien au plus récent)</p>

          <div className="relative mt-8 border-l-2 border-blue-300 pl-10">
            {timelineAsc.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune consultation enregistrée.</p>
            ) : (
              timelineAsc.map((apt) => (
                <div key={apt.id} className="relative mb-12 last:mb-2">
                  <div
                    className="absolute -left-[29px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-md ring-4 ring-blue-100"
                    aria-hidden
                  />
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card-md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">{formatDt(apt.date)}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-700">
                        {STATUS_LABEL[apt.status] || apt.status || '—'}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Praticien :</span>{' '}
                      {userRole === 'doctor' && apt.status !== 'waiting' && apt.status !== 'finished' 
                        ? user.name || `Dr. ${user.lastName}` 
                        : doctorName(apt.doctorId)}
                    </p>
                    {apt.notes && (
                      <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Compte rendu
                        </span>
                        <p className="mt-1">{formatConsultationNote(apt.notes)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
          <h2 className="text-base font-semibold text-slate-900">Pièces jointes</h2>
          <p className="text-xs text-slate-500">Documents récents du coffre clinique</p>
          <div className="mt-4 space-y-2">
            {files.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun fichier indexé.</p>
            ) : (
              files.slice(0, 6).map((f) => (
                <div
                  key={f.storedName}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm"
                >
                  <span className="truncate font-medium text-slate-800" title={f.originalName}>
                    {f.originalName || f.storedName}
                  </span>
                  <span className="ml-2 shrink-0 text-xs text-slate-400">
                    {(f.size / 1024).toFixed(0)} Ko
                  </span>
                </div>
              ))
            )}
          </div>
          <Link
            to="/files"
            className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Ouvrir le coffre documents →
          </Link>
        </div>
      </div>
    </div>
  );
}
