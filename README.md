# Features

        - Auto Routes [simple & Advanced]  
        - Handle Request & Response Headers [Cookies - Query Strings]
        - Auto Detect & Configer User Session  
        - Easy Creating Master Pages
        - Compain Multi Files Contents in One Route
        - Auto Caching Files in Memory 
        - Fast Read Files Content [Site Folder Structure]
        - Custom Html Attributes [imports]
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

```html
<h2 x-import="welcome.html"></h2>
```
Page "welcome.html" Must Be In HTML Site Dir ['/site_files/html/welcome.html']

- Dynamic Varibles Sets

```js
site.addVar('siteName', 'First Site With Isite Library ');
site.addVar('siteBrand', 'XSite');
```
```html
<title>##var.siteName##</title>
<h2>##var.siteBrand##</h2>
```

## More

- Email    : Absunstar@gmail.com
- Github   : https://github.com/absunstar/
- Linkedin : https://www.linkedin.com/in/absunstar/