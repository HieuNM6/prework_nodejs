let http = require('http')
let request = require('request')
let argv = require('yargs')
  .default('host', '127.0.0.1')
  .argv

let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000:80)
let destinationUrl = argv.url || scheme  + argv.host + ':' + port

http.createServer((req, res) => {
  console.log(`request received at: ${req.url}`)
  for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
  }

  process.stdout.write('\n\n\n' + JSON.stringify(req.headers))
  req.pipe(process.stdout);
  req.pipe(res);
}).listen(8000)

http.createServer((req, res) => {
  console.log(`Proxying request to: ${destinationUrl + req.url}`)

  backupDestinationUrl = destinationUrl;

  // set url by header
  if (req.headers['x-destination-url'] !== undefined)
    destinationUrl = req.headers['x-destination-url']

  let options = {
    headers: req.headers,
    url: `${destinationUrl}${req.url}`
  }
  options.method = req.method


  let downstreamResponse = req.pipe(request(options))
  // restored url
  destinationUrl = backupDestinationUrl
  process.stdout.write(JSON.stringify(downstreamResponse.headers))
  downstreamResponse.pipe(process.stdout);
  downstreamResponse.pipe(res)
}).listen(8001)
