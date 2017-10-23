## This is Framework help You to Create Node Js WebSite with Many Featuers

# Features

        - Auto Routes [Simple & Advanced & Custom]
        - Auto Handle File Types Encoding [Fonts - Images - ...]  
        - Merge Multi Files Contents in One Route
        - Auto Handle Request & Response Headers [Cookies - Parameters - params]
        - Auto Detect & Configer User Session  
        - Builtin Security System [register , login , permissions]
        - Easy Creating Master Pages
        - Auto Caching & Management Site Files in Memory 
        - Fast Read Files Content [Site Folder Structure]
        - [ Upload / Download ] Files
        - Custom Html Attributes [Server side Tags]
        - MongoDB Full Integration
        - Client libraries [jquery - bootstrap - font-awesome - angular]
        - Development Helper Functions
        - Site Dynamic Events Callback  

## Installation

`npm install isite --save`


## Using

 - Fast Startup Web Server.

```js
var isite = require('isite')
var site = isite({port:8080}) 

site.run()
```

- Default Options.

```js
var isite = require('isite')
site = isite({
    port : process.env.port || 80,
        dir : './site_files',
        savingTime : 60,
        session : {
            timeout : 60 * 24 * 30 ,
            enabled : true,
            storage : 'mongodb',
            dbName : 'sessions' ,
            userSessionCollection : 'user_sessions'
        },
        mongodb : {
            enabled : true,
            url :'127.0.0.1',
            port : '27017',
            userName : null,
            password : null,
            prefix : {
                db:'',
                collection:''
            }
        },
        security :{
            enabled : true,
            dbName : 'security',
            userCollection :'users',
            admin:{
                email : 'admin@localhost',
                password : 'admin'
            },
            users:[]
        },
        cache:{
            enabled : true,
            js : 60 * 24 * 30,
            css : 60 * 24 * 30,
            fonts : 60 * 24 * 30,
            images : 60 * 24 * 30,
            json : 60 * 24 * 30,
            xml : 60 * 24 * 30,
        }
})


site.run()
```
## Site Folder Structure

- site stucture help you to manage you site easy and fast

