import React, { useEffect, useState } from 'react';
import api from '../api';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPatients = async () => {
    const res = await api.get('/patients');
    setPatients(res.data);
  };

  useEffect(() => {
    fetchPatients().catch(() => setError('Erreur de chargement des patients'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phone: '',
      email: '',
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
        await api.put(`/patients/${editingId}`, form);
      } else {
        await api.post('/patients', form);
      }
      await fetchPatients();
      resetForm();
    } catch (err) {
      setError('Erreur lors de la sauvegarde du patient');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setEditingId(patient.id);
    setForm({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      dateOfBirth: patient.dateOfBirth || '',
      phone: patient.phone || '',
      email: patient.email || '',
      notes: patient.notes || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce patient ?')) return;
    try {
      await api.delete(`/patients/${id}`);
      await fetchPatients();
    } catch (err) {
      setError('Erreur lors de la suppression du patient');
    }
  };

  return (
    <div>
      <h2>Patients</h2>
      {error && <div className="error">{error}</div>}

      <div className="layout-two-columns">
        <div>
          <h3>{editingId ? 'Modifier un patient' : 'Ajouter un patient'}</h3>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Prénom
              <input name="firstName" value={form.firstName} onChange={handleChange} />
            </label>
            <label>
              Nom
              <input name="lastName" value={form.lastName} onChange={handleChange} />
            </label>
            <label>
              Date de naissance
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </label>
            <label>
              Téléphone
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <label>
              Email
              <input name="email" value={form.email} onChange={handleChange} />
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
        </div>

        <div>
          <h3>Liste des patients</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Date de naissance</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.firstName} {p.lastName}</td>
                  <td>{p.dateOfBirth}</td>
                  <td>{p.phone}</td>
                  <td>{p.email}</td>
                  <td>
                    <button onClick={() => handleEdit(p)}>Modifier</button>
                    <button onClick={() => handleDelete(p.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan="5">Aucun patient</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
