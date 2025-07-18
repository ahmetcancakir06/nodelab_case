// config/redis.js

const { createClient } = require('redis');

let client;

async function connectRedis() {
  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('error', (err) => console.error('Redis Client Error', err));

  await client.connect();
  console.log('✅ Redis connected');
}

function getRedisClient() {
  if (!client) {
    throw new Error('Redis client not initialized. Did you call connectRedis()?');
  }
  return client;
}

module.exports = {
  connectRedis,
  getRedisClient,
  get: (...args) => getRedisClient().get(...args),
  set: (...args) => getRedisClient().set(...args),
  del: (...args) => getRedisClient().del(...args),
  sAdd: (...args) => getRedisClient().sAdd(...args),
  sRem: (...args) => getRedisClient().sRem(...args),
  sMembers: (...args) => getRedisClient().sMembers(...args),
  sIsMember: (...args) => getRedisClient().sIsMember(...args)
};