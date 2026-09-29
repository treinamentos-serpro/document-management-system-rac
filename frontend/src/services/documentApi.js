const API_BASE = '/api';

async function request(path, owner, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...options.headers, 'X-User-Id': owner },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Não foi possível concluir a operação (${response.status}).`);
  }

  return response;
}

export async function listDocuments(owner) {
  const response = await request('/documents', owner);
  return response.json();
}

export async function uploadDocument(owner, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', owner, { method: 'POST', body: formData });
  return response.json();
}

export async function downloadDocument(owner, documentId) {
  const response = await request(`/documents/${encodeURIComponent(documentId)}/download`, owner);
  return response.blob();
}