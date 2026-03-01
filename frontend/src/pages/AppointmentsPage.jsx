import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const [appointmentsRes, patientsRes, usersRes] = await Promise.all([
      api.get('/appointments'),
      api.get('/patients'),
      api.get('/auth/users').catch(() => ({ data: [] })) // placeholder, not implemented
    ]);
    setAppointments(appointmentsRes.data);
    setPatients(patientsRes.data);
    // Pour l’instant, pas de route liste users, donc on laisse docteurs vide
    setDoctors(usersRes.data.filter((u) => u.role === 'medecin'));
  };

  useEffect(() => {
    fetchData().catch(() => setError('Erreur de chargement des rendez-vous'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      patientId: '',
      doctorId: '',
      date: '',
      notes: ''
    });
    setEditingId(null);
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
      setError('Erreur lors de la sauvegarde du rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
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
              <select name="patientId" value={form.patientId} onChange={handleChange}>
                <option value="">-- Sélectionner --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Médecin (ID)
              <input
                name="doctorId"
                value={form.doctorId}
                onChange={handleChange}
                placeholder="ID du médecin"
              />
            </label>
            <label>
              Date et heure
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </label>
            <label>
              Notes
              <textarea name="notes" value={form.notes} onChange={handleChange} />
            </label>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm}>
                  Annuler
                </button>
              )}
            </div>
          </form>
          <p className="hint">
            Pour le champ médecin, entre provisoirement l&apos;ID d&apos;un utilisateur
            créé côté backend avec le rôle &quot;medecin&quot;.
          </p>
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
                  <td>{a.doctorId}</td>
                  <td>{a.date}</td>
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
