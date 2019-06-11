module.exports = function init(_v_) {
  _v_.vars = []

  _v_.addVar = function(name, value) {
    for (let i = 0; i < _v_.vars.length; i++) {
      let v = _v_.vars[i]
      if (_v_.vars[i].name == name) {
        _v_.vars[i].value = value
        return
      }
    }

    _v_.vars.push({
      name: name,
      value: value
    })
  }
  _v_.getVar = function(name) {
    for (let i = 0; i < _v_.vars.length; i++) {
      let v = _v_.vars[i]
      if (v.name == name) {
        return v.value
      }
    }
    return null
  }

  _v_.var = function(name, value) {
    if (value) {
      return _v_.addVar(name, value)
    } else {
      return _v_.getVar(name)
    }
  }

  _v_.addVars = function(path){
    _v_.readFile(path, (err, data) => {
      if (!err) {
        let vars = JSON.parse(data)
        for (let i = 0; i < vars.length; i++) {
          _v_.vars.push(vars[i])
        }
      }
    })
  }

  _v_.addVars(_v_.dir + "/json/vars.json")

}
