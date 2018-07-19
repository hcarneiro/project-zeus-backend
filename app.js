const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOST || 'localhost';
const config = require('./libs/config');
const appPackage = require('./package');
const app = express();
const User = require('./models/user');

// Routing
app
  .use(cors())
  .get('/users', (req, res) => {
    User.findAll().then(users => {
      res.send(users)
    })
  })
  .get('/', (req, res) => {
    res.send({
      status: 'ok',
      environment: config.env,
      version: appPackage.version
    })
  })
  .listen(PORT, HOSTNAME, () => console.log(`Listening on http://${HOSTNAME}:${PORT}`));