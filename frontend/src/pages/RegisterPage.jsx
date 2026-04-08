import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function RegisterPage() {
  const { setPatientSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    allergies: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/patients/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth || null,
        phone: form.phone || null,
        email: form.email || null,
        allergies: form.allergies,
        notes: ''
      });
      setPatientSession({
        patientId: res.data.id,
        email: res.data.email || form.email,
        firstName: res.data.firstName,
        lastName: res.data.lastName
      });
      navigate('/book', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors de l’inscription';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-lg px-4">
        <div className="mb-8 text-center">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            Clinique — Tunisie
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Création de dossier patient</h1>
          <p className="mt-2 text-sm text-slate-600">
            Onboarding simple : identité, coordonnées et allergies éventuelles avant la prise de
            rendez-vous.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card-md">
          {error && (
            <div className="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Prénom *</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="ex. Amira"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Nom *</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="ex. Bouzidi"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date de naissance</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Allergies connues</label>
              <textarea
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                rows={3}
                placeholder="ex. pénicilline, produits de contraste iodés…"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="prenom.nom@email.tn"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+216 XX XXX XXX"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Enregistrement…' : 'Valider et prendre RDV'}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link to="/welcome" className="font-medium text-blue-600 hover:text-blue-700">
            ← Accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
