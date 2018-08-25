const Sequelize = require('sequelize');
const database = require('../libs/database');

const ProjectUser = database.db.define('projectUser', {});

module.exports = ProjectUser;