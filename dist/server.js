"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const glob_1 = require("glob");
const path_1 = __importDefault(require("path"));
// Make sure we are running node 18.0+
const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 18) {
    console.log('Please go to nodejs.org and download version 18 or greater. \n ');
    process.exit();
}
// import environmental variables from our variables.env file
dotenv_1.default.config({ path: '.variables.env' });
// Connect to our Database and handle any bad connections
if (!process.env.DATABASE) {
    console.error('DATABASE environment variable is not defined');
    process.exit(1);
}
mongoose_1.default.connect(process.env.DATABASE);
mongoose_1.default.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose_1.default.connection.on('error', (err) => {
    console.error(`Error → : ${err.message}`);
});
// Import all models
// We use sync glob to register all models
const models = (0, glob_1.globSync)('./models/*.{js,ts}');
models.forEach((file) => {
    require(path_1.default.resolve(file));
});
// Start our app!
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 8000;
app_1.default.listen(PORT, () => {
    console.log(`Express running → On PORT : ${PORT}`);
});
