import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('dr.anis.belhaj@clinique.tn');
  const [password, setPassword] = useState('doctor123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Identifiants invalides. Vérifiez votre compte personnel médical.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-12 text-white lg:flex">
        <div>
          <div className="text-sm font-semibold uppercase tracking-widest text-blue-200/90">
            MedERP — Tunis
          </div>
          <h1 className="mt-8 max-w-md text-4xl font-bold leading-tight">
            Connexion personnel soignant
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-blue-100/90">
            Accès réservé aux médecins et au personnel autorisé de la clinique. Les patients
            s’inscrivent depuis l’accueil public (Prendre RDV).
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-sm text-blue-50/90">
            Compte de démonstration :{' '}
            <span className="font-mono text-white">dr.anis.belhaj@clinique.tn</span> · mot de passe{' '}
            <span className="font-mono text-white">doctor123</span>
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Accès professionnel</h2>
          <p className="mt-1 text-sm text-slate-500">
            Authentification réservée au corps médical et aux comptes staff.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email professionnel</label>
              <input
                type="email"
                autoComplete="username"
                placeholder="dr.anis.belhaj@clinique.tn"
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

          <p className="mt-10 text-center text-sm text-slate-500">
            <Link to="/welcome" className="font-medium text-blue-600 hover:text-blue-700">
              ← Retour à l’accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