- Create Folder Name "site_files" 
 - inside it create these Sub folders [
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
- Custom Read Files

    - Read From Local File in First Time and save in memory
    - next time Read Will be From Memory

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

- Auto Convert All Routes URL & Parameters to Lower Case 
- Auto Manage Reponse Headers and Files Types
- Support Multi Files in One Route
- Save Route Response in Memory to Reuse for Fast Response
- Auto Handle URL parametes
- Auto Handle Body Parameters in not get header [post , put , delete , ...]
- Auto Handle URL params [custom parameters from url structure]
- Auto cache Files Content in memory
- support compress to remove unwanted spaces and tabs and empty lines ...etc
- support parser to handle custom html server side tags
 
Easy and Auto Site Routing

```js
site.get({name: '/',path:  site.dir + '/html/index.html'});
site.get({name: '/css/bootstrap.css',path:  site.dir + '/css/bootstrap.min.css'});
site.get({name: '/js/jquery.js',path: site.dir + '/js/jquery.js'});
site.get({name: '/js/bootstrap.js',path: site.dir + '/js/bootstrap.js'});
site.get({name: '/favicon.png',path: site.dir + '/images/logo.png'})
site.post({name: '/api',path:  site.dir + '/json/employees.json' });
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

site.get({ // can use [get , post , put , delete , all]
    name: '/',
    path: site.dir + '/html/index.html', // default null
    parser: 'html', // default static
    compress : true , // default false
    cache: false // default true
});

site.get({ 
    name: '/',
    callback: function(req, res) {
        res.setHeader('Content-type', 'text/html');
        res.writeHead(200);
        site.html('index', function(err, content) {
            res.end(content);
        })
    }
})

site.get('/', (req, res)=> {
        res.setHeader('Content-type', 'text/html');
        res.writeHead(200);
        site.html('index', function(err, content) {
            res.end(content);
        })
    }
)
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

Request Parameters [GET , POST | PUT | Delete] Restful API

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
site.get("/:controller/:Action/:Arg1", function(req, res) {
    res.end(
        "GET | Controller : " + req.params.controller +
        ", Action : " + req.params.Action + /* Normal case*/
         ", action : " + req.params.action + /* lower case*/
        ", Arg 1 : " + req.params.Arg1 + /* Normal case*/
        ", arg 1 : " + req.params.arg1 /* lower case*/
    );
});
//example : /facebook/post/xxxxxxxxxx
```

## Cookies

    - cookie is client side data per user
    - cookie is enabled by default

```js
site.get("/setCookie", function(req, res) {
        res.cookie('name', req.query.name)
        res.end('cookie set')
})
//example : /setcookie?name=amr

site.get("/getCookie", function(req, res) {
        res.end('name from cookie : ' + req.cookie('name'))
})
//example : /getcookie
```

## Sessions

    - session is server side data per user
    - every user has its own access token
    - session is management automatic
    - session save in memory by default

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

## Master Pages

    - master page help you to not repate you code
    - master page make site layout look good with less code
    - master page is tow parts header and footer
    - master page put content between header and footer

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

## HTML Server Tags & Attributes

    - html server tags is html tags run in server side
    - html server tags make html structure easy management
    - html server tags is the next generation of html

Add Custom Html Content
```js
site.get({name: '/',path:  site.dir + '/html/index.html' , parser:'html'});
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
site.var('siteName', 'First Site With Isite Library ');
site.var('siteBrand', 'XSite');
```
```html

<title>##var.siteName##</title>
<h2>##var.siteBrand##</h2>

<h2>Lang : ##session.lang## , Theme : ##session.theme##</h2>
//example : Read Data From User Session

<h2>query name : ##query.name## , query age : ##query.age##</h2>
//example : http://127.0.0.1?name=amr&age=33

<h2>param category : ##param.category## , param name : ##param.name##</h2>
//example : http://127.0.0.1/News/Egypt

<div x-lang="ar">Show if Site Language is Arabic</div>
<div x-lang="en">Show if Site Language is English</div>
// auto detect user session language set

<div x-permission="login">Only Login Users Can Show This Content</div>
<div x-permission="!login">Only Not Login Users Can Show This Content</div>
// auto detect user login status 

<div x-feature="os.mobile">Only Users From Mobile Can Show This Content</div>
<div x-feature="os.desktop">Only Users From Mobile Can Show This Content</div>

<div x-feature="os.windows">Only Users From Windows Can Show This Content</div>
<div x-feature="os.windowsxp">Only Users From Windows XP Can Show This Content</div>
<div x-feature="os.windows7">Only Users From Windows 7 Can Show This Content</div>
<div x-feature="os.windows8">Only Users From Windows 8 Can Show This Content</div>
<div x-feature="os.windows10">Only Users From Windows 10 Can Show This Content</div>

<div x-feature="os.linux">Only Users From Linux Systems Can Show This Content</div>
<div x-feature="os.mac">Only Users From Mac Systems Can Show This Content</div>
<div x-feature="os.android">Only Users From Android Systems Can Show This Content</div>

<div x-feature="browser.edge">Only Users From Edge Browser Can Show This Content</div>
<div x-feature="browser.firefox">Only Users From FireFox Browser Can Show This Content</div>
<div x-feature="browser.chrome">Only Users From Chrome Browser Can Show This Content</div>
<div x-feature="browser.explorer">Only Users From Explorer Browser Can Show This Content</div>

<div x-feature="ip.xxx.xxx.xxx.xxx">Only Users From IP xxx.xxx.xxx.xxx Can Show This Content</div>


//auto detect user browser

```

## MongoDB Integration

    - Manage Closed Connections and Timeout
    - Manage Multi Connections
    - Manage Bulk Inserts & Updates & Deletes
    - User Friendly Coding

```js
// Insert One Doc
   site.mongodb.insertOne({
            dbName: 'company',
            collectionName: 'employess',
            doc:{name:'amr',salary:35000}
        }, function (err, docInserted) {
            if (err) {
                console.log(err.message)
            } else {
                console.log(docInserted)
            }
        })

// Insert Many Docs
   site.mongodb.insertMany({
            dbName: 'company',
            collectionName: 'employess',
            docs:[
                    {name:'amr',salary:35000} , 
                    {name:'Gomana',salary:9000} ,
                    {name:'Maryem',salary:7000}
                ]
        }, function (err, result) {
            if (err) {
                console.log(err.message)
            } else {
                console.log(result)
            }
        })

// Find One Doc
 site.mongodb.findOne({
            dbName: 'company',
            collectionName: 'employees',
            where:{},
            select : {}
        }, function (err, doc) {
            if (err) {
                console.log(err.message)
            } else {
                console.log(doc)
            }
        })

// Find Many Docs
 site.mongodb.findMany({
            dbName: 'company',
            collectionName: 'employees',
            where:{},
            select : {}
        }, function (err, docs) {
            if (err) {
                console.log(err.message)
            } else {
                console.log(docs)
            }
        })

//Update One Doc
           site.mongodb.updateOne({
            dbName: 'company',
            collectionName: 'employees',
            where:{salary:7000},
            set : {name:'New MARYEM'}
        }, function (err, result) {
            if (err) {
                console.log(err.message)
            } else {
                console.log(result)
            }
        })

// Update Many Docs
           site.mongodb.updateMany({
            dbName: 'company',
            collectionName: 'employees',
            where:{salary:9000},
            set : {salary:9000 * .10}
        }, function (err, result) {
            if (err) {
                console.log(err.message)
            } else {
                console.log(result)
            }
        })

// Delete One Doc
          site.mongodb.deleteOne({
            dbName: 'company',
            collectionName: 'employess',
            where:{_id: new site.mongodb.ObjectID('df54fdt8h3n48ykd136vg')}
        }, function (err, result) {
            if (err) {
                console.log(err.message)
            } else {
                console.log(result)
            }
        })
// Delete Many Docs
          site.mongodb.deleteMany({
            dbName: 'company',
            collectionName: 'employess',
            where:{name : /a/}
        }, function (err, result) {
            if (err) {
                console.log(err.message)
            } else {
                console.log(result)
            }
        })
```


## Upload File

- upload File using HTML
```html
 <form action="uploadFile" method="post" enctype="multipart/form-data">
        <input type="file" name="fileToUpload"><br>
        <input type="submit">
    </form>
```

- Upload File Using Angular js

```html
  <form class="form">
        <label>Select File To Upload</label>
        <input type="file" name="fileToUpload" onchange="angular.element(this).scope().uploadFile(this.files)" />
        <p>{{uploadStatus}}</p>

    </form>

```

```js
    $scope.uploadFile = function (files) {
        var fd = new FormData();
        fd.append("fileToUpload", files[0]);
        $http.post('/uploadFile', fd, {
            withCredentials: true,
            headers: {
                'Content-Type': undefined
            },
            uploadEventHandlers: {
                progress: function (e) {
                    $scope.uploadStatus = "Uploading : " + Math.round((e.loaded * 100 / e.total)) + " %";
                    if (e.loaded == e.total) {
                        $scope.uploadStatus = "100%";
                    }
                }
            },
            transformRequest: angular.identity
        }).then(function (res) {
            if (res.data && res.data.done) {
            $scope.uploadStatus = "File Uploaded"
            }
        }, function (error) {
            $scope.uploadStatus = error;
        });
    };

```
- Recive Uploading File from [html , angular , jquery , ...]

```js
site.post("uploadFile", (req, res) => {
  var response = {done:true}
  var file = req.files.fileToUpload
  var newpath = site.dir + "/../../uploads/" + file.name
  site.mv(file.path, newpath, function(err) {
      if(err){
        response.error = err
        response.done = false
      }
    res.end(JSON.stringify(response))
  })
})
```
## Download File

- download any file from server
- auto handle file content and size
- force client browser to download file

```js
site.get('/files/file1.zip' , (req , res)=>{
    res.download(site.dir + '/downloads/file1.zip')
})
```

## Client libraries

Easy Access popular Client libraries 

    - no need to install any client library
    - no need to install any fonts
    - no need to manage library routes
    - just use it

```html
 <link rel="stylesheet" href="/@css/bootstrap3.css" >
 <link rel="stylesheet" href="/@css/font-awesome.css" >

 <script src="/@js/jquery.js"></script>
 <script src="/@js/bootstrap3.js"></script>
 <script src="/@js/angular.js"></script>
```

## Angular JS 

- Login , Register , Logout
- Change Site Language

```js
var app = angular.module('myApp', []);

app.controller('myController', function ($scope, $http) {

    /* Register */
   $scope.register = function () {
    
        $http({
            method: 'POST',
            url: '/@security/api/user/register',
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data: {
                email: $scope.userEmail,
                password: $scope.userPassword
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
           
            if (response.data.error) {
                $scope.error = response.data.error;
            }
            if (response.data.user) {
                window.location.href = '/';
            }
        } , function(err){
            $scope.error = err;
        });

    };

        /* Login */
    $scope.login = function () {
      
        $http({
            method: 'POST',
            url: '/@security/api/user/login',
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data: {
                email: $scope.userEmail,
                password: $scope.userPassword
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
           
            if (response.data.error) {
                $scope.error = response.data.error;
            }
            if (response.data.user) {
                window.location.href = '/';
            }
        } , function(err){
            $scope.error = err;
        });

    };

    /* Logout */
    $scope.logout = function () {
       
        $http.post('/@security/api/user/logout').then(function (response) {
           
            if (response.data.done) {
                window.location.href = '/';
            }else{
                $scope.error = response.data.error;
            }
        }, function (error) {
            $scope.error = error;
        });
    };

    /* Cahnge Site Language */

  $scope.changeLang = function(lang){
    $http({
        method: 'POST',
        url: '/@language/change',
        transformRequest: function (obj) {
            var str = [];
            for (var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        data:{ name : lang},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        if (response.data.done) {
          window.location.href = window.location.href;
        }
    });
  };





});

```

## Helper Functions

```js
site.get('/' , (req , res)=>{
    res.redirect('/URL') // Any URL 
    res.send('HTML CONTENT') // Any HTML Content 
    res.render('index') // html file name - auto parser [html and css content]
    res.html('index') // like res.render
    res.css('bootstrap') // css file name
    res.js('jquery') // js file name
    res.json(obj) // json file name or object
})


var hash = site.md5('this content will be hashed as md5')
var base64 = site.toBase64('this content will be encript as base64 string')
var normal = site.fromBase64(base64)
console.log(hash)
console.log(base64)
console.log(normal)

var name = 'absunstar'
if (name.like('*sun*')) {
    console.log('yes')
}
```

## Events

    - Events is global actions across site using emit events

```js
site.on('event name', function() {
    console.log('you call event name')
})

site.call('event name')
```

## More

    - This Framework make Security and Safty in the First Place
    - This Framework from Developer to Developers
    - This Framework will be Free and Supported For Ever
    - This Framework will Upgraded Arround the Clock for You
    - This Framework Development by One Developer

- Email    : Absunstar@gmail.com
- Linkedin : https://www.linkedin.com/in/absunstar
- Github   : https://github.com/absunstar
- Paypal   : https://paypal.me/absunstar
