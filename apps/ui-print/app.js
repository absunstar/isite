module.exports = function (site) {
    site.printList = [];

    site.post('/api/print', (req, res) => {
        let id = new Date().getTime();

        site.printList.push({
            id: id,
            content: req.data.content,
            type: req.data.type ?? 'html',
        });

        res.json({
            done: !0,
            url: '/view/print/' + id,
        });
    });

    site.get('/view/print/:id', (req, res) => {
        let content = '';
        let type = 'html';
        site.printList.forEach((item) => {
            if (item.id.toString() == req.params.id) {
                content = item.content;
                type = item.type ?? 'html';
            }
        });

        let html = '';
        if (type == 'image') {
            html = site.readFileSync(__dirname + '/site_files/html/image.html');
        } else if (type == 'svg') {
            html = site.readFileSync(__dirname + '/site_files/html/svg.html');
        } else if (type == 'content') {
            html = site.readFileSync(__dirname + '/site_files/html/content.html');
        } else {
            html = site.readFileSync(__dirname + '/site_files/html/index.html');
        }
        html = html.replace('##data.content##', content);
        res.htmlContent(html);
    });
};
