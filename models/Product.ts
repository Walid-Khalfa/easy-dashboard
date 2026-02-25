import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  enabled: boolean;
  productName: string;
  description?: string;
  price?: number;
  status: string;
  removed: boolean;
}

const productSchema = new Schema<IProduct>({
  enabled: {
    type: Boolean,
    default: true,
  },
  productName: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
  },
  status: {
    type: String,
    default: 'available',
  },
  removed: {
    type: Boolean,
    default: false,
  },
});

productSchema.index({ removed: 1, enabled: 1 });
productSchema.index({ productName: 1 });
productSchema.index({ status: 1, removed: 1 });
productSchema.index({ price: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;
