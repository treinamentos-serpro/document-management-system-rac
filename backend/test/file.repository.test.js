const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const FileRepository = require('../src/repositories/file.repository');

test('mantém o arquivo dentro do diretório de storage', () => {
  const repository = new FileRepository('/tmp/dms-storage');

  assert.strictEqual(repository.getPath('document-id'), path.resolve('/tmp/dms-storage/document-id'));
  assert.throws(() => repository.getPath('../outside'), /Nome de arquivo inválido/);
  assert.throws(() => repository.getPath('/outside'), /Nome de arquivo inválido/);
});

test('remove um arquivo inexistente sem falhar', () => {
  const repository = new FileRepository('/tmp/dms-storage');

  assert.doesNotThrow(() => repository.remove('missing-document'));
});