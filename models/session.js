const _ = require('lodash');
const Sequelize = require('sequelize');
const database = require('../libs/database');
const casual = require('casual');
const md5 = require('md5');
const useragent = require('useragent');

const Session = database.db.define('session', {
  server: {
    type: Sequelize.JSONB,
    allowNull: true
  },
  client: {
    type: Sequelize.JSONB,
    allowNull: true
  },
  auth_token: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true
  },
  fingerprint: {
    type: Sequelize.STRING,
    allowNull: true
  },
  identifier: {
    type: Sequelize.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  entries: {
    type: Sequelize.VIRTUAL
  },
  accounts: {
    type: Sequelize.VIRTUAL
  }
}, {
  paranoid: true,
  hooks: {
    afterCreate(session) {
      return session.generateAuthToken();
    }
  }
});

Session.generateFingerprint = function(req) {
  // Drop last octet
  const ip = _.dropRight((req.headers['x-forwarded-for'] || req.connection.remoteAddress).split('.')).join('.');

  const agent = useragent.lookup(req.headers['user-agent']);

  // Generate fingerprint with part of IP, Browser family and OS version
  return md5(`${ip}${agent.family}${agent.os.toVersion()}`);
}

Session.prototype.setIdentifier = function(req) {
  const userAgent = req.headers['user-agent'];
  const agent = useragent.lookup(userAgent);

  this.identifier = {
    ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    browser: {
      family: agent.family,
      major: agent.major,
      minor: agent.minor
    },
    os: {
      family: agent.os.family,
      major: agent.os.major
    },
    device: {
      family: agent.device.family
    },
    userAgent
  };
};

Session.prototype.generateAuthToken = function() {
  this.auth_token = `session--${md5(this.id)}-${casual.phone}`;
  return this.save();
};

Session.prototype.getPublic = function() {
  const data = this.get({ plain: true });
  data.server = this.omitPrivateKeys('server');
  data.user = _.omit(data.user, ['auth_token']);
  return data;
};

Session.prototype.omitPrivateKeys = function(modelKey) {
  // TODO: Find a suitable place for this as we use it in other places
  function filterPrivateData(obj) {
    const filteredObj = {};
    Object.keys(obj).forEach(function filterData(key) {
      if (key.indexOf('_') === 0) {
        return;
      }
      if (typeof obj[key] === 'object') {
        filteredObj[key] = filterPrivateData(obj[key]);
        return;
      }
      filteredObj[key] = obj[key];
    });

    return filteredObj;
  }

  return filterPrivateData(this[modelKey]);
};

module.exports = Session;