// Servidor backend do Document Management System.
//
// Camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const fs = require('node:fs');
const multer = require('multer');
const path = require('node:path');
const DocumentRepository = require('./repositories/document.repository');
const FileRepository = require('./repositories/file.repository');
const DocumentService = require('./services/document.service');
const DocumentController = require('./controllers/document.controller');
const createDocumentRouter = require('./routes/document.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const storagePath = process.env.STORAGE_DIR || process.env.STORAGE_PATH || path.resolve(__dirname, '../storage');
const maxFileSize = Number(process.env.MAX_FILE_SIZE_BYTES ?? 10 * 1024 * 1024);

if (!Number.isSafeInteger(maxFileSize) || maxFileSize <= 0) {
  throw new Error('MAX_FILE_SIZE_BYTES deve ser um inteiro positivo');
}

fs.mkdirSync(storagePath, { recursive: true });

const documentService = new DocumentService({
  repository: new DocumentRepository(),
  fileRepository: new FileRepository(storagePath),
});
const documentController = new DocumentController({ service: documentService });

app.use(express.json());
app.use(createDocumentRouter({ controller: documentController, storagePath, maxFileSize }));

// Endpoint de verificação de saúde.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'O arquivo excede o tamanho máximo permitido.' });
    }
    return res.status(400).json({ error: 'Falha no upload do arquivo.' });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
