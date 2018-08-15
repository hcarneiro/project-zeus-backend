const Sequelize = require('sequelize');
const database = require('../libs/database');

const TaskUser = database.define('taskUser', {});

module.exports = TaskUser;