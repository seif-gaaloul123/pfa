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
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validatePhone = (phone) => {
    if (!phone) return true; 
    const regex = /^[0-9]{8}$/;
    return regex.test(phone);
  };

  const validateName = (name) => {
    if (!name) return true;
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
    return regex.test(name);
  };

  const validateEmail = (email) => {
    if (!email) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const getInputStyle = (name, value, validator) => {
    if (!value) return "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15";
    const isValid = validator(value);
    return isValid 
      ? "mt-1 w-full rounded-lg border border-green-400 bg-green-50 px-3 py-2.5 text-sm shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/15"
      : "mt-1 w-full rounded-lg border border-red-400 bg-red-50 px-3 py-2.5 text-sm shadow-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/15";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.firstName || !validateName(form.firstName) || !form.lastName || !validateName(form.lastName)) {
      return setError('Le nom et prénom doivent contenir uniquement des lettres.');
    }
    if (!form.phone || !validatePhone(form.phone)) {
      return setError('Le téléphone doit comporter exactement 8 chiffres.');
    }
    if (!form.email || !validateEmail(form.email)) {
      return setError('Veuillez entrer une adresse email valide.');
    }
    if (!form.password || form.password.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères.');
    }

    setLoading(true);
    try {
      const res = await api.post('/patients/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth || null,
        phone: form.phone,
        email: form.email,
        password: form.password,
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
            Portail Patient
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Création de compte</h1>
          <p className="mt-2 text-sm text-slate-600">
            Rejoignez-nous pour gérer vos rendez-vous et accéder à votre dossier patient.
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
                  className={getInputStyle('firstName', form.firstName, validateName)}
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
                  className={getInputStyle('lastName', form.lastName, validateName)}
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="prenom.nom@email.tn"
                  required
                  className={getInputStyle('email', form.email, validateEmail)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Téléphone (8 chiffres) *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="XXXXXXXX"
                  required
                  className={getInputStyle('phone', form.phone, validatePhone)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Mot de passe *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="********"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
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
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Allergies connues</label>
              <textarea
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                rows={2}
                placeholder="ex. pénicilline, produits de contraste iodés…"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Création en cours…' : 'Créer mon compte'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-600">
            Déjà inscrit(e) ?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Connectez-vous ici
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link to="/welcome" className="font-medium text-blue-600 hover:text-blue-700">
            ← Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
