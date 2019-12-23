module.exports = function init(_v_) {

  _v_.features = []

  _v_.addFeature = function(name, value) {
    value = value || true
    for (let i = 0; i < _v_.features.length; i++) {
      let v = _v_.features[i]
      if (_v_.features[i].name == name) {
        _v_.features[i].value = value
        return
      }
    }

    _v_.features.push({
      name: name,
      value: value
    })
  }

  _v_.getFeature = function(name) {
    for (let i = 0; i < _v_.features.length; i++) {
      let v = _v_.features[i]
      if (v.name == name) {
        return v.value
      }
    }
    return null
  }

  _v_.feature = function(name, value) {
    if (value) {
      return _v_.addFeature(name, value)
    } else {
      return _v_.getFeature(name)
    }
  }

  _v_.addfeatures = function(path){
    _v_.readFile(path, (err, data) => {
      if (!err) {
        let features = JSON.parse(data)
        for (let i = 0; i < features.length; i++) {
          _v_.features.push(features[i])
        }
      }
    })
  }

  _v_.addfeatures(_v_.dir + "/json/features.json")

}
