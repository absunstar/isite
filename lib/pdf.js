module.exports = function init(____0) {
  ____0.fontList = [];
  ____0.initFontKit = function (options, callback) {
    options = options || {
      url: 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf',
    };
    if ((f = ____0.fontList.find((ff) => ff.options.url === options.url))) {
      if (callback) {
        callback(f.font);
      }
    } else {
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
