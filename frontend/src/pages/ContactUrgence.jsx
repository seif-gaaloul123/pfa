import React from 'react';

export default function ContactUrgence() {
  return (
    <div className="p-8 lg:p-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900">Contact &amp; Urgence</h1>
        <p className="mt-1 text-sm text-slate-600">
          Coordonnées de la clinique et numéros d'urgence.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Téléphone principal */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Téléphone Clinique</h2>
            <a
              href="tel:+21671000000"
              className="mt-2 inline-block text-xl font-bold text-blue-600 hover:text-blue-700 transition"
            >
              +216 71 000 000
            </a>
            <p className="mt-1 text-xs text-slate-500">Disponible 7j/7 — 8h à 20h</p>
          </div>

          {/* Urgences */}
          <div className="rounded-2xl border border-red-100 bg-red-50/30 p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Urgences</h2>
            <a
              href="tel:190"
              className="mt-2 inline-block text-xl font-bold text-red-600 hover:text-red-700 transition"
            >
              190 (SAMU)
            </a>
            <p className="mt-1 text-xs text-slate-500">Service d'aide médicale urgente — 24h/24</p>
          </div>
        </div>

        {/* Adresse & email */}
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Adresse</h3>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Clinique MedERP<br />
                Avenue Habib Bourguiba<br />
                1000 Tunis, Tunisie
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Email</h3>
              <a
                href="mailto:contact@clinique.tn"
                className="mt-1 inline-block text-sm text-blue-600 hover:text-blue-700 transition"
              >
                contact@clinique.tn
              </a>
              <h3 className="mt-4 text-sm font-semibold text-slate-700">Horaires</h3>
              <p className="mt-1 text-sm text-slate-600">Lun–Sam : 8h00 – 18h00</p>
            </div>
          </div>
        </div>

        {/* Google Map placeholder */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="bg-slate-100 p-1">
            <iframe
              title="Localisation Clinique MedERP"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12774.230607085178!2d10.1658!3d36.8065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd337f5e7ef543%3A0xd671924e714a0275!2sTunis!5e0!3m2!1sfr!2stn!4v1"
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
