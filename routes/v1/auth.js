const _ = require('lodash');
const express = require('express');
const casual = require('casual');
const crypt = require('crypt3');
const md5 = require('md5');
const async = require('async');
const moment = require('moment');
const Sequelize = require('sequelize');
const cookie = require('../../libs/cookie');
const passports = require('../../libs/passport');
const User = require('../../models/user');
const Organization = require('../../models/organization');
const database = require('../../libs/database');
const router = express.Router();

const databases = [ database ];


router.post('/login', function (req, res) {
  req.passport = passports.get('zeusLogin');

  const email = req.body.email;
  const password = req.body.password;
  const createSession = !!req.body.session; // Flag to create a session if needed
  const passport = !!req.body.passport; // Flag store passport under the session (only works with ^^)
  let user;
  let deviceIsTrusted;
  let errorMessage;

  // Only reuse the given user when a passport is being used
  if (!passport) {
    delete req.user;
    delete req.session;
  }

  if (!email || !password) {
    const message = `${!email ? 'Email' : 'Password'} is required`;

    return res.status(400).format({
      'application/json': function () {
        res.send({
          message
        });
      },
      'text/html': function () {
        // Display interactive login
        req.body.error = message;
        res.render('login', req.body);
      }
    });
  }

  async.each(databases, function findUser(db, next) {
    return User.findOne({
      attributes: ['id', 'password', 'email', 'auth_token', 'userRoleId', 'createdAt'],
      where: { email: email.toLowerCase() },
      include: [{
        model: Organization,
        attributes: ['id', 'name', 'isSuspended']
      }]
    }).then(function (dbUser) {
      const isValidPassword = dbUser && dbUser.isValidPassword(password);
      const isValidPasswordToken = dbUser && password && passport && dbUser.auth_token && password === dbUser.auth_token;

      if (isValidPassword || isValidPasswordToken) {
        user = dbUser;

        if (isValidPasswordToken) {
          deviceIsTrusted = true;
        }
      }

      next();
    }, next);
  }, function (err) {
    if (err || !user) {
      errorMessage = errorMessage || 'Email/password combination does not match';

      if (err) {
        console.error(err);
      }

      return res.status(401).format({
        'application/json': function () {
          res.send({
            message: errorMessage,
            error: err
          });
        },
        'text/html': function () {
          req.body.error = errorMessage;
          res.render('login', req.body);
        }
      });
    }

    async.waterfall([
      function getUserOrganisation(next) {
        if (!user.organizations.length) {
          return res.error(401, [
            'Your account is not setup with any organization.',
            'Please contact our support team',
            'to resolve this.'
          ].join(' '));
        }

        const suspended = _.find(user.organizations, { isSuspended: true });

        if (suspended) {
          return res.error(401, [
            `Your organization ${suspended.name} has been suspended.`,
            'Please contact our support team',
            'if you have any questions about your account.'
          ].join(' '));
        }

        next();
      },
      function generateAuthToken(next) {
        user.lastAuthenticatedAt = Sequelize.literal('CURRENT_TIMESTAMP');

        if (user.auth_token) {
          return user.save().then(function () {
            next();
          }, next);
        }

        user.generateAuthToken().then(function () {
          next();
        }, next);
      },
      function (next) {
        if (!createSession) {
          return next();
        }

        req.user = user;
        passports.createSessionIfNeeded(req, res)
          .then(function () {
            // This flag is used to store the login under flipletLogin passport
            // Used for example on fliplet-widget-login-fliplet
            if (passport) {
              req.passport = passports.get('zeusLogin');
              return passports.storeDetails(req, { email: user.email, auth_token: user.auth_token, userRoleId: user.userRoleId }).then(function () {
                next();
              });
            }

            next();
          }, next);
      }
    ], function (err) {
      if (err) {
        console.error(err);
        return res.status(400).send({
          message: err.description || err.message || err
        });
      }

      const authToken = req.session && req.session.auth_token || user.auth_token;
      const cookieOptions = {};

      if (req.body.remember === false) {
        cookieOptions.expires = 0; // session cookie. expires when browser is closed.
      }

      // Set the cookie to authenticate requests
      cookie.set(res, authToken, cookieOptions);

      const data = _.pick(user, ['id', 'email', 'auth_token', 'userRoleId', 'createdAt']);
      data.trusted = !!deviceIsTrusted;
      data.organization = _.pick(_.first(user.organizations), 'id', 'name');

      if (req.session) {
        data.session = req.session;
        data.auth_token = req.session.auth_token;
      }

      if (req.body.redirect) {
        return res.redirect(req.body.redirect);
      }

      res.send(data);
    });
  });
});

router.post('/logout', function onLogout(req, res) {
  if (req.session) {
    req.session.destroy();
  }

  // Unset auth token from the cookies
  cookie.set(res, '');

  res.send();
});

module.exports = router;