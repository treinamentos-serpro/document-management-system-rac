import { useState } from 'react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ owner, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || uploading) return;

    const form = event.currentTarget;
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await uploadDocument(owner, file);
      form.reset();
      setFile(null);
      setSuccess('Arquivo enviado com sucesso.');
      onUploaded();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">NOVO DOCUMENTO</p>
          <h2 id="upload-title">Enviar arquivo</h2>
        </div>
      </div>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label htmlFor="document-file">Selecione um arquivo</label>
        <input
          id="document-file"
          type="file"
          required
          disabled={uploading}
          onChange={(event) => {
            setFile(event.target.files[0] || null);
            setError('');
            setSuccess('');
          }}
        />
        <button type="submit" disabled={!file || uploading}>
          {uploading ? 'Enviando...' : 'Enviar arquivo'}
        </button>
      </form>
      {error && <p className="message error" role="alert">{error}</p>}
      {success && <p className="message success" role="status">{success}</p>}
    </section>
  );
}