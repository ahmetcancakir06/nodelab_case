const { saveMessageToDB } = require('../controllers/chatController');
const logger = require('../utils/logger');

module.exports = (io, socket) => {
  if (!socket.user || !socket.user.username) {
    console.warn("❗ socket user not defined.");
    return;
  }

  try {
    console.log("✅ chatHandler started:", socket.user.username);

    // Join room based on conversation ID
    socket.on('join_room', (conversationId, isForced = false) => {
      if (!socket.user || !socket.user.username) return;
      if (!socket.forcedJoins) socket.forcedJoins = new Set();

      if (isForced) {
        if (socket.forcedJoins.has(conversationId)) {
          console.log(`⛔ Already forced join attempted for: ${conversationId}, skipping.`);
          return;
        }
        console.log("⛔ Forced join detected, joining once.");
        socket.forcedJoins.add(conversationId);
        socket.join(conversationId);
        return;
      }
      if (!conversationId) return;
      console.log(`User ${socket.user.username} joined conversation: ${conversationId}`);
      socket.join(conversationId);
      socket.to(conversationId).emit('user_joined', {
        username: socket.user.username,
        conversationId,
        timestamp: new Date()
      });
    });

    socket.on('send_message', async (data) => {
      try {
        if (!data?.roomId || !data?.content || !data?.senderId) {
          console.warn("Missing ", data);
          return;
        }

        const savedMessage = await saveMessageToDB(data);

        io.to(data.roomId).emit('message_received', {
          messageId: savedMessage._id,
          senderId: savedMessage.sender,
          content: savedMessage.content,
          timestamp: savedMessage.createdAt || new Date()
        });
      } catch (err) {
        console.error("Hata send_message:", err);
      }
    });

    socket.on('typing', (roomId) => {
      if (!roomId) return;
      socket.to(roomId).emit('user_typing', {
        username: socket.user.username,
        roomId,
        timestamp: new Date()
      });
    });

    socket.on('read_message', (messageId) => {
      if (!messageId) return;
      io.emit('message_read', { messageId });
      console.log("✅ Message read:", messageId);
    });

  } catch (err) {
    console.error("chatHandler genel hata:", err);
  }
};