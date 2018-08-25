const Sequelize = require('sequelize');
const database = require('../libs/database');

const Organization = database.db.define('organization', {
  name: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  type: {
    type: Sequelize.STRING()
  },
  isSuspended: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Organization;