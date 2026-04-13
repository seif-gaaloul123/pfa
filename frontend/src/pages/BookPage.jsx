import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function BookPage() {
  const { user, userRole } = useAuth();
  const patientId = userRole === 'patient' ? user?.patientId : null;

  const [bookedSlotTimes, setBookedSlotTimes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [form, setForm] = useState({
    doctorId: '',
    date: '',
    notes: ''
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPublicData = async () => {
    const doctorsRes = await api.get('/auth/doctors').catch(() => ({ data: [] }));
    setDoctors(doctorsRes.data);
  };

  useEffect(() => {
    fetchPublicData().catch(() => setError('Impossible de charger les médecins'));
  }, []);

  useEffect(() => {
    if (!form.doctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    const slots = [];
    const date = new Date(selectedDate);
    for (let hour = 8; hour < 17; hour++) {
      for (const minute of [0, 30]) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        const slotString = slotTime.toISOString().slice(0, 16);
        const isBooked = bookedSlotTimes.includes(slotString);
        if (slotTime > new Date()) {
          slots.push({
            value: slotString,
            label: `${hour.toString().padStart(2, '0')}:${minute === 0 ? '00' : '30'}`,
            isBooked
          });
        }
      }
    }
    setAvailableSlots(slots);
  }, [form.doctorId, selectedDate, bookedSlotTimes]);

  const loadBookedSlotsForDay = async () => {
    if (!form.doctorId || !selectedDate) {
      setBookedSlotTimes([]);
      return;
    }
    try {
      const res = await api.get('/appointments/slots', {
        params: { doctorId: form.doctorId, day: selectedDate }
      });
      setBookedSlotTimes(res.data || []);
    } catch {
      setBookedSlotTimes([]);
    }
  };

  useEffect(() => {
    if (patientId && form.doctorId && selectedDate) {
      loadBookedSlotsForDay().catch(() => {});
    }
  }, [patientId, form.doctorId, selectedDate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    setSelectedDate(dateValue);
    setForm((f) => ({ ...f, date: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const doctorId = form.doctorId;
      const day = selectedDate;
      await api.post('/appointments/book', {
        patientId,
        doctorId,
        date: form.date,
        notes: form.notes
      });
      if (doctorId && day) {
        const res = await api.get('/appointments/slots', {
          params: { doctorId, day }
        });
        setBookedSlotTimes(res.data || []);
      }
      setSuccess('Rendez-vous confirmé.');
      setForm((f) => ({ ...f, date: '', notes: '' }));
      setSelectedDate('');
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Impossible de réserver ce créneau';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    return maxDate.toISOString().split('T')[0];
  };

  if (!patientId) {
    return (
      <div className="p-8 lg:p-12">
        <div className="mx-auto max-w-lg rounded-2xl border border-amber-100 bg-amber-50/80 p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Profil patient requis</h2>
          <p className="mt-2 text-sm text-slate-600">
            Inscrivez-vous pour obtenir un identifiant patient et réserver un créneau.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
          >
            Créer mon profil
          </Link>
          <p className="mt-4 text-xs text-slate-500">
            Déjà inscrit sur cet appareil ? La session est conservée automatiquement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Prendre un rendez-vous</h1>
        <p className="mt-1 text-sm text-slate-600">
          Choisissez un médecin, une date puis un créneau horaire.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card-md">
          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Médecin</label>
              <select
                name="doctorId"
                value={form.doctorId}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
              >
                <option value="">— Sélectionner —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            {form.doctorId && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
              </div>
            )}

            {form.doctorId && selectedDate && availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Créneau</label>
                <select
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                >
                  <option value="">— Choisir une heure —</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.value} value={slot.value} disabled={slot.isBooked}>
                      {slot.label} {slot.isBooked ? '(indisponible)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.doctorId &&
              selectedDate &&
              availableSlots.length > 0 &&
              availableSlots.filter((s) => !s.isBooked).length === 0 && (
                <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Aucun créneau libre à cette date pour ce médecin.
                </div>
              )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Notes (optionnel)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
              />
            </div>

            <button
              type="submit"
              disabled={
                loading || !form.doctorId || !form.date || !availableSlots.some((s) => !s.isBooked)
              }
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Envoi…' : 'Confirmer le rendez-vous'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
