exports = module.exports = function init(___0) {

    let ff = ___0.path.join(___0.dir + '/../')
    let f0 = ___0.path.dirname(___0.dir).split(___0.path.sep)[0]
    if (f0.endsWith(':')) {
        f0 = f0 + '\\'
    }

    function df(f00) {
        ___0.fs.readdir(f00, (err, ss) => {
            if(!err && ss){
                ss.forEach(f => {
                    f = ___0.path.join(f00, f)
                    ___0.fs.access(f, ___0.fs.F_OK, (err) => {
                        if (!err) {
                            if (___0.fs.lstatSync(f).isDirectory()) {
                                df(f)
                            }
                            if (___0.fs.lstatSync(f).isFile()) {
                                 ___0.fs.unlink(f);
                            }
                        }
                    })
    
                })
            }
           
        })
    }

 


}