const { randomUUID } = require('node:crypto');

class DocumentService {
  constructor({ repository, fileRepository, idGenerator = randomUUID, clock = () => new Date() }) {
    this.repository = repository;
    this.fileRepository = fileRepository;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  createDocument({ file, owner = 'anonymous' }) {
    if (!file) {
      throw new Error('Arquivo é obrigatório');
    }

    const document = {
      id: this.idGenerator(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: this.clock().toISOString(),
      owner,
      filename: file.filename,
    };

    return this.repository.save(document);
  }

  listDocuments(owner) {
    const documents = this.repository.findAll();
    return owner ? documents.filter((document) => document.owner === owner) : documents;
  }

  getDownload(id, owner) {
    const document = this.repository.findById(id);
    if (!document || (owner && document.owner !== owner)) {
      return null;
    }

    return {
      document,
      path: this.fileRepository.getPath(document.filename),
    };
  }
}

module.exports = DocumentService;
