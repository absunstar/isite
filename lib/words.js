module.exports = function init(site) {

    const words = function () {}
    words.list = []
    words.add = function (word) {
        words.list.push(word)
    }
    words.addList = function (list) {
        if (typeof list === 'string') {
            site.readFile(list, (err, data) => {
                if (!err) {
                    let arr = site.fromJson(data)
                    for (let i = 0; i < arr.length; i++) {
                        words.list.push(arr[i])
                    }
                }
            })
        } else if (typeof list === 'object') {
            for (let i = 0; i < list.length; i++) {
                words.list.push(list[i])
            }
        }
    }

    return words
}