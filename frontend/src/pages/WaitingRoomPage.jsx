import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api';
import { useAuth } from '../AuthContext';

const COLUMNS = [
  { id: 'waiting', title: 'En Attente' },
  { id: 'in-consultation', title: 'En Consultation' },
  { id: 'finished', title: 'Terminé' }
];

export default function WaitingRoomPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [aRes, pRes, dRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
        api.get('/auth/doctors').catch(() => ({ data: [] }))
      ]);
      setAppointments(aRes.data);
      setPatients(pRes.data);
      setDoctors(dRes.data);
      setError('');
    } catch {
      setError('Impossible de charger la salle d’attente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patientName = (pid) => {
    const p = patients.find((x) => x.id === pid);
    return p ? `${p.firstName} ${p.lastName}` : pid;
  };

  const doctorName = (did) => {
    const d = doctors.find((x) => x.id === did);
    return d ? d.name : did;
  };

  const formatShort = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const grouped = useMemo(() => {
    const myAppointments = user?.role === 'admin' 
      ? appointments 
      : appointments.filter(a => a.doctorId === user?.id);

    const g = { waiting: [], 'in-consultation': [], finished: [] };
    for (const a of myAppointments) {
      const s = a.status && g[a.status] !== undefined ? a.status : 'waiting';
      g[s].push(a);
    }
    for (const k of Object.keys(g)) {
      g[k].sort((x, y) => new Date(x.date) - new Date(y.date));
    }
    return g;
  }, [appointments, user?.id, user?.role]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    const newStatus = destination.droppableId;
    try {
      await api.put(`/appointments/${draggableId}`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a.id === draggableId ? { ...a, status: newStatus } : a))
      );
    } catch {
      setError('Mise à jour du statut impossible.');
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-500">Chargement…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Salle d’attente</h1>
        <p className="mt-1 text-sm text-slate-600">
          Glissez-déposez les cartes patient — ex.{' '}
          <span className="font-medium text-slate-800">Yassine Mansour</span> dans la file d’attente.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex min-h-[420px] flex-col rounded-2xl border bg-slate-50/50 p-4 transition ${
                    snapshot.isDraggingOver
                      ? 'border-blue-300 ring-2 ring-blue-100'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                      {col.title}
                    </h2>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
                      {grouped[col.id].length}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    {grouped[col.id].map((apt, index) => (
                      <Draggable key={apt.id} draggableId={apt.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`rounded-xl border border-slate-200 bg-white p-4 shadow-card transition ${
                              dragSnapshot.isDragging ? 'rotate-1 shadow-lg ring-2 ring-blue-200' : ''
                            }`}
                          >
                            <div className="text-base font-semibold text-slate-900">
                              {patientName(apt.patientId)}
                            </div>
                            <div className="mt-1 text-xs font-medium text-slate-500">
                              {doctorName(apt.doctorId)}
                            </div>
                            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-blue-700">
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-semibold">
                                {formatShort(apt.date)}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
