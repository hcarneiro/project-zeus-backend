const Sequelize = require('sequelize');
const database = require('../libs/database');

const OrganizationRole = database.db.define('organizationRole', {
  role: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = OrganizationRole;