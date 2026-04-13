import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function ProfileDashboardPage() {
  const { user, userRole } = useAuth();
  const patientId = userRole === 'patient' ? user?.patientId : null;

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', allergies: '', bloodType: '', password: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (patientId) {
      api.get(`/patients/profile/${patientId}`).then((res) => {
        setForm((f) => ({
          ...f,
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          allergies: res.data.allergies || '',
          bloodType: res.data.bloodType || ''
        }));
      }).catch(err => {
        setError('Erreur lors du chargement de votre profil.');
      });
    }
  }, [patientId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // optional handling depending on req, but requirement says exact 8 digits
    const regex = /^[0-9]{8}$/;
    return regex.test(phone);
  };

  const validateName = (name) => {
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
    return regex.test(name);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Real-time styling calculation
  const getInputStyle = (name, value, validator) => {
    if (!editing) return "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed";
    if (!value) return "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15";
    const isValid = validator(value);
    return isValid 
      ? "mt-1 w-full rounded-lg border border-green-400 bg-green-50 px-3 py-2.5 text-sm shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/15"
      : "mt-1 w-full rounded-lg border border-red-400 bg-red-50 px-3 py-2.5 text-sm shadow-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/15";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateName(form.firstName) || !validateName(form.lastName)) {
      return setError('Le nom et prénom doivent contenir uniquement des lettres.');
    }
    if (!validatePhone(form.phone)) {
      return setError('Le téléphone doit comporter exactement 8 chiffres.');
    }
    if (!validateEmail(form.email)) {
      return setError('Veuillez entrer une adresse email valide.');
    }

    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        allergies: form.allergies,
        bloodType: form.bloodType,
      };
      if (form.password) {
        payload.password = form.password;
      }
      const res = await api.put(`/patients/profile/${patientId}`, payload);
      setSuccess('Modifications enregistrées avec succès!');
      setEditing(false);
      setForm((f) => ({ ...f, password: '' })); // clear password field
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  if (!patientId) {
    return <div className="p-8 text-center text-slate-500">Profil introuvable. Connectez-vous.</div>;
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mon Profil et Compte</h1>
            <p className="mt-1 text-sm text-slate-600">Gérez vos informations personnelles et préférences de sécurité.</p>
          </div>
          <button
            onClick={() => {
              setEditing(!editing);
              setSuccess('');
              setError('');
            }}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            {editing ? 'Annuler l\'édition' : 'Mode Édition'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card p-8">
          {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {success && <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Infos Personnelles */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Informations Personnelles</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Prénom</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    readOnly={!editing}
                    required
                    className={getInputStyle('firstName', form.firstName, validateName)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nom</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    readOnly={!editing}
                    required
                    className={getInputStyle('lastName', form.lastName, validateName)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Téléphone (8 chiffres)</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    readOnly={!editing}
                    required
                    className={getInputStyle('phone', form.phone, validatePhone)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    readOnly={!editing}
                    required
                    className={getInputStyle('email', form.email, validateEmail)}
                  />
                </div>
              </div>
            </div>

            {/* Infos Médicales */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Informations Médicales</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Groupe Sanguin</label>
                  <select
                    name="bloodType"
                    value={form.bloodType}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="">-- Sélectionnez --</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Allergies Chroniques / Remarques</label>
                  <textarea
                    name="allergies"
                    value={form.allergies}
                    onChange={handleChange}
                    readOnly={!editing}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 read-only:bg-slate-50 read-only:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Sécurité du Compte</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Changer le mot de passe (optionnel)</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    readOnly={!editing}
                    placeholder={editing ? "Nouveau mot de passe" : "********"}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 read-only:bg-slate-50 read-only:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
