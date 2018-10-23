# Client Side Files Integrated With Isite Framework

- For More Info About Isite Framework https://github.com/absunstar/isite
- custom css , bootstrap , font-awesome
- custom js , jquery , angular
- All Required Fonts

## How To Use

- Goto your Site Folder
- Then Run This Code
```sh
    cd apps
    git clone https://github.com/absunstar/isite-client
```

- Or Install in Any FOLDER_PATH
- Then Use in Your Site Like This
```js
const site = require('isite')({port : 8080}) // Required Isite
site.importApp(FOLDER_PATH)
```

- Install From npm
```sh
    npm install isite-client
```
```js
const site = require('isite')({port : 8080}) // Required Isite
require('isite-client')(site)
```

- to use site theme css

```html
    <link rel="stylesheet" href="/x-css/site.css">
```

- to use bootstrap3 css

```html
<link rel="stylesheet" href="/x-css/bootstrap3.css">
<script src="/x-js/jquery.js"></script>
<script src="/x-js/bootstrap3.js"></script>
```

- to use bootstrap4 css

```html
<link rel="stylesheet" href="/x-css/bootstrap4.css">
<script src="/x-js/jquery.js"></script>
<script src="/x-js/bootstrap4.js"></script>
```
- to use semantic css

```html
<link rel="stylesheet" href="/x-css/semantic.css">
<script src="/x-js/jquery.js"></script>
<script src="/x-js/semantic.js"></script>
```

- to use font-awesome css

```html
<link rel="stylesheet" href="/x-css/font-awesome.css">
```

- to use jquery js

```html
<script src="/x-js/jquery.js"></script>
```

- to use angular js

```html
<script src="/x-js/angular.js"></script>
```


- to use site js

```html
<script src="/x-js/site.js"></script>
```


## Work With site Theme


### Default Page with Angular Support

```html
<!DOCTYPE html>
<html lang="en" ng-app="myApp">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <link rel="stylesheet" href="/x-css/site.css">
    <style x-lang="ar">
    :root {
        --direction: rtl;
        --text-align: right;
        --float: right;
    }
</style>
</head>

<body ng-controller="mainController">

    <script src="x-js/site.js"></script>
    <script src="x-js/angular.js"></script>
    <script>
        var app = angular.module('myApp', [])
        app.controller('mainController', ($scope, $http, $timeout, $rootScope) => {

        })
    </script>
</body>

</html>

```

### Navbar

```html

    <nav class="navbar">
        <div class="brand">
            <a href="/"> موقع تجريبى </a>
        </div>  
        <ul class="links">
            <li>
                <a href="/"> لينك 1 </a>
                <a href="/"> لينك 2 </a>
                <a href="/"> لينك 3 </a>
                <a href="/"> لينك 4 </a>
            </li>
        </ul>
    </nav>

```

### Layout

```html
<div class="row">
    <div class="col3"></div>
    <div class="col6"></div>
    <div class="col3"></div>
</div>
```

### Form

```html
  <form class="form">
    <div class="row10 ">
        <div class="col5">
            <div class="control">
                <label>User Name</label>
                <input type="text">
            </div>
        </div>
        <div class="col5">
            <div class="control">
                <label>User Email</label>
                <input type="email">
            </div>
        </div>
    </div>
    <div class="row">
        <div class="control">
            <label>Select Gender</label>
            <select>
                <option> Male </option>
                <option> Female </option>
            </select>
        </div>
    </div>
</form>
```

### Modal

```html
 <div id="testModal" class="modal">
    <div class="modal-content">
       
       <div class="modal-header">
            <span class="close">&times;</span>
            <h2> Title Here </h2>
        </div>
        
        <div class="modal-body">
                Body Here
        </div>

        <div class="modal-footer center">
            <a class="btn bg-red" onclick="site.hideModal('#testModal')"> Close </a>
        </div>

    </div>
</div>
    
    
    <a class="btn bg-blue" onclick="site.showModal('#testModal')"> Show Test Modal </a>
```

### Fixed Menu

- right-fixed-menu
- left-fixed-menu
- bottom-fixed-menu

```html
<ul class="right-fixed-menu">
       <li><a href=""> Item 1 </a></li>
       <li><a href=""> Item 1 </a></li>
       <li><a href=""> Item 1 </a></li>
       <li><a href=""> Item 1 </a></li>
    </ul>
```