exports = module.exports = setOptions;

function setOptions(_options, _o_) {
  // smart code setting
  let port = process.env.port || 80;
  let name = 'Your Site';
  let dynamic = false;
  let full = false;

  let dir_arr = process.cwd().split('/').pop().split('\\').pop().split('-');
  if (dir_arr.length == 3 && dir_arr[0] == 'smart' && !isNaN(dir_arr[2])) {
    dynamic = true;
    full = true;
    name = dir_arr[1];
    port = parseInt(dir_arr[2]);
  }

  const template = {
    port: port,
    cwd: process.cwd(),
    dir: process.cwd() + '/site_files',
    upload_dir: process.cwd() + '/../uploads',
    download_dir: process.cwd() + '/../downloads',
    apps: true,
    apps_dir: process.cwd() + '/apps',
    name: name,
    saving_time: 10,
    full: full,
    dynamic: dynamic,
    log: true,
    lang: 'ar',
    theme: 'default',
    help: true,
    stdin: true,
    mm: '26719191',
    yy: '2654127326319191',
    https: {
      enabled: false,
      port: null,
      ports: [],
      key: null,
      cert: null,
    },
    mongodb: {
      enabled: true,
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
        enabled: true,
        start: 1,
        step: 1,
      },
    },
    session: {
      timeout: 60 * 24 * 30,
      enabled: true,
      storage: 'mongodb',
      db: null,
      collection: 'users_sessions',
    },
    security: {
      enabled: true,
      db: null,
      users_collection: 'users_info',
      roles_collection: 'users_roles',
      admin: {
        email: 'admin@isite',
        password: 'P@$$w0rd',
      },
      users: [],
    },
    cache: {
      enabled: true,
      html: 0,
      txt: 60 * 24 * 30,
      js: 60 * 24 * 30,
      css: 60 * 24 * 30,
      fonts: 60 * 24 * 30,
      images: 60 * 24 * 30,
      json: 60 * 24 * 30,
      xml: 60 * 24 * 30,
    },
    proto: {
      object: true,
    },
    require: {
      features: ['browser.social'],
      permissions: [],
    },
    default: {
      features: [],
      permissions: [],
    },
  };



  let options = Object.assign({}, _options || {});
  let template2 = Object.assign({}, template);

  let AllOptions = Object.assign(template2, options);

  if (dynamic) {
    AllOptions.port = port;
    AllOptions.name = name;
  } else {
    AllOptions.port = AllOptions.port || template.port;
    AllOptions.name = AllOptions.name || template.name;
  }

  AllOptions.cwd = AllOptions.cwd || template.cwd;
  AllOptions.dir = AllOptions.dir || template.dir;
  AllOptions.upload_dir = AllOptions.upload_dir || template.upload_dir;
  AllOptions.download_dir = AllOptions.download_dir || template.download_dir;

  AllOptions.saving_time = AllOptions.saving_time || template.saving_time;
  AllOptions.log = AllOptions.log !== undefined ? AllOptions.log : template.log;
  AllOptions.lang = AllOptions.lang !== undefined ? AllOptions.lang : template.lang;
  AllOptions.theme = AllOptions.theme !== undefined ? AllOptions.theme : template.theme;
  AllOptions.help = AllOptions.help !== undefined ? AllOptions.help : template.help;
  AllOptions.stdin = AllOptions.stdin !== undefined ? AllOptions.stdin : template.stdin;
  AllOptions.apps = AllOptions.apps !== undefined ? AllOptions.apps : template.apps;
  AllOptions.apps_dir = AllOptions.apps_dir || template.apps_dir;
  AllOptions.full = AllOptions.full || false;

  AllOptions.https = AllOptions.https || template.https;
  AllOptions.https.enabled = AllOptions.https.enabled !== undefined ? AllOptions.https.enabled : template.https.enabled;
  AllOptions.https.port = AllOptions.https.port || template.https.port;
  AllOptions.https.key = AllOptions.https.key || template.https.key;
  AllOptions.https.cert = AllOptions.https.cert || template.https.cert;
  AllOptions.https.ports = AllOptions.https.ports || template.https.ports;
  if (AllOptions.https.port) {
    AllOptions.https.ports.push(AllOptions.https.port);
  }

  AllOptions.mongodb = AllOptions.mongodb || template.mongodb;
  AllOptions.mongodb.enabled = AllOptions.mongodb.enabled !== undefined ? AllOptions.mongodb.enabled : template.mongodb.enabled;
  AllOptions.mongodb.host = AllOptions.mongodb.host || template.mongodb.host;
  AllOptions.mongodb.port = AllOptions.mongodb.port || template.mongodb.port;
  AllOptions.mongodb.userName = AllOptions.mongodb.userName || template.mongodb.userName;
  AllOptions.mongodb.password = AllOptions.mongodb.password || template.mongodb.password;
  AllOptions.mongodb.db = dynamic ? 'smart_db_' + name : AllOptions.mongodb.db || template.mongodb.db;
  AllOptions.mongodb.collection = AllOptions.mongodb.collection || template.mongodb.collection;
  AllOptions.mongodb.limit = AllOptions.mongodb.limit || template.mongodb.limit;
  AllOptions.mongodb.prefix = AllOptions.mongodb.prefix || template.mongodb.prefix;
  AllOptions.mongodb.prefix.db = AllOptions.mongodb.prefix.db || template.mongodb.prefix.db;
  AllOptions.mongodb.prefix.collection = AllOptions.mongodb.prefix.collection || template.mongodb.prefix.collection;

  AllOptions.mongodb.identity = AllOptions.mongodb.identity || template.mongodb.identity;
  AllOptions.mongodb.identity.enabled = AllOptions.mongodb.identity.enabled !== undefined ? AllOptions.mongodb.identity.enabled : template.mongodb.identity.enabled;
  AllOptions.mongodb.identity.start = AllOptions.mongodb.identity.start || template.mongodb.identity.start;
  AllOptions.mongodb.identity.step = AllOptions.mongodb.identity.step || template.mongodb.identity.step;

  AllOptions.session = AllOptions.session || template.session;
  AllOptions.session.enabled = AllOptions.session.enabled !== undefined ? AllOptions.session.enabled : template.session.enabled;
  AllOptions.session.timeout = AllOptions.session.timeout !== undefined ? AllOptions.session.timeout : template.session.timeout;
  AllOptions.session.storage = AllOptions.session.storage || template.session.storage;
  AllOptions.session.db = AllOptions.session.db || AllOptions.mongodb.db;
  AllOptions.session.collection = AllOptions.session.collection || template.session.collection;

  AllOptions.security = AllOptions.security || template.security;
  AllOptions.security.enabled = AllOptions.security.enabled === undefined ? template.security.enabled : AllOptions.security.enabled;
  AllOptions.security.db = AllOptions.security.db || AllOptions.mongodb.db;
  AllOptions.security.users_collection = AllOptions.security.users_collection || template.security.users_collection;
  AllOptions.security.roles_collection = AllOptions.security.roles_collection || template.security.roles_collection;
  AllOptions.security.users = AllOptions.security.users || template.security.users;
  AllOptions.security.admin = AllOptions.security.admin || template.security.admin;
  AllOptions.security.admin.email = AllOptions.security.admin.email || template.security.admin.email;
  AllOptions.security.admin.password = AllOptions.security.admin.password || template.security.admin.password;
  if (dynamic) {
    AllOptions.security.admin = null;
    AllOptions.security.users.push({
      id: 'smart',
      email: 'smart',
      password: 'P@$$W)RD',
      $psermissions: ['*'],
      roles: ['*'],
      permissions: [
        {
          name: '*',
        },
      ],
      branch_list: [
        {
          company: {
            id: 1000000,
            name_ar: 'شركة إفتراضية',
            name_en: 'Virual Company',
          },
          branch: {
            id: 1000000,
            name_ar: 'فرع إفتراضى',
            name_en: 'Virual Branch',
          },
        },
      ],
      profile: {
        name: 'smart',
      },
    });
  }
  AllOptions.cache = AllOptions.cache || template.cache;
  AllOptions.cache.enabled = AllOptions.cache.enabled !== undefined ? AllOptions.cache.enabled : template.cache.enabled;
  AllOptions.cache.js = AllOptions.cache.js !== undefined ? AllOptions.cache.js : template.cache.js;
  AllOptions.cache.css = AllOptions.cache.css !== undefined ? AllOptions.cache.css : template.cache.css;
  AllOptions.cache.json = AllOptions.cache.json !== undefined ? AllOptions.cache.json : template.cache.json;
  AllOptions.cache.xml = AllOptions.cache.xml !== undefined ? AllOptions.cache.xml : template.cache.xml;
  AllOptions.cache.fonts = AllOptions.cache.fonts !== undefined ? AllOptions.cache.fonts : template.cache.fonts;
  AllOptions.cache.html = AllOptions.cache.html !== undefined ? AllOptions.cache.html : template.cache.html;
  AllOptions.cache.images = AllOptions.cache.images !== undefined ? AllOptions.cache.images : template.cache.images;
  AllOptions.cache.txt = AllOptions.cache.txt !== undefined ? AllOptions.cache.txt : template.cache.txt;

  AllOptions.require = AllOptions.require || template.require;
  AllOptions.require.features = AllOptions.require.features !== undefined ? AllOptions.require.features : template.require.features;
  AllOptions.require.permissions = AllOptions.require.permissions !== undefined ? AllOptions.require.permissions : template.require.permissions;

  AllOptions.default = AllOptions.default || template.default;
  AllOptions.default.features = AllOptions.default.features !== undefined ? AllOptions.default.features : template.default.features;
  AllOptions.default.permissions = AllOptions.default.permissions !== undefined ? AllOptions.default.permissions : template.default.permissions;

  _o_.options = AllOptions;
  _o_.port = AllOptions.port;
  _o_.dir = AllOptions.dir;
  _o_.full = AllOptions.full;

  _o_.require(__dirname + '/lib/const');
  _o_.require(__dirname + '/lib/event');
  _o_.require(__dirname + '/lib/prototype');
  _o_.require(__dirname + '/lib/fn');
  _o_.require(__dirname + '/lib/safty');
  _o_.require(__dirname + '/lib/numbers');

  _o_.on('site-started', () => {
    _o_.importApp(__dirname + '/plugins/file-manager');
  });

  return AllOptions;
}
