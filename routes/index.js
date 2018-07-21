const express = require('express');
const router = express.Router();
const config = require('../libs/config');
const appPackage = require('../package');

router.get('/', function getSystemInfo(req, res) {
  res.send({
    status: 'ok',
    environment: config.env,
    version: appPackage.version
  });
});

module.exports = router;