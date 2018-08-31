const Sequelize = require('sequelize');
const database = require('../libs/database');

const OrganizationTeam = database.db.define('organizationTeam', {});

module.exports = OrganizationTeam;