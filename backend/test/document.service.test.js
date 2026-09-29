const { test } = require('node:test');
const assert = require('node:assert/strict');
const DocumentService = require('../src/services/document.service');

function createService() {
  const documents = new Map();
  return new DocumentService({
    repository: {
      save(document) {
        documents.set(document.id, document);
        return document;
      },
      findAll() {
        return [...documents.values()];
      },
      findById(id) {
        return documents.get(id);
      },
    },
    fileRepository: {
      getPath(filename) {
        return `/storage/${filename}`;
      },
    },
    idGenerator: () => 'document-id',
    clock: () => new Date('2026-01-01T00:00:00.000Z'),
  });
}

test('cria metadados do documento sem expor o nome interno do arquivo', () => {
  const service = createService();
  const document = service.createDocument({
    file: { originalname: 'relatorio.pdf', filename: 'document-id', size: 42 },
    owner: 'user-1',
  });

  assert.deepStrictEqual(document, {
    id: 'document-id',
    originalName: 'relatorio.pdf',
    size: 42,
    uploadedAt: '2026-01-01T00:00:00.000Z',
    owner: 'user-1',
    filename: 'document-id',
  });
  assert.deepStrictEqual(service.listDocuments('user-1').map(({ filename, ...value }) => value), [{
    id: 'document-id',
    originalName: 'relatorio.pdf',
    size: 42,
    uploadedAt: '2026-01-01T00:00:00.000Z',
    owner: 'user-1',
  }]);
});

test('rejeita upload sem arquivo e restringe download ao dono', () => {
  const service = createService();

  assert.throws(() => service.createDocument({ owner: 'user-1' }), /Arquivo é obrigatório/);
  service.createDocument({
    file: { originalname: 'relatorio.pdf', filename: 'document-id', size: 42 },
    owner: 'user-1',
  });

  assert.strictEqual(service.getDownload('document-id', 'user-2'), null);
  assert.deepStrictEqual(service.getDownload('document-id', 'user-1'), {
    document: {
      id: 'document-id',
      originalName: 'relatorio.pdf',
      size: 42,
      uploadedAt: '2026-01-01T00:00:00.000Z',
      owner: 'user-1',
      filename: 'document-id',
    },
    path: '/storage/document-id',
  });
});
