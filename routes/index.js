const express = require('express');
const router = express.Router();
const config = require('../libs/config');
const appPackage = require('../package');
const server = require('../server');

router.get('/', function getSystemInfo(req, res) {
  res.render('test');
  // res.send({
  //   status: 'ok',
  //   environment: config.env,
  //   version: appPackage.version
  // });
});

module.exports = router;