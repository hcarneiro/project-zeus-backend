const Sequelize = require('sequelize');
const database = require('../libs/database');

const TeamRole = database.db.define('teamRole', {
  role: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = TeamRole;