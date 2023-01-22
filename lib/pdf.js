module.exports = function init(____0) {
  ____0.fontList = [];
  ____0.defaultFontOptions = {
    path: ____0.localDir + '/apps/client-side/site_files/fonts/DroidKufi-Regular.ttf',
    url: 'https://egytag.com/x-fonts/DroidKufi-Regular.ttf',
  };
  ____0.initFontKit = function (options, callback) {
    options = options || ____0.defaultFontOptions;
    if ((f = ____0.fontList.find((ff) => (ff.options.url && ff.options.url === options.url) || (ff.options.path && ff.options.path === options.path)))) {
      if (callback) {
        callback(f.font);
      }
    } else {
      if (options.path) {
        let font = ____0.fs.readFileSync(options.path);
        ____0.fontList.push({
          options: options,
          font: font,
        });
        if (callback) {
          callback(font);
        }
      } else if (options.url) {
        fetch(options.url)
          .then((res) => res.arrayBuffer())
          .then((font) => {
            ____0.fontList.push({
              options: options,
              font: font,
            });
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
