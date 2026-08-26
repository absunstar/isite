module.exports = function init(____0) {
  ____0.fontList = [];
  ____0.fontByKey = new Map();
  ____0.defaultFontOptions = {
    path: ____0.localDir + '/apps/client-side/site_files/fonts/helvetica.ttf',
    url: 'https://egytag.com/x-fonts/helvetica.ttf',
  };
  ____0.initFontKit = function (options, callback) {
    options = options || ____0.defaultFontOptions;
    const key = options.path ? 'path:' + options.path : 'url:' + String(options.url || '');
    const cached = ____0.fontByKey.get(key);
    if (cached) {
      if (callback) callback(cached.font);
    } else {
      if (options.path) {
        let font = ____0.fs.readFileSync(options.path);
        const entry = { options: options, font: font };
        ____0.fontList.push(entry);
        ____0.fontByKey.set(key, entry);
        if (callback) {
          callback(font);
        }
      } else if (options.url) {
        ____0.fetch(options.url)
          .then((res) => res.arrayBuffer())
          .then((font) => {
            const entry = { options: options, font: font };
            ____0.fontList.push(entry);
            ____0.fontByKey.set(key, entry);
            if (callback) {
              callback(font);
            }
          });
      }
    }
  };

  ____0.loadPDF = function (options, callback) {
    ____0.pdf.PDFDocument.load(____0.fs.readFileSync(options.path)).then((doc) => {
      ____0.initFontKit(null, (font) => {
        doc.registerFontkit(____0.FONTKIT);
        doc.embedFont(font).then((newFont) => {
          if (callback) {
            callback(doc, newFont);
          }
        });
      });
    });
  };
};
