'use strict';

import Fs from 'fs';
import Path from 'path';
import Os from 'os';
import {ChildProcess} from 'child_process';
import {DB_STATISTIC, MSG_GET_STATUS, EVENT_MSG} from './constants';
import './server';
import db from './db';


const {env} = process;

const options = {
  log: env.HEALTH_LOG || Path.join(Os.tmpdir(), `node-health-${Date.now()}.log`),
  tick: env.HEALTH_TICK || 3,
  collectionSize: env.HEALTH_SIZE || 1000
};

const {log, tick, collectionSize} = options;
const childrenList = [];
const messagePool = {};

db.init(DB_STATISTIC);

function syncLog(data) {
  Fs.appendFileSync(log, JSON.stringify(data));
}

function registerMessage(id, resolve, reject) {
  messagePool[id] = (result) => {
    delete messagePool[id];
    resolve(result);
  };
  setTimeout(() => {
    if (messagePool[id]) {
      reject();
      delete messagePool[id];
    }
  }, 2000);
}

function update() {
  const data = {
    system: {
      cpus: Os.cpus().map(cpu => cpu.times),
      freemem: Os.freemem(),
      totalmem: Os.totalmem(),
      loadavg: Os.loadavg(),
      uptime: Os.uptime()
    },
    processes: []
  };

  Promise.all(childrenList.map(child => {
    const id = `${child.pid}:${Date.now()}`;

    return new Promise((resolve, reject) => {
      registerMessage(id, resolve, reject);
      child.send({id, msg: MSG_GET_STATUS});
    });

  })).then(processes => {
    data.processes = processes;
    const statistic = db.list(DB_STATISTIC);
    statistic.unshift(data);
    if (statistic.length > collectionSize) {
      statistic.splice(collectionSize);
    }
    syncLog(data);
  });
}

setInterval(update, (parseInt(tick) || 1) * 1000);

export default function (processes) {
  processes.forEach( process => {
    if (!(process instanceof ChildProcess)) {
      throw new Error(`Variable ${process} is not instance of ChildProcess`);
    }
    if (!process.send) {
      throw new Error(`Process ${process.pid} is not forked process`);
    }
    if (!childrenList.includes(process)) {
      process.on(EVENT_MSG, ({id, status}) => {
        messagePool[id](status);
      });
    }
  });
  childrenList.splice(0, childrenList.length, ...processes);
}

