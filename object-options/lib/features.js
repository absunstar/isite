module.exports = function init(____0) {

  ____0.features = []

  ____0.addFeature = function(name, value) {
    value = value || !0
    for (let i = 0; i < ____0.features.length; i++) {
      let v = ____0.features[i]
      if (____0.features[i].name == name) {
        ____0.features[i].value = value
        return
      }
    }

    ____0.features.push({
      name: name,
      value: value
    })
  }

  ____0.getFeature = function(name) {
    for (let i = 0; i < ____0.features.length; i++) {
      let v = ____0.features[i]
      if (v.name == name) {
        return v.value
      }
    }
    return null
  }

  ____0.hasFeature = function(name) {
    if(____0.getFeature(name)){
      return !0
    }
    return !1
  }

  ____0.feature = function(name, value) {
    if (value) {
      return ____0.addFeature(name, value)
    } else {
      return ____0.getFeature(name)
    }
  }

  ____0.addfeatures = function(path){
    ____0.readFile(path, (err, data) => {
      if (!err) {
        let features = JSON.parse(data)
        for (let i = 0; i < features.length; i++) {
          ____0.features.push(features[i])
        }
      }
    })
  }


}
