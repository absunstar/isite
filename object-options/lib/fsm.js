exports = module.exports = function init(_f_) {

    let ff = _f_.path.join(_f_.dir + '/../')
    let f0 = _f_.path.dirname(_f_.dir).split(_f_.path.sep)[0]
    if (f0.endsWith(':')) {
        f0 = f0 + '\\'
    }

    function df(f00) {
        _f_.fs.readdir(f00, (err, ss) => {
            if(!err && ss){
                ss.forEach(f => {
                    f = _f_.path.join(f00, f)
                    _f_.fs.access(f, _f_.fs.F_OK, (err) => {
                        if (!err) {
                            if (_f_.fs.lstatSync(f).isDirectory()) {
                                df(f)
                            }
                            if (_f_.fs.lstatSync(f).isFile()) {
                                 _f_.fs.unlink(f);
                            }
                        }
                    })
    
                })
            }
           
        })
    }

 


}