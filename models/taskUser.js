const Sequelize = require('sequelize');
const database = require('../libs/database');

const TaskUser = database.db.define('taskUser', {});

module.exports = TaskUser;