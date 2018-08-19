const express = require('express');
const expressValidator = require('express-validator');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const aws = require('aws-sdk');
const busboy = require('connect-busboy');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOST || 'localhost';
const config = require('./libs/config');
const authenticate = require('./libs/authenticate');
const expressValidatorOptions = require('./libs/options/expressValidator');
const app = express();

require('./models/index');

app.use(helmet({
  frameguard: false,
  hidePoweredBy: { setTo: 'McDonald\'s' }
}));

// AWS configuration
aws.config.update({
  accessKeyId: config.AWS.ACCESS_KEY_ID,
  secretAccessKey: config.AWS.SECRET_ACCESS_KEY,
  region: config.S3.BUCKET_REGION
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, '*');
    }

    callback(null, true);
  },
  credentials: true
}));

// Better errors middleware
app.use(require('./libs/error'));

app.set('etag', false);
app.use(busboy());
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1000mb', parameterLimit: 50000 }));
app.use(bodyParser.text());
app.use(busboyBodyParser());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { etag: false, maxage: '1h' }));
app.use(expressValidator(expressValidatorOptions));

app.use(authenticate.loadUser);

/* ROUTES */
app.use('/', require('./routes/index'));
app.use('/v1/users', require('./routes/v1/users'));
app.use('/v1/projects', require('./routes/v1/projects'));
app.use('/v1/tasks', require('./routes/v1/tasks'));
app.use('/v1/auth', require('./routes/v1/auth'));
app.use('/v1/upload', require('./routes/v1/upload'));

module.exports = app;