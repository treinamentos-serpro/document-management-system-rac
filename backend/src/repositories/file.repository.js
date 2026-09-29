const path = require('node:path');

class FileRepository {
  constructor(storagePath) {
    this.storagePath = storagePath;
  }

  getPath(filename) {
    return path.join(this.storagePath, filename);
  }
}

module.exports = FileRepository;
