let proxyServer = require('./proxy')
let argv = require('yargs')
  .usage('Usage: node ./index.js [options]')
  .alias('x', 'host')
  .describe('x', 'Specify a forwarding host')
  .default('host', '127.0.0.1')
  .alias('p', 'port')
  .describe('p', 'Specify a forwarding port')
  .alias('l', 'log')
  .describe('l', 'Specify a output log file')
  .alias('u', 'url')
  .describe('u', 'Specify a full URL')
  .help('h')
  .alias('h', 'help')
  .example('node index.js -h google.com',"Send request via Proxy to google.com" )
  .describe('port_ssl', 'Start proxy server as https and listen in specific port')
  .argv

proxyServer(argv);

