const Sequelize = require('sequelize');
const database = require('../libs/database');

const User = database.define('user', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  }
});

module.exports = User;