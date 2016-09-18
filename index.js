let http = require('http')
let request = require('request')
let argv = require('yargs')
  .default('host', '127.0.0.1')
  .argv
let path = require('path')
let fs = require('fs')
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000:80)
let destinationUrl = argv.url || scheme  + argv.host + ':' + port

http.createServer((req, res) => {
  console.log(`Request received at: ${req.url}`)
  for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
  }

  logStream.write('\n\n\n' + JSON.stringify(req.headers) + '\n')
  req.pipe(logStream, {end: false})
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

  console.log(`Proxying request to: ${destinationUrl + req.url}`)
  options.method = req.method


  let downstreamResponse = req.pipe(request(options))
  // restored url
  destinationUrl = backupDestinationUrl
  logStream.write('\n\n' + JSON.stringify(downstreamResponse.headers))
  downstreamResponse.pipe(logStream, {end: false});
  downstreamResponse.pipe(res)
}).listen(8001)
