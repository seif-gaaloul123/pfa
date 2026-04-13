import React from 'react';

const mockDocuments = [
  {
    id: 1,
    name: 'Ordonnance_Mars_2026.pdf',
    date: '15/03/2026',
    type: 'Ordonnance',
    size: '124 Ko'
  },
  {
    id: 2,
    name: 'Bilan_Sanguin_Fevrier.pdf',
    date: '22/02/2026',
    type: 'Analyse',
    size: '256 Ko'
  },
  {
    id: 3,
    name: 'Certificat_Medical_2026.pdf',
    date: '10/01/2026',
    type: 'Certificat',
    size: '89 Ko'
  }
];

export default function MesDocuments() {
  return (
    <div className="p-8 lg:p-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900">Mes Documents</h1>
        <p className="mt-1 text-sm text-slate-600">
          Coffre-fort numérique — retrouvez vos ordonnances, analyses et certificats.
        </p>

        <div className="mt-8 space-y-4">
          {mockDocuments.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{doc.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {doc.type} · {doc.date}
                </p>
              </div>

              {/* Size & action */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{doc.size}</span>
                <button
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => alert(`Téléchargement de ${doc.name} (démo)`)}
                >
                  Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4 text-sm text-blue-800">
          <strong>Note :</strong> Les documents affichés sont des données de démonstration.
          En production, ils seront générés et stockés de manière sécurisée.
        </div>
      </div>
    </div>
  );
}
