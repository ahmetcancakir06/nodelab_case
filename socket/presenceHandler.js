const { getRedisClient } = require('../config/redis');

module.exports = (io, socket) => {
  const redis = getRedisClient();
  const username = socket.user?.username || socket.handshake.query.username;
  const userId = socket.user?.id || socket.handshake.query.userId;

  if (!username || !userId) return;

  // Add user to Redis set for online users
  redis.sAdd('online_users', userId)
    .then(() => {
      socket.broadcast.emit('user_online', {
        userId,
        username
      });
    })
    .catch((err) => {
      console.error('Error adding user to online set:', err);
    });

  // if connection is lost, remove user from Redis set
  socket.on('disconnect', async () => {
    try {
      await redis.sRem('online_users', userId);
      socket.broadcast.emit('user_offline', {
        userId,
        username,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error removing user from Redis:', err);
    }
  });
};