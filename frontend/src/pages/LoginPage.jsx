import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const { login, patientLogin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('patient'); // 'patient' or 'pro'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'pro') {
        await login(email, password);
        navigate('/dashboard', { replace: true });
      } else {
        await patientLogin(email, password);
        navigate('/book', { replace: true });
      }
    } catch {
      setError('Identifiants invalides. Veuillez vérifier vos accès.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-12 text-white lg:flex">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            MedERP <span className="text-blue-200">·</span> Clinique
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-blue-100/80">
            Plateforme de gestion : rendez-vous, dossiers patients et documents — interface professionnelle.
          </p>
          <div className="mt-10 text-sm font-semibold uppercase tracking-widest text-blue-200/90">
            Clinique — Tunisie
          </div>
          <h2 className="mt-4 max-w-md text-2xl font-bold leading-tight">
            Portail de Connexion Unifié
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-blue-100/90">
            Accédez à vos informations médicales, prenez vos rendez-vous en ligne, ou connectez-vous en tant que professionnel de santé.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-sm text-blue-50/90">
            Compte Patient Démo :{' '}
            <span className="font-mono text-white">khaled.alfessi@patient.tn</span> · <span className="font-mono text-white">patient123</span>
          </p>
          <p className="text-sm text-blue-50/90 mt-2">
            Compte Pro Démo :{' '}
            <span className="font-mono text-white">dr.anis.belhaj@clinique.tn</span> · <span className="font-mono text-white">doctor123</span>
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Tabs */}
          <div className="flex rounded-lg bg-slate-200/50 p-1 mb-8">
            <button
              onClick={() => switchTab('patient')}
              className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                tab === 'patient' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Espace Patient
            </button>
            <button
              onClick={() => switchTab('pro')}
              className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                tab === 'pro' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Espace Professionnel
            </button>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {tab === 'patient' ? 'Connexion Patient' : 'Accès Professionnel'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {tab === 'patient' ? 'Accédez à votre dossier médical.' : 'Authentification réservée au corps médical.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm outline-none ring-blue-600/20 transition focus:border-blue-500 focus:ring-4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm outline-none ring-blue-600/20 transition focus:border-blue-500 focus:ring-4"
                required
              />
            </div>
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          {tab === 'patient' && (
            <p className="mt-6 text-center text-sm text-slate-600">
              Pas encore inscrit(e) ?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                Créer un compte
              </Link>
            </p>
          )}

          <p className="mt-10 text-center text-sm text-slate-500">
            <Link to="/" className="font-medium text-blue-600 hover:text-blue-700">
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
