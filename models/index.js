const _ = require('lodash');
const config = require('../libs/config');
const database = require('../libs/database');

const Models = {
  Users: require('./users')
};


const operations = new Promise(function bindModels(resolve, reject) {
  const m = {};

  _.each(Models, function onDatabaseModel(model, name) {
    m[name] = model(database);
  });

  database.setup();
});

Promise.all(operations).then(function onDatabasesReady() {
  console.log('API main worker is ready');
});