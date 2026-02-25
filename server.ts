import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { globSync } from 'glob';
import path from 'path';
import { connectRedis } from './utils/redis';

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error('Reason:', reason);
  process.exit(1);
});

const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 18) {
  console.log('Please go to nodejs.org and download version 18 or greater. \n ');
  process.exit(1);
}

dotenv.config({ path: '.variables.env' });

if (!process.env.DATABASE) {
  console.error('DATABASE environment variable is not defined');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not defined');
  process.exit(1);
}

if (!process.env.JWT_REFRESH_SECRET) {
  console.warn(
    'WARNING: JWT_REFRESH_SECRET is not defined, using default (not recommended for production)'
  );
}

mongoose.connect(process.env.DATABASE);

mongoose.Promise = global.Promise;

mongoose.connection.on('error', err => {
  console.error(`Error → : ${err.message}`);
});

mongoose.connection.once('open', () => {
  console.log(`MongoDB connected: ${mongoose.connection.name} on ${mongoose.connection.host}`);
});

// Only connect to Redis if explicitly configured (not using default localhost)
const isRedisConfigured = process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379';
if (isRedisConfigured) {
  connectRedis().catch(err => {
    console.warn('Redis connection failed, using in-memory token blocklist:', err.message);
  });
}

const models = globSync('./models/*.{js,ts}');
models.forEach(file => {
  require(path.resolve(file));
});

import app from './app';
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Express running → On PORT : ${PORT}`);
});
