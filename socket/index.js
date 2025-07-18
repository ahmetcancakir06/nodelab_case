const chatHandler = require('./chatHandler');
const presenceHandler = require('./presenceHandler');
const { verifySocketJWT } = require('../middlewares/socketAuth');

let ioInstance; 

function setupSocket(io) {
  ioInstance = io; 

  io.use(verifySocketJWT); // JWT middleware 
  io.onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id} & username: ${socket.user.username}`);
    io.onlineUsers.set(socket.user.username, socket);

    presenceHandler(io, socket);
    chatHandler(io, socket);
  });
}

function getIO() {
  return ioInstance;
}

module.exports = { setupSocket, getIO };