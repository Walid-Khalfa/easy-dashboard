import dotenv from 'dotenv';
import { createClient, RedisClientType } from 'redis';

dotenv.config({ path: '.variables.env' });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: RedisClientType | null = null;
let isConnected = false;

export const connectRedis = async (): Promise<void> => {
  if (isConnected && redisClient) {
    return;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err: Error) => {
      console.error('Redis Client Error:', err);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
      isConnected = true;
    });

    redisClient.on('disconnect', () => {
      console.log('Redis disconnected');
      isConnected = false;
    });

    await redisClient.connect();
    isConnected = true;
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    console.log('Falling back to in-memory token blocklist');
    isConnected = false;
  }
};

export const getRedisClient = (): RedisClientType | null => redisClient;

export const isRedisConnected = (): boolean => isConnected;

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && isConnected) {
    await redisClient.disconnect();
    isConnected = false;
  }
};

export default redisClient;
