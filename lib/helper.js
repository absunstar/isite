module.exports = function init(____0) {
  ____0.backupDB = function (options, callback) {
    options = options || {};
    callback = callback || function () {};

    options.db = options.db || ____0.options.mongodb.db;
    options.path = options.path || ____0.options.backup_dir;
    if (!options.path.like('*.gz')) {
      options.path += '/' + options.db + '.gz';
    }
    options.path = ____0.path.resolve(options.path);
    options.cmd = 'mongodump --db=' + options.db + ' --archive=' + options.path + ' --gzip';
    let subProcess = ____0.child_process.spawn('mongodump', ['--db=' + options.db, '--archive=' + options.path, '--gzip']);

    subProcess.on('exit', (code, signal) => {
      if (code || signal) {
        callback({ message: `Exit With Code [ ${code} ] and signal [ ${signal} ] ` }, options);
      } else {
        callback(null, options);
      }
    });
  };
  ____0.restoreDB = function (options, callback) {
    options = options || {};
    callback = callback || function () {};

    options.db = options.db || ____0.options.mongodb.db;
    options.path = options.path || ____0.options.backup_dir;
    if (!options.path.like('*.gz')) {
      options.path += '/' + options.db + '.gz';
    }
    options.path = ____0.path.resolve(options.path);
    options.cmd = 'mongorestore --db=' + options.db + ' --archive=' + options.path + ' --gzip --drop';
    let subProcess = ____0.child_process.spawn('mongorestore', ['--db=' + options.db, '--archive=' + options.path, '--gzip' , '--drop']);
    subProcess.on('exit', (code, signal) => {
      if (code || signal) {
        callback({ message: `Exit With Code [ ${code} ] and signal [ ${signal} ] ` }, options);
      } else {
        callback(null, options);
      }
    });
  };
};
