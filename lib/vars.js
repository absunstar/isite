module.exports = function init(site) {
  site.vars = []

  site.addVar = function(name, value) {
    for (let i = 0; i < site.vars.length; i++) {
      let v = site.vars[i]
      if (site.vars[i].name == name) {
        site.vars[i].value = value
        return
      }
    }

    site.vars.push({
      name: name,
      value: value
    })
  }
  site.getVar = function(name) {
    for (let i = 0; i < site.vars.length; i++) {
      let v = site.vars[i]
      if (v.name == name) {
        return v.value
      }
    }
    return null
  }

  site.var = function(name, value) {
    if (value) {
      return site.addVar(name, value)
    } else {
      return site.getVar(name)
    }
  }

  site.readFile(site.dir + "/json/vars.json", (err, data) => {
    if (!err) {
      let vars = JSON.parse(data)
      for (let i = 0; i < vars.length; i++) {
        site.vars.push(vars[i])
      }
    }
  })
}
