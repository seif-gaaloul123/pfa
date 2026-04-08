import React from 'react';
import { Link } from 'react-router-dom';

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/80">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 shadow-sm">
            Clinique — Tunisie
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            <span className="text-blue-600">MedERP</span>
            <span className="text-slate-800"> · Clinique</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Plateforme de gestion : rendez-vous, dossiers patients et documents — interface
            professionnelle.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-3xl gap-6 md:grid-cols-2">
          <Link
            to="/register"
            className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card-md transition hover:border-blue-200 hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25 transition group-hover:scale-105">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Accès Patient</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              Inscription patient et réservation en ligne — créneaux médecins de la clinique.
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600">
              Continuer
              <span className="ml-1 transition group-hover:translate-x-1">→</span>
            </span>
          </Link>

          <Link
            to="/login"
            className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card-md transition hover:border-slate-300 hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition group-hover:scale-105">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Accès Professionnel</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              Tableau de bord médecin, salle d’attente, dossiers et coffre documentaire.
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-slate-800">
              Connexion staff
              <span className="ml-1 transition group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>

        <p className="mt-12 text-center text-xs text-slate-400">
          Données de santé — traitement conforme aux usages locaux.
        </p>
      </div>
    </div>
  );
}
