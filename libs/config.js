const _ = require('lodash');
const env = (process.env.NODE_ENV || 'local').toLowerCase();
const envConfig = require(`../config/${env}.json`);

const keys = [
  'AWS.SECRET_ACCESS_KEY',
  'AWS.ACCESS_KEY_ID',
  'S3.BUCKET_NAME',
  'S3.BUCKET_REGION',
  'redis.host'
];

const config = {};
keys.forEach(function getValue(key) {
  let realKey = key;

  let value = process.env[realKey.toUpperCase().replace(/\./g, '_')];
  if (!value) {
    return;
  }

  _.set(config, realKey, value);
});

_.merge(config, envConfig);
config.env = env;
config.port = parseInt(process.env.PORT || envConfig.port || 80, 10);
config.domain = envConfig.host.replace(/https?:\/\//, '').replace(/\/$/, '');
config.secretKey = process.env.SECRET_KEY || envConfig.SECRET_KEY;

module.exports = config;