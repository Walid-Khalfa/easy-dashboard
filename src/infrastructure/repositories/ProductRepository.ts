import Product from '../../../models/Product';

export type ProductData = {
  _id?: string;
  enabled?: boolean;
  productName: string;
  description?: string;
  price?: number;
  status?: string;
  removed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IProductRepository {
  findById(id: string): Promise<ProductData | null>;
  findAll(
    page?: number,
    limit?: number,
    sort?: string
  ): Promise<{
    data: ProductData[];
    pagination: { page: number; pages: number; count: number; limit: number };
  }>;
  create(data: Partial<ProductData>): Promise<ProductData>;
  update(id: string, data: Partial<ProductData>): Promise<ProductData | null>;
  softDelete(id: string): Promise<ProductData | null>;
  search(query: string, fields?: string[], limit?: number): Promise<ProductData[]>;
}

export class ProductRepository implements IProductRepository {
  private productModel = Product;

  private mapToProductData(doc: any): ProductData {
    return {
      _id: doc._id?.toString(),
      enabled: doc.enabled,
      productName: doc.productName,
      description: doc.description,
      price: doc.price,
      status: doc.status,
      removed: doc.removed,
      createdAt: doc.created || doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<ProductData | null> {
    const result = await this.productModel.findOne({ _id: id, removed: false }).lean();
    return result ? this.mapToProductData(result) : null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    sort: string = 'created:-1'
  ): Promise<{
    data: ProductData[];
    pagination: { page: number; pages: number; count: number; limit: number };
  }> {
    const skip = (page - 1) * limit;
    const sortOption = this.parseSort(sort);

    const [data, count] = await Promise.all([
      this.productModel.find({ removed: false }).skip(skip).limit(limit).sort(sortOption).lean(),
      this.productModel.countDocuments({ removed: false }),
    ]);

    const pages = Math.ceil(count / limit);

    return {
      data: data.map(d => this.mapToProductData(d)),
      pagination: { page, pages, count, limit },
    };
  }

  async create(data: Partial<ProductData>): Promise<ProductData> {
    const result = await this.productModel.create(data);
    return this.mapToProductData(result);
  }

  async update(id: string, data: Partial<ProductData>): Promise<ProductData | null> {
    const result = await this.productModel
      .findOneAndUpdate(
        { _id: id, removed: false },
        { $set: data },
        { new: true, runValidators: true }
      )
      .lean();
    return result ? this.mapToProductData(result) : null;
  }

  async softDelete(id: string): Promise<ProductData | null> {
    const result = await this.productModel
      .findOneAndUpdate({ _id: id, removed: false }, { $set: { removed: true } }, { new: true })
      .lean();
    return result ? this.mapToProductData(result) : null;
  }

  async search(
    query: string,
    fields: string[] = ['productName', 'description'],
    limit: number = 10
  ): Promise<ProductData[]> {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const searchConditions = fields.map(field => ({
      [field]: { $regex: new RegExp(escapedQuery, 'i') },
    }));

    const results = await this.productModel
      .find({
        $or: searchConditions,
        removed: false,
      })
      .limit(limit)
      .lean();

    return results.map(d => this.mapToProductData(d));
  }

  private parseSort(sort: string): Record<string, 1 | -1> {
    if (!sort) return { created: -1 };
    const [field, order] = sort.split(':');
    return { [field]: order === '1' ? 1 : -1 };
  }
}
