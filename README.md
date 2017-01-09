# NODE HEALTH

Node JS process health monitor

## Usage
``` javascript
// master.js
'use strict';

import {fork} from 'child_process';
import {cpus} from 'os';
import monitor from 'node-health/monitor';

const processes = cpus().map(() => fork('./fork'));
monitor(processes);
```

``` javascript
// service.js

'use strict';

import 'node-health/child';

setInterval(function () {
  let i = 100000;
  while(i--);
}, 2000);

```
and open url
[http://localhost:5113/health](http://localhost:5113/health)

## environment variables

 - HEALTH_PORT - port for monitor
 - HEALTH_HOST - host for monitor
 - HEALTH_ENDPOINT - endpoint for monitor
 - HEALTH_LOG - monitor log file
 - HEALTH_TICK - monitor tick measurement
 - HEALTH_SIZE - maximum display size of metrics

## License

The MIT License Copyright (c) 2017-present Ivan Zakharchenko