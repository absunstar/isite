module.exports = function init(site) {
  site.post('api/db/import', (req, res) => {
    const $collection = site.connectCollection(req.body.collectionName);
    if (site.isFileExistsSync(req.body.file)) {
      const docs = site.fromJson(site.readFileSync(req.body.file).toString());
      $collection.addOne(docs, () => res.json({ done: true }));
    }
  });
  site.get('api/db/export', (req, res) => {
    site.connectCollection('users').findMany({ where: {} }, (err, docs) => {
      site.writeFile('/tmp/export.json', JSON.stringify(docs), () => res.download('/tmp/export.json'));
    });
  });
  site.post('api/db/deleteAll', (req, res) => {
    let $collection = site.connectCollection('users');
    $collection.removeMany({ where: {} }, () => res.json({ done: true }));
  });
};
