const { randomUUID } = require('node:crypto');

class DocumentService {
  constructor({ repository, fileRepository, idGenerator = randomUUID, clock = () => new Date() }) {
    this.repository = repository;
    this.fileRepository = fileRepository;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  createDocument({ file, owner }) {
    if (!file) {
      const error = new Error('Arquivo é obrigatório');
      error.statusCode = 400;
      throw error;
    }
    if (!owner || !owner.trim()) {
      const error = new Error('O proprietário é obrigatório');
      error.statusCode = 400;
      throw error;
    }

    const document = {
      id: this.idGenerator(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: this.clock().toISOString(),
      owner,
      filename: file.filename,
    };

    try {
      return this.repository.save(document);
    } catch (error) {
      this.fileRepository.remove?.(file.filename);
      throw error;
    }
  }

  listDocuments(owner) {
    if (!owner || !owner.trim()) {
      const error = new Error('O proprietário é obrigatório');
      error.statusCode = 400;
      throw error;
    }
    return this.repository.findAll().filter((document) => document.owner === owner);
  }

  getDownload(id, owner) {
    if (!owner || !owner.trim()) {
      const error = new Error('O proprietário é obrigatório');
      error.statusCode = 400;
      throw error;
    }
    const document = this.repository.findById(id);
    if (!document || document.owner !== owner) {
      return null;
    }

    return {
      document,
      path: this.fileRepository.getPath(document.filename),
    };
  }
}

module.exports = DocumentService;
