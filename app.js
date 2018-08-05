const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOST || 'localhost';
const config = require('./libs/config');
const app = express();

require('./models/index');

app.use(helmet({
  frameguard: false,
  hidePoweredBy: { setTo: 'McDonald\'s' }
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1000mb', parameterLimit: 50000 }));
app.use(bodyParser.text());

/* ROUTES */
app.use('/', require('./routes/index'));
app.use('/v1/users', require('./routes/v1/users'));
app.use('/v1/projects', require('./routes/v1/projects'));
app.use('/v1/tasks', require('./routes/v1/tasks'));
app.use('/v1/auth', require('./routes/v1/auth'));

module.exports = app;