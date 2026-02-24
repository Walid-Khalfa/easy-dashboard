import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { globSync } from 'glob';
import path from 'path';

// Make sure we are running node 18.0+
const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 18) {
  console.log('Please go to nodejs.org and download version 18 or greater. \n ');
  process.exit();
}

// import environmental variables from our variables.env file
dotenv.config({ path: '.variables.env' });

// Connect to our Database and handle any bad connections
if (!process.env.DATABASE) {
  console.error('DATABASE environment variable is not defined');
  process.exit(1);
}

mongoose.connect(process.env.DATABASE);

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`Error → : ${err.message}`);
});

// Import all models
// We use sync glob to register all models
const models = globSync('./models/*.{js,ts}');
models.forEach((file) => {
  require(path.resolve(file));
});

// Start our app!
import app from './app';
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Express running → On PORT : ${PORT}`);
});
