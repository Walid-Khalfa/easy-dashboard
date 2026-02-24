import mongoose from 'mongoose';
import { globSync } from 'glob';
import path from 'path';

// Load all models
const models = globSync('./models/*.ts');
models.forEach((file) => {
  require(path.resolve(file));
});

process.env.JWT_SECRET = 'test_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.DATABASE = 'mongodb://localhost:27017/test';
