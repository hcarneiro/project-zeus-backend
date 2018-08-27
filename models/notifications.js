const Sequelize = require('sequelize');
const database = require('../libs/database');

const Notifications = database.db.define('notifications', {
  type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  payload: {
    type: Sequelize.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  read: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Notifications;