import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  removed: boolean;
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
  removed: {
    type: Boolean,
    default: false,
  },
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

clientSchema.index({ removed: 1, created: -1 });
clientSchema.index({ enabled: 1, removed: 1 });
clientSchema.index({ company: 1 });
clientSchema.index({ name: 1, surname: 1 });
clientSchema.index({ phone: 1 });
// email index removed - not needed for non-unique email field
clientSchema.index({ country: 1 });

const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema);

export default Client;
