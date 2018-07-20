const _ = require('lodash');
const env = (process.env.NODE_ENV || 'local').toLowerCase();
const envConfig = require(`../config/${env}.json`);

const config = {};

_.merge(config, envConfig);
config.env = env;
config.port = parseInt(process.env.PORT || envConfig.port || 80, 10);
config.domain = envConfig.host.replace(/https?:\/\//, '').replace(/\/$/, '');

module.exports = config;