const Sequelize = require('sequelize');
const config = require('./config');
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://drcvvsvulvxlbr:eb482de988c4c2db3ff7145eb099146387dc372dece17a5173c56b26899b4ab9@ec2-23-23-93-115.compute-1.amazonaws.com:5432/d17lv613j57ujr';

const database = {};

const db = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  },
  pool: {
    max: 25,
    min: 0,
    idle: 10000
  }
});

module.exports = db;