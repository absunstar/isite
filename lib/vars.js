module.exports = function init(____0) {
  ____0.vars = []

  ____0.addVar = function(name, value) {
    for (let i = 0; i < ____0.vars.length; i++) {
      let v = ____0.vars[i]
      if (____0.vars[i].name == name) {
        ____0.vars[i].value = value
        return
      }
    }

    ____0.vars.push({
      name: name,
      value: value
    })
  }
  ____0.getVar = function(name) {
    for (let i = 0; i < ____0.vars.length; i++) {
      let v = ____0.vars[i]
      if (v.name == name) {
        return v.value
      }
    }
    return null
  }

  ____0.var = function(name, value) {
    if (value) {
      return ____0.addVar(name, value)
    } else {
      return ____0.getVar(name)
    }
  }

  ____0.addVars = function(path){
    ____0.readFile(path, (err, data) => {
      if (!err) {
        let vars = JSON.parse(data)
        for (let i = 0; i < vars.length; i++) {
          ____0.vars.push(vars[i])
        }
      }
    })
  }

  ____0.addVars(____0.dir + "/json/vars.json")

}
