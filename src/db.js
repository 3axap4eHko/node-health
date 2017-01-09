'use strict';

const db = {};

export default {
  init(table, init = []) {
    db[table] = init;
  },
  list(table) {
    return db[table];
  }
};