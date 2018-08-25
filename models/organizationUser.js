const Sequelize = require('sequelize');
const database = require('../libs/database');

const OrganizationUser = database.db.define('organizationUser', {});

module.exports = OrganizationUser;