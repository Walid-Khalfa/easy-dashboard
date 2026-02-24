"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
const path_1 = __importDefault(require("path"));
// Load all models
const models = (0, glob_1.globSync)('./models/*.ts');
models.forEach((file) => {
    require(path_1.default.resolve(file));
});
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.DATABASE = 'mongodb://localhost:27017/test';
