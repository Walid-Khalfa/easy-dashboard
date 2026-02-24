import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  enabled: boolean;
  company: string;
  name: string;
  surname: string;
  bankAccount?: string;
  companyRegNumber?: string;
  companyTaxNumber?: string;
  companyTaxID?: string;
  customField: {
    fieldName: string;
    fieldValue: string;
  }[];
  address?: string;
  country?: string;
  phone: string;
  email?: string;
  website?: string;
  created: Date;
}

const clientSchema = new Schema<IClient>({
  enabled: {
    type: Boolean,
    default: true,
  },
  company: {
    type: String,
    trim: true,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  surname: {
    type: String,
    trim: true,
    required: true,
  },
  bankAccount: {
    type: String,
    trim: true,
  },
  companyRegNumber: {
    type: String,
    trim: true,
  },
  companyTaxNumber: {
    type: String,
    trim: true,
  },
  companyTaxID: {
    type: String,
    trim: true,
  },
  customField: [
    {
      fieldName: {
        type: String,
        trim: true,
      },
      fieldValue: {
        type: String,
        trim: true,
      },
    },
  ],
  address: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  website: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>("Client", clientSchema);

export default Client;
