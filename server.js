const http = require('http');
const app = require('./app');
const config = require('./libs/config');

app.set('port', config.port);

const server = http.createServer(app);

server.start = function (next) {
  server.listen(config.port, config.interface || undefined, next);
};

server.on('listening', function () {
  console.log('[HTTP] API listening on host ' + config.host);
});

server.on('error', function (error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error('Port ' + config.port + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('Port ' + config.port + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

module.exports = server;