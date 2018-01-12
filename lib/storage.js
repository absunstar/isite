module.exports = function init(site) {
    const storage = function () {}

    storage.list = []
    storage.path = site.dir + '/../../' + site.options.name + '_storage.json'

    site.readFile(storage.path, (err, data) => {
        if (!err) {
            storage.list = site.fromJson(data)
        }
    })

    storage.fn = function (key, value) {
        if (key && value !== undefined) {
            for (let i = 0; i < storage.list.length; i++) {
                if (key === storage.list[i].key) {
                    storage.list[i].value = value
                    site.writeFile(storage.path, site.toJson(storage.list))
                    return
                }
            }
            storage.list.push({
                key: key,
                value: value
            })

            site.writeFile(storage.path, site.toJson(storage.list))

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