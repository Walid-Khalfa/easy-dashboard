import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  removed: boolean;
  enabled: boolean;
  email: string;
  password: string;
  name: string;
  surname: string;
  photo?: string;
  createdAt: Date;
  isLoggedIn?: boolean;
  refreshToken?: string;
  role: 'admin' | 'staff';
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  generateHash(password: string): string;
  validPassword(password: string): boolean;
}

const adminSchema = new Schema<IAdmin>({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  photo: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isLoggedIn: {
    type: Boolean,
  },
  refreshToken: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff',
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: {
    type: Date,
  },
});

// Indexes for query optimization
adminSchema.index({ removed: 1, createdAt: -1 });
// email index is automatically created by unique: true in schema
adminSchema.index({ role: 1, removed: 1 });
adminSchema.index({ isLoggedIn: 1 });
adminSchema.index({ refreshToken: 1 });

// generating a hash
adminSchema.methods.generateHash = function (password: string) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync());
};

// checking if password is valid
adminSchema.methods.validPassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;
