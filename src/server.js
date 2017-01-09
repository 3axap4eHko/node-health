'use strict';

import Http from 'http';
import ZLib from 'zlib';

import {DB_STATISTIC} from './constants';
import db from './db';

const {env} = process;

const options = {
  port: env.HEALTH_PORT || 5113,
  hostname: env.HEALTH_HOST || '127.0.0.1',
  endpoint: env.HEALTH_ENDPOINT || '/health'
};

const {hostname, port, endpoint} = options;
db.init(DB_STATISTIC);

const pathExpr = new RegExp(`^${endpoint}$`);

const server = Http.createServer((req, res) => {
  if (!pathExpr.test(req.url)) {
    return res.end();
  }
  const content = JSON.stringify(db.list(DB_STATISTIC));
  const data = Buffer.from(content);
  const gzip = ZLib.createGzip();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Encoding', 'gzip');

  gzip.pipe(res);
  gzip.end(data);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}${endpoint}`);
});