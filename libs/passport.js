const _ = require('lodash');
const zeusLogin = require('./passports/login');
const cookie = require('./cookie');
const config = require('./config');
const database = require('./database');

const passports = {
  zeusLogin
};

module.exports.get = function (type) {
  return passports[type];
};

module.exports.validate = function (req, res) {
  const session = req.session;
  if (!session.server || !session.server.passports) {
    return Promise.resolve(); // no need to validate
  }

  // Validate each passport
  return Promise.all(Object.keys(session.server.passports).map(function (type) {
    let data = session.server.passports[type];

    if (!session.entries) {
      session.entries = {};
    }

    if (!session.accounts) {
      session.accounts = {};
    }

    if (!Array.isArray(data)) {
      data = [data];
    }

    return Promise.all(data.map(function (passportData) {
      return passports[type].validate(req, res, passportData).then(function (entry) {
        session.entries[type] = entry;

        if (!session.accounts[type]) {
          session.accounts[type] = [];
        }

        session.accounts[type].push(entry);
      }).catch(function (error) {
        data = _.reject(data, function (datum) {
          return _.isEqual(passportData, datum);
        });

        return Promise.reject(error);
      });
    })).catch(function (error) {
      // When a passport validation does not pass, we remove this passport from the session
      // but still keep the session so the user can still use it and reauthenticate if necessary.
      if (data.length) {
        session.server.passports[type] = data;
      } else {
        session.server.passports = _.omit(session.server.passports, type);
      }

      session.changed('server', true);

      return session.save().then(function () {
        return { error };
      });
    });
  }));
};

module.exports.storeDetails = function (req, data) {
  const session = req.session;
  if (!session.server) {
    session.server = {};
  }

  if (!session.server.passports) {
    session.server.passports = {};
  }

  let currentData = session.server.passports[req.passport.type];

  // Save passport data into the session protected data
  if (currentData) {
    if (Array.isArray(currentData)) {
      // Only push when it's not identical
      if (!_.find(currentData, data)) {
        currentData.push(data);
      }
    } else if (typeof currentData === 'object') {
      // Only push when it's not identical
      if (_.isEqual(currentData, data)) {
        currentData = [currentData, data];
      }
    } else {
      currentData = data;
    }
  } else {
    currentData = [data];
  }

  session.server.passports[req.passport.type] = currentData;
  session.changed('server', true);

  return session.save();
};

module.exports.createSession = function (req, userId) {
  userId = userId || req.user.id;

  const data = {
    userId,
    client: {},
    server: {
      passports: {}
    },
    fingerprint: database.models.session.generateFingerprint(req)
  };

  if (req.session) {
    data.server.previousSessionId = req.session.id;
  }

  const session = database.models.session.build(data);

  session.setIdentifier(req);

  return session.save();
};

module.exports.createSessionIfNeeded = function (req, res, next) {
  if (req.session) {
    if (typeof next === 'function') {
      return next();
    }

    return Promise.resolve(req.session);
  }

  return module.exports.createSession(req).then(function (session) {
    req.auth_token = session.auth_token;
    req.session = session;

    const cookieOptions = {};

    if (req.body.remember === false) {
      cookieOptions.expires = 0; // session cookie. expires when browser is closed.
    }

    // Set the cookie to authenticate requests
    cookie.set(res, session.auth_token, cookieOptions);

    if (typeof next === 'function') {
      return next();
    }

    return Promise.resolve(req.session);
  });
};