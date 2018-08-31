const Sequelize = require('sequelize');
const database = require('../libs/database');

const ProjectTask = database.db.define('projectTask', {});

module.exports = ProjectTask;