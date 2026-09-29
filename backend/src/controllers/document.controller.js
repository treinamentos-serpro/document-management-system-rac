class DocumentController {
  constructor({ service }) {
    this.service = service;
  }

  upload = (req, res) => {
    try {
      const document = this.service.createDocument({
        file: req.file,
        owner: req.header('x-user-id') || 'anonymous',
      });
      res.status(201).json(this.publicDocument(document));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  list = (req, res) => {
    const owner = req.header('x-user-id') || 'anonymous';
    res.json(this.service.listDocuments(owner).map((document) => this.publicDocument(document)));
  };

  download = (req, res) => {
    const owner = req.header('x-user-id') || 'anonymous';
    const result = this.service.getDownload(req.params.id, owner);
    if (!result) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    return res.download(result.path, result.document.originalName);
  };

  publicDocument(document) {
    const { filename, ...publicDocument } = document;
    return publicDocument;
  }
}

module.exports = DocumentController;
