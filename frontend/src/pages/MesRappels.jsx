import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

function AlertIcon({ type }) {
  if (type === 'rdv') {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}

export default function MesRappels() {
  const { user } = useAuth();
  const [rappels, setRappels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.patientId) return;

    const load = async () => {
      try {
        const [aRes, dRes] = await Promise.all([
          api.get(`/appointments/patient/${user.patientId}`),
          api.get('/auth/doctors').catch(() => ({ data: [] }))
        ]);
        const doctors = dRes.data;
        
        // Filter out finished appointments, only keep upcoming or in-consultation
        const upcoming = aRes.data
          .filter(a => a.status === 'waiting' || a.status === 'in-consultation')
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        const mappedRappels = upcoming.map(app => {
          const doc = doctors.find(d => d.id === app.doctorId);
          const docName = doc ? doc.name : 'Médecin inconnu';
          const specialite = doc && doc.specialty ? ` — ${doc.specialty}` : '';
          
          let title = 'Rendez-vous à venir';
          if (app.status === 'in-consultation') title = 'En consultation';

          const dateObj = new Date(app.date);
          const dateStr = dateObj.toLocaleString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
          });

          return {
            id: app.id,
            title: title,
            description: `Consultation avec ${docName}${specialite}. Notes: ${app.notes || 'Aucune note.'}`,
            date: dateStr,
            type: 'rdv',
            urgent: app.status === 'in-consultation'
          };
        });

        setRappels(mappedRappels);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.patientId]);

  return (
    <div className="p-8 lg:p-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900">Mes Rappels</h1>
        <p className="mt-1 text-sm text-slate-600">
          Notifications et rappels importants concernant vos rendez-vous et résultats.
        </p>

        {loading ? (
           <div className="mt-8 text-sm text-slate-500">Chargement...</div>
        ) : (
          <div className="mt-8 space-y-4">
            {rappels.map((rappel) => (
              <div
                key={rappel.id}
                className={`flex items-start gap-4 rounded-2xl border p-5 shadow-sm transition ${
                  rappel.urgent
                    ? 'border-amber-200 bg-amber-50/40'
                    : 'border-slate-200/80 bg-white'
                }`}
              >
                <AlertIcon type={rappel.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{rappel.title}</p>
                    {rappel.urgent && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{rappel.description}</p>
                  <p className="mt-2 text-xs text-slate-400">{rappel.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && rappels.length === 0 && (
          <div className="mt-12 text-center text-sm text-slate-500">
            Aucun rappel pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
