const app = require('./app');
const http = require('http');
const socketIO = require('socket.io');
const config = require('./libs/config');

app.set('port', config.port);

const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

io.on('time', (timeString) => {
  console.log(timeString);
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

server.start = function (next) {
  server.listen(config.port, config.interface || undefined);
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