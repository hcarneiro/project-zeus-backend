const Sequelize = require('sequelize');
const database = require('../libs/database');

const TeamUser = database.db.define('teamUser', {});

module.exports = TeamUser;