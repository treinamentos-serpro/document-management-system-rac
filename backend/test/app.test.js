const { test, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');

let server;

function request(path, options = {}) {
  return fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
}

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('rejeita operações sem X-User-Id', async () => {
  const response = await request('/documents');

  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(await response.json(), { error: 'O header X-User-Id é obrigatório.' });
});
