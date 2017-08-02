Isite Help You To Create Your Node Js WebSite with Advanced Development Featuers

# Features

        - Auto Routes [Simple & Advanced & Custom]
        - Auto Handle File Types Encoding [Fonts - Images - ...]  
        - Merge Multi Files Contents in One Route
        - Auto Handle Request & Response Headers [Cookies - Parameters]
        - Auto Detect & Configer User Session  
        - Easy Creating Master Pages
        - Auto Caching & Management Site Files in Memory 
        - Fast Read Files Content [Site Folder Structure]
        - Custom Html Attributes [Server Tags]
        - MongoDB Full Integration
        - Client libraries [jquery - bootstrap - font-awesome - angular]
        - Development Helper Function
        - Site Dynamic Events Callback  

## Installation

`npm install isite --save`


## Using

```js
var isite = require('isite')
var site = isite() 

site.run()
```
Advanced Using

```js
var isite = require('isite')
site = isite({
    port: 8080, // default 80
    dir: __dirname + '/site_files', //default ./site_files
    savingTime: 60 * 2, // default  60 - 1 hour
    sessionEnabled: true, // default true
    sessionTimeout: 60 * 6, // default 60 * 24 - 1 day
    mongodbEnabled: true, // default false
    mongodbURL: '127.0.0.1:27017' // default 127.0.0.1:27017 - local
});

site.run()
```
## Site Folder Structure

