const Sequelize = require('sequelize');
const database = require('../libs/database');

const Users = database.define('users', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  }
});

module.exports = Users;