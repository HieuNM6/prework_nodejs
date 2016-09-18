let argv = require('yargs')
  .usage('node ./index.js [options]')
  .default('host', '127.0.0.1')
  .argv
let proxyServer = require('./proxy')
proxyServer(argv);

