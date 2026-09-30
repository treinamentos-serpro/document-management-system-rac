const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { mkdtemp, rm } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

test('endpoints de documentos', async (t) => {
  const storagePath = await mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  const previousStoragePath = process.env.STORAGE_PATH;
  process.env.STORAGE_PATH = storagePath;
  const app = require('../src/app');
  if (previousStoragePath === undefined) {
    delete process.env.STORAGE_PATH;
  } else {
    process.env.STORAGE_PATH = previousStoragePath;
  }

  const server = app.listen(0);
  await once(server, 'listening');
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await rm(storagePath, { recursive: true, force: true });
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  let document;

  await t.test('upload exige arquivo e retorna metadados públicos', async () => {
    const missing = await fetch(`${baseUrl}/upload`, { method: 'POST', headers: { 'x-user-id': 'user-1' } });
    assert.equal(missing.status, 400);
    assert.deepEqual(await missing.json(), { error: 'Arquivo é obrigatório' });

    const form = new FormData();
    form.append('file', new Blob(['conteúdo de teste'], { type: 'text/plain' }), 'relatorio.txt');
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'x-user-id': 'user-1' },
      body: form,
    });
    assert.equal(response.status, 201);
    document = await response.json();
    assert.match(document.id, /^[0-9a-f-]{36}$/);
    assert.equal(document.originalName, 'relatorio.txt');
    assert.equal(document.size, Buffer.byteLength('conteúdo de teste'));
    assert.equal(document.owner, 'user-1');
    assert.ok(!Number.isNaN(Date.parse(document.uploadedAt)));
    assert.equal(document.filename, undefined);
  });

  await t.test('listagem inclui somente documentos do usuário', async () => {
    const own = await fetch(`${baseUrl}/documents`, { headers: { 'x-user-id': 'user-1' } });
    assert.equal(own.status, 200);
    assert.deepEqual(await own.json(), [document]);

    const other = await fetch(`${baseUrl}/documents`, { headers: { 'x-user-id': 'user-2' } });
    assert.equal(other.status, 200);
    assert.deepEqual(await other.json(), []);
  });

  await t.test('download entrega o arquivo apenas ao dono e retorna 404 para outros IDs', async () => {
    const url = `${baseUrl}/documents/${document.id}/download`;
    const response = await fetch(url, { headers: { 'x-user-id': 'user-1' } });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-disposition'), /relatorio\.txt/);
    assert.equal(await response.text(), 'conteúdo de teste');

    const denied = await fetch(url, { headers: { 'x-user-id': 'user-2' } });
    assert.equal(denied.status, 404);
    const missing = await fetch(`${baseUrl}/documents/inexistente/download`, {
      headers: { 'x-user-id': 'user-1' },
    });
    assert.equal(missing.status, 404);
  });
});
