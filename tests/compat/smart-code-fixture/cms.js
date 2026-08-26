const site = require('../isite')({ port: 8080 });
site.get('/', (req, res) => {
  if (req.host.like('*cms*')) req.session.lang = 'Ar';
  const value = site.fromJson('{"ok":true}');
  site.callRoute('/category/:id', req, res);
  res.render('theme1/index.html', value, { parser: 'html css js' });
});
