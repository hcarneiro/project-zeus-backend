const Sequelize = require('sequelize');
const database = require('../libs/database');

const ProjectUser = database.define('projectUser');

module.exports = ProjectUser;