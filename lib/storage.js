module.exports = function init(_s_) {
    const storage = function () { }

    storage.list = []
    storage.path = _s_.dir + '/../../' + _s_.options.name + '_storage.json'

    _s_.readFile(storage.path, (err, data) => {
        if (!err) {
            storage.list = _s_.fromJson(data)
            if(_s_.typeof(storage.list) !== 'Array'){
                storage.list = []
            }
        }else{
            storage.list = []
        }
    })

    setInterval(() => {
        if (storage.list.length > 0) {
            _s_.writeFile(storage.path, _s_.toJson(storage.list))
        }
    }, 5000);

    storage.fn = function (key, value) {
        if (key && value !== undefined) {
            value = _s_.copy(value)
            for (let i = 0; i < storage.list.length; i++) {
                if (key === storage.list[i].key) {
                    storage.list[i].value = value
                    return
                }
            }
            storage.list.push({
                key: key,
                value: value
            })


        } else if (key && value === undefined) {
            for (let i = 0; i < storage.list.length; i++) {
                if (key === storage.list[i].key) {
                    return storage.list[i].value
                }
            }
        } else {
            return null
        }
    }


    return storage
}