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
const userSignupSchema = require('./validators/user.signup');
const config = require('../../libs/config');
const User = require('../../models/user');
const Organization = require('../../models/organization');
const email = require('../../libs/email');
const database = require('../../libs/database');
const router = express.Router();

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

  return User.findOne({
    attributes: ['id', 'password', 'email', 'auth_token', 'userRoleId', 'preferences', 'createdAt', 'userBio', 'userCity', 'userCountry'],
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

    proceed();
  }, function (err) {
    proceed(err);
  });

  function proceed(err) {
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
            // This flag is used to store the login under zeusLogin
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
      data.host = config.host;
      data.trusted = !!deviceIsTrusted;
      data.organization = _.pick(user.organizations, 'id', 'name');

      if (req.session) {
        data.session = req.session;
        data.auth_token = req.session.auth_token;
      }

      if (req.body.redirect) {
        return res.redirect(req.body.redirect);
      }

      res.send(data);
    });
  };
});

router.post('/logout', function onLogout(req, res) {
  if (req.session) {
    req.session.destroy();
  }

  // Unset auth token from the cookies
  cookie.set(res, '');

  res.send();
});

router.post('/signup', function signupUser(req, res) {
  req.checkBody(userSignupSchema);

  req.db = database;

  if (!req.db) {
    return res.status(400).send({
      message: `There seems to be a connection problem, please try again later.`
    });
  }

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      message: 'Validation failed',
      errors
    });
  }

  const user = database.models.user.build(_.pick(req.body, [
    'firstName', 'lastName', 'email'
  ]));

  user.setPassword(req.body.password);
  user.setUserRole(2);
  const hash = md5(casual.unix_time + user.id);
  const token = `${hash}-${casual.unix_time}`;
  user.verificationToken = token;
  user.verificationTokenExpires = Date.now() + 60 * 60 * 24 * 1000;

  const organizationData = {
    name: req.body.organizationName,
    type: 'free'
  };

  // Verification email for the user
  function sendEmail() {
    const verificationUrl = `${config.client_host}verify/${token}`;
    const emailData = {
      template_id: 'd-5cf8026d927a419d88a63ed646850325',
      message: {
        to: {
          email: req.body.email,
          name: user.fullName
        },
        dynamicData: {
          firstName: user.firstName || '',
          organizationName: req.body.organizationName || '',
          verificationUrl: verificationUrl,
          subject: 'Welcome! Confirm Your Email'
        }
      }
    };

    return email.sendTemplate(emailData)
      .then(function onEmailSendError(response) {
        if (!res.headersSent) {
          res.send();
        }
      })
      .catch(function onEmailSendError(error) {
        if (!res.headersSent) {
          res.error(400, `Could not send the email to ${req.body.email}.`);
        }
      });
  }

  user.save().then(function () {
    return database.models.organization.create(organizationData).then(function (organization) {
      return organization.addUser(user, {
        through: {
          organizationRoleId: 1 // role is admin by default
        }
      }).then(function onCreated() {
        res.status(201).send({
          user: _.pick(user.get({ plain: true }), [
            'id', 'firstName', 'lastName', 'fullName', 'email'
          ]),
          organization: _.pick(organization.get({ plain: true }), [
            'id', 'name'
          ])
        });

        sendEmail().catch(console.error);

        // clear cache on users and organisations admin lists
        req.cache.clear({ key: 'users', global: true });
        req.cache.clear({ key: `organizations`, global: true });
      });
    });
  }).catch(function (error) {
    res.status(400);

    if (Array.isArray(error.errors) && error.errors.length && error.errors[0].path === 'email') {
      database.models.user.findAll({ where: { email: req.body.email } })
        .then(function (users) {
          const existingUser = users[0];

          // User already verified
          if (!existingUser.verificationToken) {
            return res.send({
              message: 'Email address already in use'
            });
          }

          // Expired token
          if (existingUser.verificationTokenExpires < new Date(Date.now())) {
            existingUser.verificationToken = token;
          }

          // Extend verification token expiring date
          existingUser.verificationTokenExpires = Date.now() + 60 * 60 * 24 * 1000;

          // Save it
          existingUser.getOrganizations({ attributes: ['id', 'name'] })
            .then(function onGetOrganization(organizations) {
              res.status(201).send({
                user: _.pick(user.get({ plain: true }), [
                  'id', 'firstName', 'lastName', 'fullName', 'email'
                ]),
                organization: _.pick(organizations.get({ plain: true }), [
                  'id', 'name'
                ])
              });
            });
          existingUser.save();
          sendEmail();
        });
    } else {
      res.send({
        message: 'We couldn\'t create your account. Please contact us at support@colabora.io to get more assistance.'
      });
    }
  });
});