- Create Folder Name "site_files" ,
inside it create these Sub folders [
    html , css , js , json , fonts , images , xml , ...
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
site.xml('rss', function (err, content) {
    console.log(content);
});
```
-Custom Read Files

```js
//read file with custom header
site.get("/rss", function(req, res) {
    site.readFile(__dirname + "/site_files/xml/rss.xml", function(err, content) {
        res.writeHead(200, { "content-type": "text/xml" })
        res.end(content)
    })
})
site.get("/rss2", function(req, res) {
    site.xml("rss2", function(err, content) {
        res.writeHead(200, { "content-type": "text/xml" })
        res.end(content);
    })
})
//read multi files with custom header
site.get("/", function(req, res) {
    site.readFiles(
        [
            __dirname + "/site_files/html/head.html",
            __dirname + "/site_files/html/content.html",
            __dirname + "/site_files/html/footer.html"
        ],
        function(err, content) {
            res.writeHead(200, { "content-type": "text/html" });
            res.end(content);
        })
})

```
## Routes

- Auto Convert All Routes URL & Parameters to Lower Case .

Easy and Auto Site Routing

```js
site.get({name: '/',path:  site.dir + '/html/index.html'});
site.get({name: '/css/bootstrap.css',path:  site.dir + '/css/bootstrap.min.css'});
site.get({name: '/js/jquery.js',path: site.dir + '/js/jquery.js'});
site.get({name: '/js/bootstrap.js',path: site.dir + '/js/bootstrap.js'});
site.get({name: '/favicon.png',path: site.dir + '/images/logo.png'})
site.post({name: '/api',path:  site.dir + '/json/employees.json' , method:'POST'});
```
Merge Multi Files in one route

```js
site.get({
    name: '/css/style.css',
    path: [site.dir + '/css/bootstrap.css' , site.dir + '/css/custom.css']
});
site.get({
    name: '/js/script.js',
    path: [site.dir + '/js/jquery.js' , site.dir + '/js/bootstrap.js', site.dir + '/js/custom.js']
});
```
Advanced Site Routing

```js
site.addRoute({
    name: '/',
    method : 'GET', // defeault
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
    method: 'custom method',
    callback: function (req, res) {
        res.setHeader('Content-type', 'application/json');
        res.writeHead(200);
        site.json('index', function (err, content) {
            res.end(content);
        });
    }
});

```

Auto Route All Files in Folder

```js
site.get({name: '/js', path: __dirname + '/js'})
site.get({name: '/css', path: __dirname + '/css'})
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
    res.end('GET | id : ' + req.query.id)
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
site.get('/post/:id/category/:cat_id', function(req, res) {
    res.end('GET | Id : ' + req.params.id + ', catId : ' + req.params.cat_id)
})
//example : /post/9999999/category/5
```
MVC Custom Route
```js
site.get("/:controller/:action/:arg1", function(req, res) {
    res.end(
        "GET | Controller : " + req.params.controller +
        ", Action : " + req.params.action +
        ", Arg 1 : " + req.params.arg1
    );
});
//example : /facebook/post/xxxxxxxxxx
```

## Cookies

```js
site.get("/setCookie", function(req, res) {
        req.cookie.set('name', req.query.name)
        res.end('cookie set')
})
//example : /setcookie?name=amr

site.get("/getCookie", function(req, res) {
        res.end('name from cookie : ' + req.cookie.get('name'))
})
//example : /getcookie
```

## Sessions

```js
site.get('/setSession', function(req, res) {
    req.session.set('user_name', req.query.user_name)
    res.end('Session Set ok !! ')
})
//example : /setSession?user_name=absunstar

site.get('/getSession', function(req, res) {
    res.end('User Name from session : ' + req.session.get('user_name'))
})
//example : /getSession
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

## MongoDB Integration

```js
//Create New Collection & Insert New Docs
site.post({
    name: '/db',
    callback: function (req, res) {
        site.mongodb.connectDB('company', function (err, db) {
            if (!err) {
                db.createCollection('employees')
                db.collection('employees').insertMany([{
                        name: 'Name 1',
                        phone: 'xxx'
                    },
                    {
                        name: 'Name 2',
                        phone: 'xxxxxx'
                    },
                    {
                        name: 'Name 3',
                        phone: 'xxxxxxxxxxx'
                    }
                ], function (err, result) {
                    db.close()
                    res.end('Data Inserted : ' + result.insertedCount)
                })

            } else {
                res.end(err.message)
            }
        })
    }
});

//Select Docs
site.get({
    name: '/db',
    callback: function (req, res) {
        site.mongodb.connectDB('company', function (err, db) {
            if (!err) {
                db.collection("employees").find({}).toArray(function (err, result) {
                    if (!err) {
                        res.end(JSON.stringify(result))
                    }
                    db.close()
                });
            } else {
                res.end(err.message)
            }
        })
    }
});

// Update Docs
site.put({
    name: '/db',
    callback: function (req, res) {
        site.mongodb.connectDB('company', function (err, db) {
            if (!err) {
                db.collection("employees").updateMany({
                    name: 'Name 1'
                }, {
                    $set: {
                        name: "Updated Name"
                    }
                }, function (err, result) {
                    if (!err) {
                        res.end('Data Updated : ' + result.result.nModified)
                    }
                    db.close()
                });
            } else {
                res.end(err.message)
            }
        })
    }
});

//Delete Docs
site.delete({
    name: '/db',
    callback: function (req, res) {
        site.mongodb.connectDB('company', function (err, db) {
            if (!err) {
                db.collection("employees").deleteMany({}, function (err, result) {
                    if (!err) {
                        res.end('Data Deleted !!')
                    }
                    db.close()
                });
            } else {
                res.end(err.message)
            }
        })
    }
});

```

## Client libraries
easy use client libraries - required fonts files auto added
```html
 <link rel="stylesheet" href="/xcss/bootstrap.css" >
 <link rel="stylesheet" href="/xcss/font-awesome.css" >

 <script src="/xjs/jquery.js"></script>
 <script src="/xjs/bootstrap.js"></script>
 <script src="/xjs/angular.js"></script>
```
## Helper Functions

```js
var hash = site.md5('this content will be hashed as md5')
console.log(hash)

var name = 'absunstar'
if (name.like('*sun*')) {
    console.log('yes')
}
```

##Events

```js
site.on('event name', function() {
    console.log('you call event name')
})

site.call('event name')
```

## More

- Email    : Absunstar@gmail.com
- Linkedin : https://www.linkedin.com/in/absunstar
- Github   : https://github.com/absunstar
