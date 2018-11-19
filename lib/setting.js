module.exports = function init(site) {

    const setting = {}
    
    setting.list = []

    setting.add = function (obj) {
        if(!obj || !obj.name){
            return null
        }

        setting.list.push(obj)
        return obj
    }

    setting.set = function (obj) {
        if(!obj || !obj.name){
            return null
        }
        let exsits = false
        setting.list.forEach((s, i) => {
            if (s.name === obj.name) {
                setting.list[i] = obj
                exsits = true
            }
        })
        if (!exsits) {
            setting.add(obj)
        }
        return obj
    }

    setting.get = function (name) {
        setting.list.forEach(s => {
            if (s.name === name) {
                return s;
            }
        });
        return {}
    }
    setting.addList = function (list) {
        if (typeof list === 'string') {
            site.readFile(list, (err, data) => {
                if (!err) {
                    let arr = site.fromJson(data)
                    for (let i = 0; i < arr.length; i++) {
                        setting.set(arr[i])
                    }
                }
            })
        } else if (typeof list === 'object') {
            for (let i = 0; i < list.length; i++) {
                setting.set(list[i])
            }
        }
    }

    return setting
}