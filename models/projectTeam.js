const Sequelize = require('sequelize');
const database = require('../libs/database');

const ProjectTeam = database.db.define('projectTeam', {});

module.exports = ProjectTeam;