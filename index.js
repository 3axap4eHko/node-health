'use strict';

const Fs = require('fs');
const Path = require('path');
const Os = require('os');
const Http = require('http');
const ZLib = require('zlib');


const faviconExpr = /favicon.ico/;
const {env} = process;


const options = {
  port: env.HEALTH_PORT || 5113,
  hostname: env.HEALTH_HOST || '127.0.0.1',
  log: env.HEALTH_LOG || Path.join(Os.tmpdir(), `node-health-${Date.now()}.log`),
  tick: env.HEALTH_TICK || 3,
  collectionSize: env.HEALTH_SIZE || 1000
};

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