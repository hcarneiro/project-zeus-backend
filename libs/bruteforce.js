const moment = require('moment');
const ExpressBrute = require('express-brute');
const RedisStore = require('express-brute-redis');

const database = require('./database');
const config = require('./config');

const store = new RedisStore({
  client: database.redis
});

const failCallback = function (req, res, next, nextValidRequestDate) {
  res.status(429).send({
    message: `You've made too many attempts in a short period of time, please try again ${moment(nextValidRequestDate).fromNow()}.`
  });
};

// Middleware to slow down requests after 5 attempts from same IP
const brute = new ExpressBrute(store, {
  freeRetries: config.env === 'production' ? 5 : 10,
  minWait: 2*60*1000, // 2 minutes
  maxWait: 10*60*1000, // 10 minutes,
  failCallback: failCallback
});

// Middleware to slow down requests from the same user/session after 50 attempts from same IP
brute.session = new ExpressBrute(store, {
  freeRetries: config.env === 'production' ? 50 : 500,
  minWait: 1*60*1000, // 1 minute
  maxWait: 5*60*1000, // 5 minutes,
  failCallback: failCallback
}).getMiddleware({
  key: function(req, res, next) {
    // prevent too many attempts for the same session or user
    next(req.session && `session-${req.session.id}` || (req.user && `user-${req.user.id}`));
  }
});

module.exports = brute;