'use strict';

const Fs = require('fs');
const Path = require('path');
const Os = require('os');
const Http = require('http');
const ZLib = require('zlib');


const keyExpr = /^-{1,2}(.*)$/;
const faviconExpr = /favicon.ico/;
const noKeyArgs = Symbol('Arguments without keys');
const lastKeyArg = Symbol('Last argument key');

const argsMap = {
  '-p': 'port',
  '-h': 'host',
  '-l': 'log',
  '-t': 'tick',
  '-s': 'collectionSize'
};

const defaultOptions = {
  [noKeyArgs]: [],
  [lastKeyArg]: null,
  port: 5113,
  hostname: '127.0.0.1',
  log: Path.join(Os.tmpdir(), `node-health-${Date.now()}.log`),
  tick: 3,
  collectionSize: 1000
};

const options = process.argv.slice(2).reduce((result, arg) => {

  const {[lastKeyArg]: lastKey} = result;

  if (lastKey === null && keyExpr.test(arg)) {
    result[lastKeyArg] = arg;
  } else if (lastKey !== null) {

    if (argsMap[lastKey]) {
      const optionsKey = argsMap[lastKey];
      result[optionsKey] = arg;
    } else {
      result[lastKey] = arg;
    }

    result[lastKeyArg] = null;
  } else {
    result[noKeyArgs].push(arg);
  }

  return result;
}, defaultOptions);

const {hostname, port, log, tick, collectionSize} = options;

const dataCollection = [];

function syncLog(data) {
  Fs.appendFile(log, JSON.stringify(data));
}

setInterval(function () {
  const data = {
    cpus: Os.cpus().map( cpu => cpu.times ),
    freemem: Os.freemem(),
    totalmem: Os.totalmem(),
    usemem: process.memoryUsage(),
    loadavg: Os.loadavg(),
    uptime: Os.uptime()
  };
  dataCollection.unshift(data);
  if (dataCollection.length > collectionSize) {
    dataCollection.splice(collectionSize);
  }
  syncLog(data);
}, (parseInt(tick) || 1) * 1000);

const server = Http.createServer((req, res) => {
  if (faviconExpr.test(req.url)) {
    return res.end();
  }
  const content = JSON.stringify(dataCollection);
  const data = Buffer.from(content);
  const gzip = ZLib.createGzip();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Encoding', 'gzip');

  gzip.pipe(res);
  gzip.end(data);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});