import mongoose, { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  protected filterBodyBySchema(body: Record<string, unknown>): Record<string, unknown> {
    const schemaPaths = Object.keys(this.model.schema.paths);
    const filteredBody: Record<string, unknown> = {};

    for (const key of Object.keys(body)) {
      if (schemaPaths.includes(key)) {
        filteredBody[key] = body[key];
      }
    }

    return filteredBody;
  }

  protected validateFields(fields: string[]): { valid: string[]; invalid: string[] } {
    const schemaPaths = Object.keys(this.model.schema.paths);
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const field of fields) {
      const trimmedField = field.trim();
      if (schemaPaths.includes(trimmedField)) {
        valid.push(trimmedField);
      } else {
        invalid.push(trimmedField);
      }
    }

    return { valid, invalid };
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne({ _id: id, removed: false });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    sort: string = 'createdAt:-1',
    filter: Record<string, unknown> = {}
  ): Promise<{
    data: T[];
    pagination: { page: number; pages: number; count: number; limit: number };
  }> {
    const skip = (page - 1) * limit;
    const sortOption: Record<string, 1 | -1> = this.parseSort(sort);
    const query = { ...filter, removed: false } as FilterQuery<T>;

    const [data, count] = await Promise.all([
      this.model.find(query).skip(skip).limit(limit).sort(sortOption),
      this.model.countDocuments(query),
    ]);

    const pages = Math.ceil(count / limit);

    return {
      data,
      pagination: { page, pages, count, limit },
    };
  }

  async create(data: Partial<T>): Promise<T> {
    const filteredData = this.filterBodyBySchema(data as Record<string, unknown>);
    return this.model.create(filteredData);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const filteredData = this.filterBodyBySchema(data as Record<string, unknown>);
    return this.model.findOneAndUpdate(
      { _id: id, removed: false } as FilterQuery<T>,
      { $set: filteredData } as UpdateQuery<T>,
      { new: true, runValidators: true }
    );
  }

  async softDelete(id: string): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { _id: id, removed: false } as FilterQuery<T>,
      { $set: { removed: true } } as UpdateQuery<T>,
      { new: true }
    );
  }

  async search(query: string, fields: string[], limit: number = 10): Promise<T[]> {
    const { valid } = this.validateFields(fields);

    if (valid.length === 0) {
      return [];
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const searchConditions = valid.map(field => ({
      [field]: { $regex: new RegExp(escapedQuery, 'i') },
    }));

    return this.model
      .find({
        $or: searchConditions,
        removed: false,
      } as unknown as FilterQuery<T>)
      .limit(limit);
  }

  private parseSort(sort: string): Record<string, 1 | -1> {
    if (!sort) return { createdAt: -1 };

    const [field, order] = sort.split(':');
    return { [field]: order === '1' ? 1 : -1 };
  }
}
