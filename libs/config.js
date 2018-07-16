const env = (process.env.NODE_ENV || 'local').toLowerCase();
const envConfig = require(`../config/${env}.json`);

const config = {};

config.env = env;
config.port = parseInt(process.env.PORT || config.port || 80, 10);
config.domain = envConfig.host.replace(/https?:\/\//, '').replace(/\/$/, '');

module.exports = config;