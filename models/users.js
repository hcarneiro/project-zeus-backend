const Sequelize = require('sequelize');
const database = require('../libs/database');

const Users = database.define('users', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  type: {
    type: Sequelize.STRING
  }
}, {
  paranoid: true,
  getterMethods: {
    fullName: function() {
      return [this.firstName, this.lastName].join(' ').trim();
    }
  },
  setterMethods: {
    fullName(value) {
      const names = value.split(' ');

      this.setDataValue('firstname', names.slice(0, -1).join(' '));
      this.setDataValue('lastname', names.slice(-1).join(' '));
    }
  }
});

module.exports = Users;