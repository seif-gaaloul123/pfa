import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api';

function classifyVault(f) {
  const n = `${f.originalName || ''} ${f.storedName || ''}`.toLowerCase();
  const isImage = /\.(png|jpg|jpeg|webp|gif|bmp|tiff?|dcm)$/.test(n);
  const isPdf = /\.pdf$/.test(n);
  if (isImage || n.includes('radio') || n.includes('rx') || n.includes('scanner') || n.includes('irm')) {
    return 'radio';
  }
  if (isPdf || n.includes('analyse') || n.includes('bio') || n.includes('labo') || n.includes('nfs') || n.includes('crp')) {
    return 'lab';
  }
  if (isPdf) return 'lab';
  if (isImage) return 'radio';
  return 'other';
}

function FileCard({ f, accent }) {
  const border = accent === 'radio' ? 'hover:border-sky-300' : 'hover:border-emerald-300';
  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-card transition ${border} hover:shadow-card-md`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
          accent === 'radio' ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        {accent === 'radio' ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
      </div>
      <div className="mt-3 flex-1 truncate text-sm font-semibold text-slate-900" title={f.originalName}>
        {f.originalName || f.storedName}
      </div>
      <div className="mt-2 text-xs text-slate-500">
        {(f.size / 1024).toFixed(1)} Ko ·{' '}
        {f.updatedAt ? new Date(f.updatedAt).toLocaleDateString('fr-FR') : '—'}
      </div>
    </div>
  );
}

export default function FilesVaultPage() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data || []);
    } catch {
      setError('Impossible de lister les documents.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { radios, labs, autres } = useMemo(() => {
    const radios = [];
    const labs = [];
    const autres = [];
    for (const f of files) {
      const c = classifyVault(f);
      if (c === 'radio') radios.push(f);
      else if (c === 'lab') labs.push(f);
      else autres.push(f);
    }
    return { radios, labs, autres };
  }, [files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Choisissez un fichier.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Fichier importé dans le coffre.');
      setFile(null);
      e.target.reset();
      await load();
    } catch {
      setError('Échec de l’upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Coffre documentaire</h1>
        <p className="mt-1 text-sm text-slate-600">
          Radiographies et analyses biologiques — classement automatique selon le nom de fichier
          (ex. <span className="font-medium">radio_</span>, <span className="font-medium">analyse_</span>,{' '}
          <span className="font-medium">.pdf</span> / images).
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card-md">
        <h2 className="text-sm font-semibold text-slate-800">Importer un document</h2>
        <p className="mt-1 text-xs text-slate-500">
          Déposez une radiographie (image) ou un compte-rendu d’analyses (PDF).
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Fichier
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 text-sm text-slate-600"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !file}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Envoi…' : 'Ajouter au coffre'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-3 text-sm text-emerald-700">{success}</p>}
      </div>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-200 to-sky-400" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-sky-900">Radiographies</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-sky-200 to-sky-400" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {radios.length === 0 ? (
            <p className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm text-slate-500">
              Aucune radiographie indexée. Importez une image ou un fichier dont le nom contient « radio »
              ou « rx ».
            </p>
          ) : (
            radios.map((f) => <FileCard key={f.storedName} f={f} accent="radio" />)
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200 to-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-900">
            Analyses biologiques
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-200 to-emerald-400" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {labs.length === 0 ? (
            <p className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm text-slate-500">
              Aucune analyse indexée. Importez un PDF ou un fichier dont le nom contient « analyse » ou «
              bio ».
            </p>
          ) : (
            labs.map((f) => <FileCard key={f.storedName} f={f} accent="lab" />)
          )}
        </div>
      </section>

      {autres.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold text-slate-800">Autres documents</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {autres.map((f) => (
              <FileCard key={f.storedName} f={f} accent="lab" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
