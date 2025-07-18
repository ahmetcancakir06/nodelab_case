const amqp = require("amqplib");
const { getRabbitChannel } = require("../config/rabbitmq");
const Message = require("../models/messageModel");
const AutoMessage = require("../models/autoMessageModel");
const { getIO } = require("../socket"); // Socket.IO accessor
const logger = require("../utils/logger");


async function startMessageConsumer() {

  const channel = getRabbitChannel();
  if (!channel) {
    logger.error("RabbitMQ channel not found.");
    return;
  }

  await channel.assertQueue("message_sending_queue", {
    durable: true,
  });

  await channel.assertQueue("message_retry_queue", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "", // default exchange
      "x-dead-letter-routing-key": "message_sending_queue",
      "x-message-ttl": 10000
    }
  });
  const queueName = "message_sending_queue";

  await channel.assertQueue(queueName, { durable: true });

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    const rawData = msg.content.toString();
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      logger.error("❌ Failed to parse message:", err.message);
      return;
    }

    try {

      // If data is a Mongoose document, convert it to plain object
      if (data.toObject && typeof data.toObject === 'function') {
        data = data.toObject();
      }

      // Dynamically generate conversationId if missing
      if (!data.conversationId) {
        const ids = [data.sender.toString(), data.receiver.toString()];
        let conversationId;

        // Try to find the last conversation between the two users in either direction
        const lastMessage = await Message.findOne({
          $or: [
            { sender: ids[0], receiver: ids[1] },
            { sender: ids[1], receiver: ids[0] }
          ]
        }).sort({ createdAt: -1 });
        if (lastMessage) {
          conversationId = lastMessage.conversationId;
        } else {
          // If no previous conversation found, generate new one from usernames
          const senderUser = await require("../models/userModel").findById(data.sender);
          const receiverUser = await require("../models/userModel").findById(data.receiver);
          if (senderUser && receiverUser) {
            conversationId = `${senderUser.username}_${receiverUser.username}`;
          } else {
            throw new Error("Unable to determine conversationId from usernames.");
          }
        }

        data.conversationId = conversationId;
      }

      if (!data.receiver) {
        logger.warn("Receiver is missing in parsed data.");
      }

      // Save the message to the database
      const newMessage = await Message.create({
        sender: data.sender,
        receiver: data.receiver,
        content: data.content,
        conversationId: data.conversationId,
      });

      // Update the AutoMessage status to sent
      await AutoMessage.findByIdAndUpdate(data._id, { isSent: true });

      if (data?.receiver?.toString) {
        const receiverId = data.receiver.toString();
        getIO().to(receiverId).emit("message_received", newMessage);
      } else {
        logger.warn("Receiver is undefined or invalid. Cannot emit message via Socket.IO");
      }

      logger.info("Consumed and delivered message: " + newMessage._id);

      channel.ack(msg);
    } catch (err) {
      logger.error("Error while consuming message: " + err.message);
      // Retrieve retry count from headers, default to 0
      const headers = msg.properties.headers || {};
      const retryCount = headers["x-retry-count"] || 0;
      const MAX_RETRY_COUNT = parseInt(process.env.MAX_RETRY_COUNT) || 3;
      if (retryCount >= MAX_RETRY_COUNT) {
        logger.warn(`Message permanently failed after ${retryCount} retries: ` + err.message);
        channel.ack(msg); // Acknowledge message to remove from queue
      } else {
        // Push to retry queue with incremented retry count
        channel.sendToQueue(
          "message_retry_queue",
          Buffer.from(msg.content),
          {
            persistent: true,
            headers: { "x-retry-count": retryCount + 1 }
          }
        );
        channel.ack(msg);
        logger.warn(`Message failed (retry ${retryCount}), pushed to retry queue: ` + err.message);
      }
    }
  });

  logger.info("RabbitMQ consumer started listening to queue.");
}

module.exports = { startMessageConsumer };