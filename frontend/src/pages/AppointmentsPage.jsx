import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchData = async () => {
    const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
      api.get('/appointments'),
      api.get('/patients'),
      api.get('/auth/doctors').catch(() => ({ data: [] }))
    ]);
    setAppointments(appointmentsRes.data);
    setPatients(patientsRes.data);
    setDoctors(doctorsRes.data);
  };

  useEffect(() => {
    fetchData().catch(() => setError('Erreur de chargement des rendez-vous'));
  }, []);

  // Generate available time slots when doctor and date are selected
  useEffect(() => {
    if (form.doctorId && selectedDate) {
      generateAvailableSlotsForDate();
    } else {
      setAvailableSlots([]);
    }
  }, [form.doctorId, selectedDate, appointments]);

  const generateAvailableSlotsForDate = () => {
    const slots = [];
    const date = new Date(selectedDate);
    
    // Working hours: 9 AM to 5 PM
    for (let hour = 9; hour < 17; hour++) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, 0, 0, 0);
      
      // Format: YYYY-MM-DDTHH:mm
      const slotString = slotTime.toISOString().slice(0, 16);
      
      // Check if this slot is already booked for the selected doctor
      const isBooked = appointments.some(
        (apt) => apt.doctorId === form.doctorId && apt.date === slotString
      );
      
      // Only add if not booked and in the future
      if (slotTime > new Date()) {
        slots.push({
          value: slotString,
          label: `${hour.toString().padStart(2, '0')}:00`,
          isBooked: isBooked
        });
      }
    }
    
    setAvailableSlots(slots);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    setSelectedDate(dateValue);
    setForm({ ...form, date: '' }); // Reset time selection when date changes
  };

  const resetForm = () => {
    setForm({
      patientId: '',
      doctorId: '',
      date: '',
      notes: ''
    });
    setEditingId(null);
    setSelectedDate('');
    setAvailableSlots([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/appointments/${editingId}`, form);
      } else {
        await api.post('/appointments', form);
      }
      await fetchData();
      resetForm();
    } catch (err) {
      console.error('Error saving appointment:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde du rendez-vous';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    const appointmentDate = appointment.date.split('T')[0];
    setSelectedDate(appointmentDate);
    setForm({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      notes: appointment.notes || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce rendez-vous ?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      await fetchData();
    } catch (err) {
      setError('Erreur lors de la suppression du rendez-vous');
    }
  };

  const getPatientName = (id) => {
    const p = patients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };

  const getDoctorName = (id) => {
    const d = doctors.find((x) => x.id === id);
    return d ? d.name : id;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (2 weeks from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div>
      <h2>Rendez-vous</h2>
      {error && <div className="error">{error}</div>}

      <div className="layout-two-columns">
        <div>
          <h3>{editingId ? 'Modifier un rendez-vous' : 'Créer un rendez-vous'}</h3>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Patient
              <select name="patientId" value={form.patientId} onChange={handleChange} required>
                <option value="">-- Sélectionner un patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </label>
            
            <label>
              Médecin
              <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
                <option value="">-- Sélectionner un médecin --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </label>
            
            {form.doctorId && (
              <label>
                Date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                />
              </label>
            )}
            
            {form.doctorId && selectedDate && availableSlots.length > 0 && (
              <label>
                Heure disponible
                <select name="date" value={form.date} onChange={handleChange} required>
                  <option value="">-- Choisir une heure --</option>
                  {availableSlots.map((slot) => (
                    <option 
                      key={slot.value} 
                      value={slot.value}
                      disabled={slot.isBooked}
                      style={slot.isBooked ? { color: '#999', fontStyle: 'italic' } : {}}
                    >
                      {slot.label} {slot.isBooked ? '(Déjà réservé)' : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
            
            {form.doctorId && selectedDate && availableSlots.filter(s => !s.isBooked).length === 0 && (
              <div style={{ padding: '0.75rem', backgroundColor: '#FEF3C7', borderRadius: '0.375rem', color: '#92400E' }}>
                <strong>Aucun créneau disponible</strong> pour ce médecin à cette date. 
                Tous les créneaux sont déjà réservés. Veuillez choisir une autre date.
              </div>
            )}
            
            {form.doctorId && !selectedDate && (
              <p style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9rem' }}>
                Veuillez sélectionner une date pour voir les horaires disponibles.
              </p>
            )}
            
            {!form.doctorId && (
              <p style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9rem' }}>
                Veuillez d&apos;abord sélectionner un médecin.
              </p>
            )}
            
            <label>
              Notes
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" />
            </label>
            
            <div className="form-actions">
              <button type="submit" disabled={loading || !form.patientId || !form.doctorId || !form.date}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h3>Liste des rendez-vous</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{getPatientName(a.patientId)}</td>
                  <td>{getDoctorName(a.doctorId)}</td>
                  <td>{formatDateTime(a.date)}</td>
                  <td>
                    <button onClick={() => handleEdit(a)}>Modifier</button>
                    <button onClick={() => handleDelete(a.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="4">Aucun rendez-vous</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
