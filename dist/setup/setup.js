"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const Admin_1 = __importDefault(require("../models/Admin"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '/../.variables.env') });
if (!process.env.DATABASE) {
    console.error('DATABASE environment variable is not defined');
    process.exit(1);
}
mongoose_1.default.connect(process.env.DATABASE);
mongoose_1.default.Promise = global.Promise;
async function createAdmin() {
    try {
        const adminExists = await Admin_1.default.findOne({ email: "admin@demo.com" });
        if (adminExists) {
            console.log("Admin already exists!");
            process.exit();
        }
        const newAdmin = new Admin_1.default();
        const passwordHash = newAdmin.generateHash("123456");
        await new Admin_1.default({
            email: "admin@demo.com",
            password: passwordHash,
            name: "admin",
            surname: "demo",
            role: 'admin',
        }).save();
        console.log("👍👍👍👍👍👍👍👍 Admin created : Done!");
        process.exit();
    }
    catch (e) {
        console.log("\n👎👎👎👎👎👎👎👎 Error! The Error info is below");
        console.log(e);
        process.exit();
    }
}
createAdmin();
