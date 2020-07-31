module.exports = function init(_w_) {

    const words = function () {}
    words.list = []
    words.add = function (word) {
        words.list.push(word)
    }
    words.addList = function (list) {
        if (typeof list === 'string') {
            _w_.readFile(list, (err, data) => {
                if (!err) {
                    let arr = _w_.fromJson(data)
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

    _w_.on('site-started' , ()=>{

        _w_.get('/x-api/words/:name/:en/:ar' , (req , res)=>{
            words.add({
                name : req.params.name,
                en : req.params.en,
                ar : req.params.ar
            })
            res.json(words.list)
        })

        _w_.get('/x-api/words/:name' , (req , res)=>{
           
            res.json({
                value : words.list[req.params.name]
            })
        })
        _w_.get('/x-api/words' , (req , res)=>{
            res.json(words.list )
        })

    })

    return words
}