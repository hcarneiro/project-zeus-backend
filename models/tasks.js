const Sequelize = require('sequelize');
const database = require('../libs/database');

const Tasks = database.define('tasks', {
  title: {
    type: Sequelize.STRING
  },
  status: {
    type: Sequelize.STRING
  },
  dueAt: {
    type: Sequelize.DATE
  },
  completed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  paranoid: true
});

module.exports = Tasks;