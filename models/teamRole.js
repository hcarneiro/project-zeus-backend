const Sequelize = require('sequelize');
const database = require('../libs/database');

const TeamRole = database.define('teamRole', {
  role: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = TeamRole;