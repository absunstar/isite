# Features

        - Auto Routes [simple & Advanced]  
        - Handle Response Headers  
        - Auto Configer Request Cookies & Query Strings  
        - Detect User Session  
        - Auto Caching Files  
        - MD5 Hash Function  

## Installation

`npm install isite --save`


## Using

```js
var isite = require('isite')
var site = isite() // default port 80

site.run()
```
Advanced Using

```js
var isite = require('isite')
var site = isite({
    port:8080 , 
    dir:__dirname + '/site_files'
    })

site.run()
```


## Routes

Easy Site Routing

```js
site.addRoute({name: '/js/jquery.js',path:  './js/jquery.min.js'});
site.addRoute({name: '/js/bootstrap.js',path:  './js/bootstrap.min.js'});
site.addRoute({name: '/css/bootstrap.css',path:  './css/bootstrap.min.css'});
site.addRoute({name: '/',path:  './index.html'});
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

## Sessions

```
site.get('/login', function(req, res) {
    req.session.set('username', 'amr barakat')
    res.end('loged ok !! ')
})

site.get('/userInfo', function(req, res) {
    var userName = req.session.get('username')
    res.end(userName)
})
```
## More

Email : Absunstar@gmail.com
Github : https://github.com/absunstar/
Linkedin : https://www.linkedin.com/in/absunstar/