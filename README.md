# NODE HEALTH

Node JS process health monitor

## Usage
just include into entry point of module
``` javascript
// index.js

// ....
require('node-health');
// ....
```
and open url
[http://localhost:5113/](http://localhost:5113/)

## environment variables

 - HEALTH_PORT - port for monitor
 - HEALTH_HOST - host for monitor
 - HEALTH_LOG - monitor log file
 - HEALTH_TICK - monitor tick measurement
 - HEALTH_SIZE - maximum display size of metrics

## License

The MIT License Copyright (c) 2017-present Ivan Zakharchenko