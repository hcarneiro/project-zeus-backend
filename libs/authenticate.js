const Session = require('../models/session');
const User = require('../models/user');
const passports = require('./passport');
const cookie = require('./cookie');

const userAttributes = ['id', 'email', 'auth_token', 'userRoleId', 'type', 'firstName', 'lastName', 'preferences', 'createdAt'];

function authenticate(req, res, next) {
  loadUser(req, res, function () {
    if (!req.auth_token) {
      return res.status(401).format({
        'application/json': function(){
          res.send({
            error: 'auth_token not provided',
            message: 'Please include a valid auth_token when accessing this resource.'
          });
        },
        'text/html': function() {
          res.render('login', {
            redirect: req.originalUrl
          });
        }
      });
    }

    if (!req.user) {
      const errorMessage = req.authenticationError || `The auth_token provided doesn't belong to any ${req.session === false ? 'session' : 'user'}.`;

      return res.status(401).format({
        'application/json': function(){
          res.send({
            error: 'not authorised',
            message: errorMessage
          });
        },
        'text/html': function() {
          res.render('error', {
            message: 'Not Authorised',
            description: errorMessage
          });
        }
      });
    }

    next();
  });
};

module.exports = authenticate;

function loadUser(req, res, next) {
  if (req.user) {
    return next();
  }

  req.auth_token = req.query.auth_token || req.body.auth_token || req.headers['auth-token'] || req.cookies.auth_token;

  if (Array.isArray(req.auth_token)) {
    req.auth_token = _.last(req.auth_token);
  }

  if (!req.auth_token) {
    return next();
  }

  const isSession = req.auth_token.match(new RegExp(`^session--`));

  if (isSession) {
    return Session.findOne({
      where: {
        auth_token: req.auth_token
      },
      include: [{
        model: User,
        attributes: userAttributes,
        required: true
      }],
      paranoid: false
    }).then(function onSessionFound (session) {
      if (!session) {
        req.session = false;
        return; // session not found, but we're not here to judge
      }

      if (session.deletedAt) {
        req.authenticationError = 'This session has expired and is not valid anymore.';
        return;
      }

      req.session = session;
      req.user = session.user;
      res.locals.user_email = req.user.email;

      // Renew cookie when forced to be set
      if (req.query.setCookie) {
        cookie.set(res, req.auth_token);
      }

      return passports.validate(req, res);
    }).then(function () {
      next();
    }).catch(function (err) {
      if (req.session) {
        console.error('Invalid session', req.session.get({ plain: true }), err);
      }

      const errorMessage = err.message || err.description || err;

      // set cookie to use the user's token back if possible
      if (req.cookies.auth_token && req.user) {
        cookie.set(res, req.user.auth_token);
      }

      // If ajax request, respond with error
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(403).send({
          message: 'This session is not valid.',
          error: errorMessage
        });
      }

      if (req.user) {
        const requestUrl =
          req.url.replace(`auth_token=${req.auth_token}`, `auth_token=${req.user && req.user.auth_token || ''}`)
          + (errorMessage ? (req.url.indexOf('?') === -1 ? '?' : '&') + `error=${encodeURIComponent(errorMessage)}` : '');

        return res.redirect(301, requestUrl);
      }

      next();
    });
  }

  User.findOne({
    attributes: userAttributes,
    where: {
      auth_token: req.auth_token
    }
  }).then(function (user) {
    if (user) {
      req.user = user;
      res.locals.user_email = req.user.email;

      // Renew cookie when forced to be set
      if (req.query.setCookie) {
        cookie.set(res, req.auth_token);
      }
    }
    next();
  }, next);
}

module.exports.loadUser = loadUser;