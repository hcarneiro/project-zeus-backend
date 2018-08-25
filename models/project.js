const Sequelize = require('sequelize');
const database = require('../libs/database');

const Project = database.db.define('project', {
  name: {
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

module.exports = Project;