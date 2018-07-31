const app = require('./app');
const http = require('http');
const socketIO = require('socket.io');
const config = require('./libs/config');

app.set('port', config.port);

const server = http.createServer(app);
const io = socketIO(server);

server.start = function () {
  io.on('connection', function(socket) {
    console.log('Client connected');

    socket.on('disconnect', function() {
      console.log('Client disconnected');
    });
  });

  server.listen(config.port, config.interface || undefined, function() {
    console.log('[HTTP] API listening on host ' + config.host);
  });
};

server.on('listening', function () {
  //console.log('[HTTP] API listening on host ' + config.host);
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