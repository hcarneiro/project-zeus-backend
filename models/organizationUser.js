const Sequelize = require('sequelize');
const database = require('../libs/database');

const OrganizationUser = database.define('organizationUser', {});

module.exports = OrganizationUser;