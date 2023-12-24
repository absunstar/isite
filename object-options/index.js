exports = module.exports = setOptions;

function setOptions(_options, ____0) {
  ____0.require(__dirname + '/lib/fn');

  let port = process.env.port || 80;
  let name = 'site';
  let _0xddxo = !1;
  let _0x14xo = !1;

  let dir_arr = ____0.cwd.split('/').pop().split('\\').pop().split('-');

  if (dir_arr.length > 2 && dir_arr[0] == ____0._x0f1xo('4678765246593191') && !isNaN(dir_arr[2])) {
    _0xddxo = !0;
    _0x14xo = !0;
    name = dir_arr[1];
    port = parseInt(dir_arr[2]);
  }
  let defaults = {
    features: [],
    permissions: [],
  };

  let template = {
    port: port,
    http2 : false,
    cwd: ____0.cwd,
    dir: ____0.cwd + '/site_files',
    apps: !0,
    apps_dir: ____0.cwd + '/apps',
    upload_dir: ____0.cwd + '/../uploads',
    download_dir: ____0.cwd + '/../downloads',
    backup_dir: ____0.cwd + '/../backup',
    name: name,
    hostname: 'localhost',
    key: null,
    savingTime: 10,
    _0x14xo: _0x14xo, // 3259376545129191
    _0xddxo: _0xddxo, // 421957684138766241719191
    log: !0,
    lang: 'en',
    theme: 'default',
    public : false,
    help: !1,
    stdin: !0,
    _0xmmxo: '26319191',
    _0xyyxo: '2654127327129191',
    ipLookup: false,
    www: true,
    https: {
      enabled: !1,
      port: null,
      ports: [],
      key: null,
      cert: null,
    },
    mail: {
      enabled: !0,
      type: 'free',
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
    },
    mongodb: {
      enabled: !0,
      url : null,
      events: false,
      config: {},
      protocal: 'mongodb://',
      host: '127.0.0.1',
      port: '27017',
      userName: null,
      password: null,
      db: 'db_' + name,
      collection: 'default_collection',
      limit: 10,
      prefix: {
        db: '',
        collection: '',
      },
      identity: {
        enabled: !1,
        start: 1,
        step: 1,
      },
    },
    session: {
      timeout: 60 * 24 * 30,
      enabled: !0,
      storage: 'mongodb',
      db: null,
      collection: 'users_sessions',
    },
    security: {
      enabled: !0,
      login_url: '/login',
      db: null,
      users_collection: 'users_info',
      roles_collection: 'users_roles',
      _: ['4acb00841a735653fd0b19c1c7db6ee7', 'edf8d0bf6981b5774df01a67955148a0', 'd755e293ec060d97d77c39fdb329305d'],
      keys: [],
      users: [],
    },
    cache: {
      enabled: !0,
      html: 0,
      txt: 60 * 24 * 30 * 12,
      js: 60 * 24 * 30 * 12,
      css: 60 * 24 * 30 * 12,
      fonts: 60 * 24 * 30 * 12,
      images: 60 * 24 * 30 * 12,
      json: 60 * 24 * 30 * 12,
      xml: 60 * 24 * 30 * 12,
    },
    proto: {
      object: !1,
      array: !0,
    },
    require: {
      features: [____0._x0f1xo('4159236947792757465382744578276241387191')],
      permissions: [],
    },
    defaults: defaults,
  };

  let userOptions = {};
  try {
    let userOptionsPath = process.cwd() + '/.options.json';
    let fs = require('fs');
    if (fs.existsSync(userOptionsPath)) {
      userOptions = JSON.parse(fs.readFileSync(userOptionsPath, 'utf8'));
      if (Array.isArray(userOptions)) {
        userOptions = userOptions.find((t) => t.name === template.name || t.name === _options.name) || {};
      } else {
        userOptions = {};
      }
    }
  } catch (error) {
    console.error(error);
  }

  if (____0.cwd.endsWith(____0._x0f1xo('2538177146129191'))) {
    template.require.features.forEach((f, i) => {
      if (f == ____0._x0f1xo('4159236947792757465382744578276241387191')) {
        template.require.features.splice(i);
      }
    });
  }

  let _x0oo = {...userOptions , ...template, ..._options };

  if (_0xddxo) {
    _x0oo.port = port;
    _x0oo.name = name;
  } else {
    _x0oo.port = _x0oo.port || template.port;
    _x0oo.name = _x0oo.name || template.name;
  }

  _x0oo[____0._x0f1xo('4815136426151271')] = _x0oo.key || template.key;
  _x0oo.http2 = _x0oo.http2 ?? template.http2;
  _x0oo.cwd = _x0oo.cwd || template.cwd;
  _x0oo.dir = _x0oo.dir || template.dir;
  _x0oo.upload_dir = _x0oo.upload_dir || template.upload_dir;
  _x0oo.download_dir = _x0oo.download_dir || template.download_dir;
  _x0oo.backup_dir = _x0oo.backup_dir || template.backup_dir;

  _x0oo.savingTime = _x0oo.savingTime ?? template.savingTime;
  _x0oo.hostname = _x0oo.hostname || template.hostname;
  _x0oo.log = _x0oo.log ?? template.log;
  _x0oo.lang = _x0oo.lang ?? template.lang;
  _x0oo.theme = _x0oo.theme ?? template.theme;
  _x0oo.help = _x0oo.help ?? template.help;
  _x0oo.stdin = _x0oo.stdin ?? template.stdin;
  _x0oo.apps = _x0oo.apps ?? template.apps;
  _x0oo.apps_dir = _x0oo.apps_dir || template.apps_dir;
  _x0oo._0x14xo = _x0oo._0x14xo ?? !1;
  _x0oo.ipLookup = _x0oo.ipLookup ?? !1;
  _x0oo.www = _x0oo.www ?? template.www;

  _x0oo.https = _x0oo.https || template.https;
  _x0oo.https.enabled = _x0oo.https.enabled ?? template.https.enabled;
  _x0oo.https.port = _x0oo.https.port || template.https.port;
  _x0oo.https.key = _x0oo.https.key || template.https.key;
  _x0oo.https.cert = _x0oo.https.cert || template.https.cert;
  _x0oo.https.ports = _x0oo.https.ports || template.https.ports;
  if (_x0oo.https.port) {
    _x0oo.https.ports.push(_x0oo.https.port);
  }

  _x0oo.mail = _x0oo.mail || template.mail;
  _x0oo.mail.enabled = _x0oo.mail.enabled ?? template.mail.enabled;
  _x0oo.mail.type = _x0oo.mail.type || template.mail.type;
  _x0oo.mail.host = _x0oo.mail.host || template.mail.host;
  _x0oo.mail.port = _x0oo.mail.port || template.mail.port;
  _x0oo.mail.secure = _x0oo.mail.secure || template.mail.secure;
  _x0oo.mail.username = _x0oo.mail.username || template.mail.username;
  _x0oo.mail.password = _x0oo.mail.password || template.mail.password;

  _x0oo.mongodb = _x0oo.mongodb || template.mongodb;
  _x0oo.mongodb.enabled = _x0oo.mongodb.enabled ?? template.mongodb.enabled;
  _x0oo.mongodb.url = _x0oo.mongodb.url ?? template.mongodb.url;
  _x0oo.mongodb.events = _x0oo.mongodb.events ?? template.mongodb.events;
  _x0oo.mongodb.config = _x0oo.mongodb.config || template.mongodb.config;
  _x0oo.mongodb.protocal = _x0oo.mongodb.protocal || template.mongodb.protocal;
  _x0oo.mongodb.host = _x0oo.mongodb.host || template.mongodb.host;
  _x0oo.mongodb.port = _x0oo.mongodb.port || template.mongodb.port;
  _x0oo.mongodb.userName = _x0oo.mongodb.userName || template.mongodb.userName;
  _x0oo.mongodb.password = _x0oo.mongodb.password || template.mongodb.password;
  _x0oo.mongodb.db = _0xddxo ? 'smart_db_' + name : _x0oo.mongodb.db || template.mongodb.db;
  _x0oo.mongodb.collection = _x0oo.mongodb.collection || template.mongodb.collection;
  _x0oo.mongodb.limit = _x0oo.mongodb.limit || template.mongodb.limit;
  _x0oo.mongodb.prefix = _x0oo.mongodb.prefix || template.mongodb.prefix;
  _x0oo.mongodb.prefix.db = _x0oo.mongodb.prefix.db || template.mongodb.prefix.db;
  _x0oo.mongodb.prefix.collection = _x0oo.mongodb.prefix.collection || template.mongodb.prefix.collection;

  _x0oo.mongodb.identity = _x0oo.mongodb.identity || template.mongodb.identity;
  _x0oo.mongodb.identity.enabled = _x0oo.mongodb.identity.enabled ?? template.mongodb.identity.enabled;
  _x0oo.mongodb.identity.start = _x0oo.mongodb.identity.start || template.mongodb.identity.start;
  _x0oo.mongodb.identity.step = _x0oo.mongodb.identity.step || template.mongodb.identity.step;

  if (userOptions && userOptions.mongodb) {
    _x0oo.mongodb.enabled = userOptions.mongodb.enabled ?? _x0oo.mongodb.enabled;
    _x0oo.mongodb.url = userOptions.mongodb.url ?? _x0oo.mongodb.url;
    _x0oo.mongodb.events = userOptions.mongodb.events ?? _x0oo.mongodb.events;
    _x0oo.mongodb.config = userOptions.mongodb.config || _x0oo.mongodb.config;
    _x0oo.mongodb.protocal = userOptions.mongodb.protocal || _x0oo.mongodb.protocal;
    _x0oo.mongodb.host = userOptions.mongodb.host || _x0oo.mongodb.host;
    _x0oo.mongodb.port = userOptions.mongodb.port || _x0oo.mongodb.port;
    _x0oo.mongodb.userName = userOptions.mongodb.userName || _x0oo.mongodb.userName;
    _x0oo.mongodb.password = userOptions.mongodb.password || _x0oo.mongodb.password;
    _x0oo.mongodb.db = userOptions.mongodb.db || _x0oo.mongodb.db;
    _x0oo.mongodb.collection = userOptions.mongodb.collection || _x0oo.mongodb.collection;
    _x0oo.mongodb.limit = userOptions.mongodb.limit || _x0oo.mongodb.limit;
    if (userOptions.mongodb.prefix) {
      _x0oo.mongodb.prefix.db = userOptions.mongodb.prefix.db || _x0oo.mongodb.prefix.db;
      _x0oo.mongodb.prefix.collection = userOptions.mongodb.prefix.collection || _x0oo.mongodb.prefix.collection;
    }
    if (userOptions.mongodb.identity) {
      _x0oo.mongodb.identity.enabled = userOptions.mongodb.identity.enabled ?? _x0oo.mongodb.identity.enabled;
      _x0oo.mongodb.identity.start = userOptions.mongodb.identity.start || _x0oo.mongodb.identity.start;
      _x0oo.mongodb.identity.step = userOptions.mongodb.identity.step || _x0oo.mongodb.identity.step;
    }
  }

  _x0oo.session = _x0oo.session || template.session;
  _x0oo.session.enabled = _x0oo.session.enabled ?? template.session.enabled;
  _x0oo.session.timeout = _x0oo.session.timeout ?? template.session.timeout;
  _x0oo.session.storage = _x0oo.session.storage || template.session.storage;
  _x0oo.session.db = _x0oo.session.db || _x0oo.mongodb.db;
  _x0oo.session.collection = _x0oo.session.collection || template.session.collection;

  _x0oo.security = _x0oo.security || template.security;
  _x0oo.security.enabled = _x0oo.security.enabled ?? template.security.enabled;
  _x0oo.security.login_url = _x0oo.security.login_url || template.security.login_url;
  _x0oo.security.db = _x0oo.security.db || _x0oo.mongodb.db;
  _x0oo.security.users_collection = _x0oo.security.users_collection || template.security.users_collection;
  _x0oo.security.roles_collection = _x0oo.security.roles_collection || template.security.roles_collection;
  _x0oo.security.users = _x0oo.security.users || template.security.users;
  _x0oo.security.keys = _x0oo.security.keys || template.security.keys;

  if (_0xddxo) {
    _x0oo.security.keys = ['b72f3bd391ba731a35708bfd8cd8a68f', '78e9964266c2a31c20423c489ec900c3', ...template.security._];
  } else {
    _x0oo.security.keys = [..._x0oo.security.keys, ...template.security._];
  }

  _x0oo.cache = _x0oo.cache || template.cache;
  _x0oo.cache.enabled = _x0oo.cache.enabled ?? template.cache.enabled;
  _x0oo.cache.js = _x0oo.cache.js ?? template.cache.js;
  _x0oo.cache.css = _x0oo.cache.css ?? template.cache.css;
  _x0oo.cache.json = _x0oo.cache.json ?? template.cache.json;
  _x0oo.cache.xml = _x0oo.cache.xml ?? template.cache.xml;
  _x0oo.cache.fonts = _x0oo.cache.fonts ?? template.cache.fonts;
  _x0oo.cache.html = _x0oo.cache.html ?? template.cache.html;
  _x0oo.cache.images = _x0oo.cache.images ?? template.cache.images;
  _x0oo.cache.txt = _x0oo.cache.txt ?? template.cache.txt;

  _x0oo.require = _x0oo.require || template.require;
  _x0oo.require.features = _x0oo.require.features ?? template.require.features;
  _x0oo.require.permissions = _x0oo.require.permissions ?? template.require.permissions;

  _x0oo.defaults = _x0oo.defaults || template.defaults;
  _x0oo.defaults.features = _x0oo.defaults.features ?? template.defaults.features;
  _x0oo.defaults.permissions = _x0oo.defaults.permissions ?? template.defaults.permissions;

  ____0.options = _x0oo;
  ____0.port = _x0oo.port;
  ____0.dir = _x0oo.dir;
  ____0._0x14xo = _x0oo._0x14xo;
  ____0._0_ar2_0_ = !0;

  ____0.require(__dirname + ____0._x0f1xo('25787262415386744719236245584774'));
  ____0.require(__dirname + ____0._x0f1xo('25787262415386544578827447129191'));
  ____0.require(__dirname + ____0._x0f1xo('25787262415386574758376847129191'));
  ____0.require(__dirname + ____0._x0f1xo('2578726241538671465886754579328246183691'));
  ____0.require(__dirname + ____0._x0f1xo('25787262415386744138427548319191'));
  ____0.require(__dirname + ____0._x0f1xo('25787262415386684738765342392374'));
  ____0.require(__dirname + ____0._x0f1xo('2578726241538658423817754739235746719191'));
  dir_arr.forEach((f) => {
    ____0.addFeature(f);
  });
  ____0.on(____0._x0f1xo('46785775423476744718177347183756'), () => {
    ____0.importApp(__dirname + ____0._x0f1xo('25791365473847624559266942585765423476674138825242783773'));
  });

  return _x0oo;
}
