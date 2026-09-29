class DocumentController {
  constructor({ service }) {
    this.service = service;
  }

  upload = (req, res, next) => {
    try {
      const document = this.service.createDocument({
        file: req.file,
        owner: req.owner,
      });
      res.status(201).json(this.publicDocument(document));
    } catch (error) {
      next(error);
    }
  };

  list = (req, res, next) => {
    try {
      res.json(this.service.listDocuments(req.owner).map((document) => this.publicDocument(document)));
    } catch (error) {
      next(error);
    }
  };

  download = (req, res, next) => {
    try {
      const result = this.service.getDownload(req.params.id, req.owner);
      if (!result) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }

      return res.download(result.path, result.document.originalName, (error) => {
        if (!error || res.headersSent) return;
        if (error.code === 'ENOENT') {
          return res.status(404).json({ error: 'Arquivo não encontrado' });
        }
        return next(error);
      });
    } catch (error) {
      return next(error);
    }
  };

  publicDocument(document) {
    const { filename, ...publicDocument } = document;
    return publicDocument;
  }
}

module.exports = DocumentController;
