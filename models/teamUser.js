const Sequelize = require('sequelize');
const database = require('../libs/database');

const TeamUser = database.define('teamUser', {});

module.exports = TeamUser;