const Sequelize = require('sequelize');
const env = (process.env.NODE_ENV || 'local').toLowerCase();
const envConfig = require(`../config/${env}.json`);
const config = require('./config');
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);

const DATABASE_URL = process.env.DATABASE_URL || envConfig.database_url;

// Max time in seconds a redis lock can be held
const MAX_LOCK_TIME = 120;

const database = {};

database.redis = redis.createClient(process.env.NODE_ENV ? process.env['REDIS_URL'] : config.redis);

const operationsColors = {
  INSERT: 32, // green
  UPDATE: 33, // yellow
  DELETE: 31  // red
};

const dbLogging = !!config.query_logging ? function (query) {
  let color = 2; // dim

  Object.keys(operationsColors).some(function (op) {
    if (query.indexOf(`Executing (default): ${op}`) === 0) {
      color = operationsColors[op];
      return true; // short-circuit
    }
  });

  console.log(`\x1b[36m<Query>\x1b[0m \x1b[${color}m%s\x1b[0m`, query);
} : false;

database.db = new Sequelize(DATABASE_URL, {
  logging: dbLogging,
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.DATABASE_URL ? true : false
  },
  pool: {
    max: 25,
    min: 0,
    idle: 10000
  }
});

module.exports = database;