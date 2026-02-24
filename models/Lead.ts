import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
  date: string;
  client: string;
  phone: string;
  email: string;
  budget?: number;
  request?: string;
  status: string;
  created: Date;
  removed: boolean;
}

const leadSchema = new Schema<ILead>({
  date: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  budget: {
    type: Number,
  },
  request: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
  },
  removed: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>("Lead", leadSchema);

export default Lead;
