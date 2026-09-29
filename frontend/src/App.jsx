import { useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import { listDocuments } from './services/documentApi.js';
import './App.css';

function DocumentWorkspace({ owner }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    listDocuments(owner)
      .then((items) => {
        if (!cancelled) setDocuments(items);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [owner, revision]);

  const refresh = () => setRevision((current) => current + 1);

  return (
    <div className="workspace">
      <UploadComponent owner={owner} onUploaded={refresh} />
      <DocumentList
        owner={owner}
        documents={documents}
        loading={loading}
        error={error}
        onRetry={refresh}
      />
    </div>
  );
}

export default function App() {
  const [userId, setUserId] = useState('');
  const [owner, setOwner] = useState('');

  function selectOwner(event) {
    event.preventDefault();
    setOwner(userId.trim());
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <span className="brand-mark" aria-hidden="true">D</span>
        <div>
          <p className="eyebrow">ARQUIVO DIGITAL</p>
          <h1>Documentos</h1>
        </div>
      </header>

      <section className="identity-section" aria-labelledby="identity-title">
        <div>
          <h2 id="identity-title">Seu espaço</h2>
          <p>Informe seu identificador para consultar seus documentos.</p>
        </div>
        <form className="identity-form" onSubmit={selectOwner}>
          <label htmlFor="user-id">Identificador do usuário</label>
          <div className="identity-controls">
            <input
              id="user-id"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              autoComplete="username"
              required
            />
            <button type="submit" disabled={!userId.trim()}>Acessar</button>
          </div>
        </form>
      </section>

      {owner ? (
        <DocumentWorkspace key={owner} owner={owner} />
      ) : (
        <section className="welcome-state" aria-live="polite">
          <h2>Pronto para começar</h2>
          <p>Seus arquivos aparecem aqui depois que você informa um identificador.</p>
        </section>
      )}
    </main>
  );
}
