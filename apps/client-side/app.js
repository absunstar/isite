module.exports = function (site) {

  site.get({
    name: '/x-js',
    path: __dirname + '/site_files/js'
  })

  site.get({
    name: '/x-css',
    path: __dirname + '/site_files/css'
  })
  site.get({
    name: '/x-semantic-themes',
    path: __dirname + '/site_files/semantic-themes'
  })

  site.get({
    name: '/x-fonts',
    path: __dirname + '/site_files/fonts'
  })


  site.get({
    name: "/x-css/site.css",
    parser: "css2",
    compress: true,
    path: [
      __dirname + "/site_files/css/theme.css",
      __dirname + "/site_files/css/layout.css",
      __dirname + "/site_files/css/scrollbar.css",
      __dirname + "/site_files/css/progress.css",
      __dirname + "/site_files/css/treeview.css",
      __dirname + "/site_files/css/main-menu.css",
      __dirname + "/site_files/css/images.css",
      __dirname + "/site_files/css/navbar.css",
      __dirname + "/site_files/css/form.css",
      __dirname + "/site_files/css/checkbox.css",
      __dirname + "/site_files/css/radio.css",
      __dirname + "/site_files/css/modal.css",
      __dirname + "/site_files/css/fixed_menu.css",
      __dirname + "/site_files/css/color.css",
      __dirname + "/site_files/css/fonts.css",
      __dirname + "/site_files/css/effect.css",
      __dirname + "/site_files/css/table.css",
      __dirname + "/site_files/css/tabs.css",
      __dirname + "/site_files/css/help.css",
      __dirname + "/site_files/css/print.css",
      __dirname + "/site_files/css/ui.css",
      __dirname + "/site_files/css/tableExport.css"
    ]
  })




  site.createDir(site.dir + "/../../uploads")

  site.post("/api/upload/image/:category", (req, res) => {
    site.createDir(site.dir + "/../../uploads/" + req.params.category, () => {
      site.createDir(site.dir + "/../../uploads/" + req.params.category + '/images', () => {

        let response = {
          done: true
        }
        let file = req.files.fileToUpload
        if (file) {
          let newName = "image_" + new Date().getTime().toString().replace('.', '_') + ".png"
          let newpath = site.dir + "/../../uploads/" + req.params.category + "/images/" + newName
          site.mv(file.path, newpath, function (err) {
            if (err) {
              response.error = err
              response.done = false
            }
            response.image_url = "/api/image/" + req.params.category + '/' + newName
            res.json(response)
          })
        } else {
          response.error = 'no file'
          response.done = false
          res.json(response)
        }

      })
    })

  })

  site.get("/api/image/:category/:name", (req, res) => {
    res.download(site.dir + "/../../uploads/" + req.params.category + "/images/" + req.params.name)
  })


  site.post("/api/upload/file/:category", (req, res) => {
    site.createDir(site.dir + "/../../uploads/" + req.params.category, () => {
      site.createDir(site.dir + "/../../uploads/" + req.params.category + '/files', () => {

        let response = {
          done: true
        }
        let file = req.files.fileToUpload
        let newName = "file_" + new Date().getTime() + '.' + site.path.extname(file.name)
        let newpath = site.dir + "/../../uploads/" + req.params.category + "/files/" + newName
        site.mv(file.path, newpath, function (err) {
          if (err) {
            response.error = err
            response.done = false
          }
          response.file = {}
          response.file.url = "/api/file/" + req.params.category + '/' + newName
          response.file.name = file.name
          res.json(response)
        })
      })
    })

  })

  site.get("/api/file/:category/:name", (req, res) => {
    res.download(site.dir + "/../../uploads/" + req.params.category + "/files/" + req.params.name)
  })




}