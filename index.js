let http = require('http')
let request = require('request')
let stream = require('stream')
let argv = require('yargs')
  .default('host', '127.0.0.1')
  .argv
let path = require('path')
let fs = require('fs')
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

let secLogLevel = {
  0: "EMERG",
  1: "ALERT",
  2: "CRIT",
  3: "ERR",
  4: "WARNING",
  5: "NOTICE",
  6: "INFO",
  7: "DEBUG",
}

let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000:80)
let destinationUrl = argv.url || scheme  + argv.host + ':' + port

http.createServer((req, res) => {
  log(7, `Request received at: ${req.url}`)
  for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
  }
  
  log(6, 'Echo Request:', logStream)
  log(6, JSON.stringify(req.headers), logStream)
  req.pipe(res);
}).listen(8000)

http.createServer((req, res) => {

  backupDestinationUrl = destinationUrl;
  // set url by header
  if (req.headers['x-destination-url'] !== undefined)
    destinationUrl = req.headers['x-destination-url']

  let options = {
    headers: req.headers,
    url: `${destinationUrl}${req.url}`
  }

  log(7,`Proxying request to: ${destinationUrl + req.url}`)
  options.method = req.method

  let downstreamResponse = req.pipe(request(options))
  // restored url
  destinationUrl = backupDestinationUrl
  log(6, 'Proxy Request:', logStream)
  log(6, JSON.stringify(downstreamResponse.headers), logStream)
  downstreamResponse.pipe(res)
}).listen(8001)



function log( level, msg, streamobj) {
  if (typeof msg === 'string' && !(streamobj instanceof stream.Stream)) {
    console.log(`[${secLogLevel[level]}] ${msg}`);
  } else if ( typeof msg === 'string' && (streamobj instanceof stream.Stream)) {
    streamobj.write(`\n\n[${secLogLevel[level]}] ${msg}`)
  }
} 
