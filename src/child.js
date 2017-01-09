'use strict';

import {EVENT_MSG, MSG_GET_STATUS} from './constants';

process.on(EVENT_MSG, ({id, msg}) => {
  if (process.send && msg === MSG_GET_STATUS) {
    const status = {
      cwd: process.cwd(),
      env: process.env,
      filename: process.mainModule.filename,
      pid: process.pid,
      argv: process.argv,
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
    process.send({id, status});
  }
});