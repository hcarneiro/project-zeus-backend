const express = require('express');
const router = express.Router();
const config = require('../libs/config');
const appPackage = require('../package');

router.get('/', function getSystemInfo(req, res) {
  let user;

  if (req.user) {
    user = req.user.get({ plain: true });
    user.auth_token = req.auth_token;
  }

  res.send({
    status: 'ok',
    environment: config.env,
    version: appPackage.version,
    user
  });
});

module.exports = router;