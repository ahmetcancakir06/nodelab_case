// config/rabbitmq.js
const amqp = require('amqplib');

let channel;

async function connectRabbitMQ(retryCount = 5) {
  for (let i = 0; i < retryCount; i++) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      channel = await connection.createChannel();
      console.log('✅ RabbitMQ connected');
      return;
    } catch (err) {
      console.error(`❌ RabbitMQ connection failed (Attempt ${i + 1}): ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 sn bekle
    }
  }
  throw new Error('🛑 RabbitMQ bağlantısı sağlanamadı.');
}

function getRabbitChannel() {
  return channel;
}

module.exports = { connectRabbitMQ, getRabbitChannel };