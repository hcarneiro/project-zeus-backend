const _ = require('lodash');
const Sequelize = require('sequelize');
const database = require('../libs/database');
const crypt = require('crypt3');
const md5 = require('md5');
const casual = require('casual');

const orgAdminRoleId = 1;

const User = database.db.define('user', {
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
  },
  auth_token: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true
  },
  resetPasswordToken: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true
  },
  resetPasswordTokenExpires: {
    type: Sequelize.DATE,
    allowNull: true
  },
  verificationToken: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true
  },
  verificationTokenExpires: {
    type: Sequelize.DATE,
    allowNull: true
  },
  lastAuthenticatedAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  userBio: {
    type: Sequelize.JSONB,
    defaultValue: {}
  },
  userCity: {
    type: Sequelize.STRING
  },
  userCountry: {
    type: Sequelize.STRING
  },
  profilePicture: {
    type: Sequelize.STRING
  },
  userTitle: {
    type: Sequelize.STRING
  },
  userResponsabilities: {
    type: Sequelize.JSONB,
    defaultValue: []
  },
  preferences: {
    type: Sequelize.JSONB,
    allowNull: true,
    defaultValue: {}
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

User.prototype.is = function(groupName) {
  const getRole = this.__userRole ? Promise.resolve(this.__userRole) : this.getUserRole();

  return getRole.then((role) => {
    this.__userRole = role;
    return Promise.resolve(role && role.get('role').toLowerCase() === groupName.toLowerCase());
  });
};

User.prototype.generateAuthToken = function() {
  // Generates something like "c763d6786d53e0e6fb772823e737b2d8-657-290-0938"
  this.auth_token = `${md5(this.id)}-${casual.phone}`;
  return this.save();
};

User.prototype.invalidateAuthToken = function() {
  this.auth_token = null;
  return this.save();
};

User.prototype.isValidPassword = function(password) {
  return crypt(password, this.password) === this.password || md5(password) === this.password;
};

User.prototype.setPassword = function(value) {
  const newPassword = crypt(value);

  const minLength = 6;
  if (value.length < minLength) {
    throw new Error(`Your password is too short. Minimum length accepted is ${minLength} characters.`)
  }

  const maxLength = 128;
  if (value.length > maxLength) {
    throw new Error(`Your password is too long. Maxiumum length accepted is ${maxLength} characters.`)
  }

  this.password = newPassword;
};

User.prototype.belongsToOrganization = function(organizationId) {
  return this.getOrganizations({ where: {
    id: organizationId
  }})
    .then(function (organizations) {
      return Promise.resolve(organizations.length > 0);
    });
};

User.prototype.isOrgAdmin = function(organizationId) {
  return this.getOrganizations({
    where: {
      id: organizationId
    },
    raw: true,
    through: {
      where: {
        organizationRoleId: orgAdminRoleId
      }
    }
  })
    .then(function (organizations) {
      return organizations.length ? Promise.resolve(true) : Promise.resolve(false);
    });
};

module.exports = User;