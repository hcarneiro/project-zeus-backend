const Sequelize = require('sequelize');
const database = require('../libs/database');

const UserRole = database.define('userRole', {
  role: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = UserRole;