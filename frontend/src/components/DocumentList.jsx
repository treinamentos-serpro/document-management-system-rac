import DownloadButton from './DownloadButton.jsx';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ owner, documents, loading, error, onRetry }) {
  return (
    <section className="documents-section" aria-labelledby="documents-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">BIBLIOTECA / {owner}</p>
          <h2 id="documents-title">Meus documentos</h2>
        </div>
        {!loading && !error && <span className="document-count">{documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}</span>}
      </div>

      {loading ? (
        <p className="list-state" role="status">Carregando documentos...</p>
      ) : error ? (
        <div className="list-state" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={onRetry}>Tentar novamente</button>
        </div>
      ) : documents.length === 0 ? (
        <p className="list-state">Nenhum documento enviado ainda.</p>
      ) : (
        <div className="document-table-wrap">
          <table className="document-table">
            <thead>
              <tr><th scope="col">Nome</th><th scope="col">Tamanho</th><th scope="col">Enviado em</th><th scope="col"><span className="sr-only">Ações</span></th></tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td className="filename">{document.originalName}</td>
                  <td>{formatSize(document.size)}</td>
                  <td>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(document.uploadedAt))}</td>
                  <td><DownloadButton owner={owner} document={document} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}