router.post('/verify/:token', function verifyUser(req, res) {
  database.models.user.findOne({
    attributes: ['id', 'firstName', 'lastName', 'email', 'auth_token', 'userRoleId'],
    where: {
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: new Date(Date.now()) }
    }
  }).then(function (user) {
    if (!user) {
      return Promise.reject('Invalid or expired token');
    }

    user.verificationToken = null;
    user.verificationTokenExpires = null;
    return user.save().then(function () {
      return user.generateAuthToken();
    }).then(function () {
      cookie.set(res, user.auth_token);
      res.send(user);
    });
  }).catch(function (err) {
    res.status(400).send({
      message: err.message || err.description || err
    });
  });
});

router.post('/forgot', function forgotPassword(req, res) {
  const userEmail = req.body.email;
  let user;

  if (!userEmail) {
    return res.status(400).send({ message: 'Email is required' });
  }

  return database.models.user.findOne({
    attributes: ['id', 'firstName', 'lastName'],
    where: { email: userEmail.toLowerCase() }
  })
    .then(function onGetUser(dbUser) {
      if (!dbUser) {
        return res.status(400).send({
          message: 'Email does not exist'
        });
      }

      user = dbUser;

      let token;
      let resetUrl;
      const hash = md5(casual.unix_time + user.id);
      token = `${hash}-${casual.unix_time}`;
      resetUrl = `${config.client_host}reset-password/${token}`;
      
      const emailData = {
        template_id: 'd-cd251bd2abf7492f80de3b29a19b47c0',
        message: {
          to: {
            email: userEmail,
            name: user.fullName
          },
          dynamicData: {
            firstName: user.firstName || '',
            token: token,
            resetUrl: resetUrl,
            subject: 'Reset account password'
          }
        }
      };

      user.resetPasswordToken = token;
      user.resetPasswordTokenExpires = Date.now() + 60 * 60 * 1000;
      user.save();

      return email.sendTemplate(emailData)
        .then(function onEmailSendError(response) {
          return res.send();
        })
        .catch(function onEmailSendError(error) {
          return res.status(400).send();
        });
    });
});

router.get('/reset/:token', function getToken(req, res) {
  return database.models.user.findOne({
    attributes: ['id'],
    where: {
      resetPasswordToken: req.params.token,
      resetPasswordTokenExpires: { $gt: new Date(Date.now()) }
    }
  })
    .then(function onGetUser(user) {
      if (!user) {
        return res.status(400).send({
          message: 'Invalid or expired token'
        });
      }

      return res.status(200).send();
    });
});

router.post('/reset/:token', function resetPassword(req, res) {
  const { password } = req.body;

  if (!password) {
    return res.status(400).send({ message: 'Password is required' });
  }

  const newPassword = crypt(password);
  return database.models.user.findOne({
    attributes: ['id'],
    where: {
      resetPasswordToken: req.params.token,
      resetPasswordTokenExpires: { $gt: new Date(Date.now()) }
    }
  })
  .then((results) => {
    const user = results;
    if (!user) {
      return res.status(400).send({
        message: 'Invalid or expired token'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;

    return user.save();
  })
  .then(function () {
    res.send();
  }).catch(res.error(500));
});

module.exports = router;