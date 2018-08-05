const _ = require('lodash');
const env = (process.env.NODE_ENV || 'local').toLowerCase();
const envConfig = require(`../config/${env}.json`);

const config = {};

_.merge(config, envConfig);
config.env = env;
config.port = parseInt(process.env.PORT || envConfig.port || 80, 10);
config.domain = envConfig.host.replace(/https?:\/\//, '').replace(/\/$/, '');
config.passwrod_salt = envConfig.passwrod_salt
config.secretKey = process.env.SECRET_KEY || envConfig.secret_key;

module.exports = config;