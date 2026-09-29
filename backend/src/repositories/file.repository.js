const path = require('node:path');
const fs = require('node:fs');

class FileRepository {
  constructor(storagePath) {
    this.storagePath = storagePath;
  }

  getPath(filename) {
    const storagePath = path.resolve(this.storagePath);
    const filePath = path.resolve(storagePath, filename);
    const relativePath = path.relative(storagePath, filePath);
    if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      const error = new Error('Nome de arquivo inválido');
      error.statusCode = 400;
      throw error;
    }
    return filePath;
  }

  remove(filename) {
    try {
      fs.unlinkSync(this.getPath(filename));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

module.exports = FileRepository;
