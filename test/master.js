'use strict';

import {fork} from 'child_process';
import {cpus} from 'os';
import monitor from '../build/monitor';

const processes = cpus().map(() => fork('./fork'));
monitor(processes);
