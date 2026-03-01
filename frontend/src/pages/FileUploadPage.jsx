import React, { useState } from 'react';
import api from '../api';

export default function FileUploadPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Choisis un fichier');
      return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setError('Erreur lors de l’upload du fichier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload de fichiers</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Fichier (PDF, image, ...)
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>

      {result && (
        <div className="card">
          <h3>Résultat</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
