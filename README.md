Isite Help You To Create Your Node Js WebSite with Advanced Development Featuers

# Features

        - Auto Routes [Simple & Advanced & Custom]  
        - Merge Multi Files Contents in One Route
        - Auto Handle Request & Response Headers [Cookies - Parameters]
        - Auto Detect & Configer User Session  
        - Easy Creating Master Pages
        - Auto Caching & Management Files in Memory 
        - Fast Read Files Content [Site Folder Structure]
        - Custom Html Attributes [Server Tags]
        - MD5 Hash Function  

## Installation

`npm install isite --save`


## Using

```js
var isite = require('isite')
var site = isite() // default port = 80 & dir = ./site_files

site.run()
```
Advanced Using

```js
var isite = require('isite')
var site = isite({
    port:8080 , 
    dir:__dirname + '/site_files' //folder contains site files structure
    })

site.run()
```


## Routes

Easy and Auto Site Routing

```js
site.addRoute({name: '/css/bootstrap.css',path:  site.dir + '/css/bootstrap.min.css'});
site.addRoute({
    name: '/js/script.js',
    path: [site.dir + '/js/jquery.js' , site.dir + '/js/bootstrap.js']
});
site.addRoute({name: '/',path:  site.dir + '/html/index.html'});
site.addRoute({name: '/api',path:  site.dir + '/json/employees.json' , method:'POST'});
```

Advanced Site Routing

```js
site.addRoute({
    name: '/',
    callback: function (req, res) {
        res.setHeader('Content-type', 'text/html');
        res.writeHead(200);
        site.html('index', function (err, content) {
            res.end(content);
        });
    }
});

site.addRoute({
    name: '/api',
    method: 'POST',
    callback: function (req, res) {
        res.setHeader('Content-type', 'application/json');
        res.writeHead(200);
        site.json('index', function (err, content) {
            res.end(content);
        });
    }
});

```

Custom Route - Using * [any letters]

```js
site.get('/post/*', function(req, res) {
    res.end('Any Route like /post/11212154545 ')
})
site.get('*', function(req, res) {
    res.end('Any Route Requested Not Handled Before This Code')
})
```

Request Parameters [GET , POST | PUT | Delete]

```js
site.get('/api', function(req, res) {
    res.end('GET | id : ' + req.url.query.id)
})
site.post('/api', function(req, res) {
    res.end('POST | id : ' + req.body.id + ' , Name : ' + req.body.name)
})
site.put('/api', function(req, res) {
    res.end('PUT | id : ' + req.body.id + ' , Name : ' + req.body.name)
})
site.delete('/api', function(req, res) {
    res.end('Delete | id : ' + req.body.id)
})
site.all('/api', function(req, res) {
    res.end('Any Request Type Not Handled : ' + req.method)
})
```
Dynamic Parameters

```js
site.get('/api/:post_id/category/:cat_id', function(req, res) {
    res.end('GET | postId : ' + req.url.query.post_id + ', catId : ' + req.url.query.cat_id)
})
//Example : http://127.0.0.1:7070/api/123456/category/99
```
MVC Custom Route
```js
site.get("/:controller/:action/:arg1/:arg2", function(req, res) {
    res.end(
        "GET | Controller : " +
        req.url.query.controller +
        ", Action : " +
        req.url.query.action +
        ", Arg 1 : " +
        req.url.query.arg1 +
        ", Arg 2 : " +
        req.url.query.arg2
    );
});
```

## Cookies

```js
site.get('/api/set' , function(req , res){
    req.cookie.set('id' , 'userid')
      res.end('cookie set ok !!')
})

site.get('/api/get' , function(req , res){
      res.end(' id : ' + req.cookie.get('id'))
})
```

## Sessions

```js
site.get('/login', function(req, res) {
    req.session.set('username', 'amr barakat')
    res.end('loged ok !! ')
})

site.get('/userInfo', function(req, res) {
    var userName = req.session.get('username')
    res.end(userName)
})
```
## Site Folder Structure

- Create Folder Name "site_files" ,
inside it create these Sub folders [
    html , css , js , json
]
- To Easy Read File Contents From "site_files" Folder

```js
site.html('index', function (err, content) {
console.log(content);
});
site.css('bootstrap', function (err, content) {
console.log(content);
});
site.js('jquery', function (err, content) {
console.log(content);
});
site.json('items', function (err, content) {
console.log(content);
});
```
## MasterPages

add Custom Master Page And Using it ..

```js

site.addMasterPage({
    name: 'masterPage1',
    header: site.dir + '/html/header.html',
    footer: site.dir + '/html/footer.html'
})

site.get({
    name: '/ContactUs',
    masterPage : 'masterPage1',
    path: site.dir + '/html/contact.html',
    parser: 'html'
});

```

## Server Tags & Attributes

Add Custom Html Content
```js
site.addRoute({name: '/',path:  site.dir + '/html/index.html' , parser:'html'});
```
```html
<div x-import="navbar.html"></div>

<div class="container">
    <h2 > ... </h2>
    <p x-import="info.html"></p>
</div>
```
Page "navbar.html" & "info.html" Must Be In HTML Site Folder ['/site_files/html/']

- Dynamic Varibles Sets

```js
site.addVar('siteName', 'First Site With Isite Library ');
site.addVar('siteBrand', 'XSite');
```
```html
<title>##var.siteName##</title>
<h2>##var.siteBrand##</h2>
```

## MD5
```js
site.md5('this content will be hashed as md5')
```
## More

- Email    : Absunstar@gmail.com
- Github   : https://github.com/absunstar/
- Linkedin : https://www.linkedin.com/in/absunstar/