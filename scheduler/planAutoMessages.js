const cron = require('node-cron');
const User = require('../models/userModel');
const AutoMessage = require('../models/autoMessageModel');
const logger = require('../utils/logger');
const redisClient = require('../config/redis');

// Random message generator 
function generateRandomMessage() {
  const messages = [
    "Hey! Just checking in 👋",
    "Good morning! 🌞",
    "Hope you're having a great day!",
    "Wanna catch up later?",
    "Time to code and chill 😎",
    "What’s up? How’s everything going?"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Shuffle utility
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Cron job - runs every day at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  try {
    logger.info("AutoMessage planning cron started.");

    const onlineUserIds = await redisClient.sMembers('online_users');
    const users = await User.find({ _id:{$in: onlineUserIds},deleted:false});
    const shuffledUsers = shuffleArray(users);
    const pairs = [];

    for (let i = 0; i < shuffledUsers.length - 1; i += 2) {
      pairs.push([shuffledUsers[i], shuffledUsers[i + 1]]);
    }

    for (const [sender, receiver] of pairs) {
      const autoMessage = new AutoMessage({
        sender: sender._id,
        receiver: receiver._id,
        content: generateRandomMessage(),
        sendDate: new Date(Date.now() + 60000), // optional: set 1 min later
        isQueued: false,
        isSent: false
      });
      await autoMessage.save();
    }

    logger.info(`Planned ${pairs.length} auto messages.`);
  } catch (error) {
    logger.error("Error in AutoMessage planning cron: " + error.message);
  }
});