# isite Examples For AI Agents

Use these recipes when generating code for this library.

## Minimal Server

```js
var isite = require('isite');
var site = isite({ port: 8080 });

site.run();
```

## Static HTML Route

```js
site.onGET({
  name: '/',
  path: site.dir + '/html/index.html',
  parser: 'html',
  compress: true,
  cache: true
});
```

## JSON API Route

```js
site.onGET('/api/status', function (req, res) {
  res.json({
    done: true,
    time: site.getDateTime()
  });
});
```

## Dynamic Route Parameters

```js
site.onGET('/post/:id/category/:cat_id', function (req, res) {
  res.json({
    id: req.params.id,
    category: req.params.cat_id,
    rawId: req.paramsRaw.id
  });
});
```

## Read And Render A Site File

```js
site.onGET('/profile', function (req, res) {
  res.render('profile.html', {
    user: req.session.user
  }, {
    parser: 'html',
    compress: true
  });
});
```

## Collection CRUD

```js
var employees = site.connectCollection('employees');

site.onPOST('/api/employees/add', function (req, res) {
  employees.insertOne(req.body, function (err, doc) {
    res.json({ done: !err, error: err, doc: doc });
  });
});

site.onPOST('/api/employees/all', function (req, res) {
  employees.findMany({
    where: req.body.where || {},
    select: req.body.select || {},
    sort: { id: -1 },
    limit: 50
  }, function (err, docs, count) {
    res.json({ done: !err, error: err, list: docs, count: count });
  });
});
```

## Update By ID

```js
site.onPOST('/api/employees/update', function (req, res) {
  employees.updateOne({
    where: { id: req.body.id },
    set: req.body
  }, function (err, result) {
    res.json({ done: !err, error: err, result: result });
  });
});
```

## Delete By ID

```js
site.onPOST('/api/employees/delete', function (req, res) {
  employees.deleteOne({
    where: { id: req.body.id }
  }, function (err, result) {
    res.json({ done: !err, error: err, result: result });
  });
});
```

## Upload File

```js
site.onPOST('/uploadFile', function (req, res) {
  var response = { done: true };
  var file = req.files.fileToUpload;
  var newPath = site.options.upload_dir + '/' + file.originalFilename;

  site.mv(file.filepath, newPath, function (err) {
    if (err) {
      response.done = false;
      response.error = err;
    }
    res.json(response);
  });
});
```

## Download File

```js
site.onGET('/files/report.pdf', function (req, res) {
  res.download(site.options.download_dir + '/report.pdf', 'report.pdf');
});
```

## WebSocket Route

```js
site.onWS('/chat', function (client) {
  client.onMessage = function (message) {
    if (message.type === 'connected') {
      client.send({ type: 'ready' });
    }
  };
});
```

## Custom App

```js
// apps/tasks/app.js
module.exports = function (site) {
  var tasks = site.connectCollection('tasks');

  site.onGET('/tasks', function (req, res) {
    res.render('tasks.html', {}, { parser: 'html' });
  });

  site.onPOST('/api/tasks/all', function (req, res) {
    tasks.findMany({ where: {} }, function (err, docs, count) {
      res.json({ done: !err, list: docs, count: count });
    });
  });
};
```

## Events

```js
site.on('task created', function (task) {
  site.log('Task created: ' + task.title);
});

site.call('task created', { title: 'Write docs' });
```

## Server-Side HTML Tags

```html
<div x-import="navbar.html"></div>
<h1>##var.siteName##</h1>
<label>##word.user_name##</label>
<div x-permission="admin">Admin content</div>
<div x-feature="login">Logged in content</div>
```

