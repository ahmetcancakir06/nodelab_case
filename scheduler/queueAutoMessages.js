const cron = require('node-cron');
const AutoMessage = require('../models/autoMessageModel');
const { getRabbitChannel } = require('../config/rabbitmq');
const logger = require('../utils/logger');

cron.schedule('* * * * *', async () => {
  try {
    logger.info("Queueing cron job started.");

    const messages = await AutoMessage.find({
      sendDate: { $lte: new Date() },
      isQueued: false,
      isSent: false
    });

    if (messages.length === 0) {
      logger.info("No messages to queue.");
      return;
    }

    const channel = getRabbitChannel();
    if (!channel) {
      logger.error("RabbitMQ channel is not available.");
      return;
    }

    for (const msg of messages) {
      try {
        const retryCount = 0;
        channel.sendToQueue(
          "message_sending_queue",
          Buffer.from(JSON.stringify(msg)),
          {
            persistent: true,
            headers: { "x-retry-count": retryCount }
          }
        );

        msg.isQueued = true;
        await msg.save();

        logger.info(`Queued AutoMessage: ${msg._id}`);
      } catch (err) {
        logger.error(`Failed to queue AutoMessage ${msg._id}: ` + err.message);
      }
    }
  } catch (error) {
    logger.error("Error in queueAutoMessages cron job: " + error.message);
  }
});
