import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import Admin from '../models/Admin';

dotenv.config({ path: path.join(__dirname, '/../.variables.env') });

if (!process.env.DATABASE) {
  console.error('DATABASE environment variable is not defined');
  process.exit(1);
}

mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;

async function createAdmin() {
  try {
    const adminExists = await Admin.findOne({ email: "admin@demo.com" });
    if (adminExists) {
      console.log("Admin already exists!");
      process.exit();
    }

    const newAdmin = new Admin();
    const passwordHash = newAdmin.generateHash("123456");

    await new Admin({
      email: "admin@demo.com",
      password: passwordHash,
      name: "admin",
      surname: "demo",
      role: 'admin',
    }).save();

    console.log("👍👍👍👍👍👍👍👍 Admin created : Done!");
    process.exit();
  } catch (e) {
    console.log("\n👎👎👎👎👎👎👎👎 Error! The Error info is below");
    console.log(e);
    process.exit();
  }
}

createAdmin();
