const cool = require('cool-ascii-faces');
const express = require('express');
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOST || 'localhost';
const appPackage = require('./package');
const app = express();
const User = require('./models/user');

// Routing
app
  .get('/cool', (req, res) => res.send(cool()))
  .get('/times', (req, res) => {
    let result = ''
    const times = process.env.TIMES || 5
    for (i = 0; i < times; i++) {
      result += i + ' '
    }
    res.send(result)
  })
  .get('/', (req, res) => {
    User.findAll().then(users => {
      res.send(users)
    })
  })
  .listen(PORT, HOSTNAME, () => console.log(`Listening on http://${HOSTNAME}:${PORT}`));