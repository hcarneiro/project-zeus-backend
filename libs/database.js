const Sequelize = require('sequelize');
const env = (process.env.NODE_ENV || 'local').toLowerCase();
const envConfig = require(`../config/${env}.json`);
const DATABASE_URL = process.env.DATABASE_URL || envConfig.database_url;

const database = {};

const db = new Sequelize(DATABASE_URL, {
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

module.exports = db;