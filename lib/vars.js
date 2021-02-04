module.exports = function init(___0) {
  ___0.vars = []

  ___0.addVar = function(name, value) {
    for (let i = 0; i < ___0.vars.length; i++) {
      let v = ___0.vars[i]
      if (___0.vars[i].name == name) {
        ___0.vars[i].value = value
        return
      }
    }

    ___0.vars.push({
      name: name,
      value: value
    })
  }
  ___0.getVar = function(name) {
    for (let i = 0; i < ___0.vars.length; i++) {
      let v = ___0.vars[i]
      if (v.name == name) {
        return v.value
      }
    }
    return null
  }

  ___0.var = function(name, value) {
    if (value) {
      return ___0.addVar(name, value)
    } else {
      return ___0.getVar(name)
    }
  }

  ___0.addVars = function(path){
    ___0.readFile(path, (err, data) => {
      if (!err) {
        let vars = JSON.parse(data)
        for (let i = 0; i < vars.length; i++) {
          ___0.vars.push(vars[i])
        }
      }
    })
  }

  ___0.addVars(___0.dir + "/json/vars.json")

}
