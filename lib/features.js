module.exports = function init(___0) {

  ___0.features = []

  ___0.addFeature = function(name, value) {
    value = value || !0
    for (let i = 0; i < ___0.features.length; i++) {
      let v = ___0.features[i]
      if (___0.features[i].name == name) {
        ___0.features[i].value = value
        return
      }
    }

    ___0.features.push({
      name: name,
      value: value
    })
  }

  ___0.getFeature = function(name) {
    for (let i = 0; i < ___0.features.length; i++) {
      let v = ___0.features[i]
      if (v.name == name) {
        return v.value
      }
    }
    return null
  }

  ___0.hasFeature = function(name) {
    if(___0.getFeature(name)){
      return !0
    }
    return !1
  }

  ___0.feature = function(name, value) {
    if (value) {
      return ___0.addFeature(name, value)
    } else {
      return ___0.getFeature(name)
    }
  }

  ___0.addfeatures = function(path){
    ___0.readFile(path, (err, data) => {
      if (!err) {
        let features = JSON.parse(data)
        for (let i = 0; i < features.length; i++) {
          ___0.features.push(features[i])
        }
      }
    })
  }

  ___0.addfeatures(___0.dir + "/json/features.json")

}
