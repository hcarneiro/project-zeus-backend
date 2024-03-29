const Sequelize = require('sequelize');
const database = require('../libs/database');

const Team = database.db.define('team', {
  name: {
    type: Sequelize.STRING(100),
    allowNull: false
  }
}, {
  paranoid: true
});

module.exports = Team;