const Sequelize = require('sequelize');
const database = require('../libs/database');

const OrganizationUser = database.define('OrganizationUser');

module.exports = OrganizationUser;