import Lead from '../../../models/Lead';
import { escapeRegex } from '../../../utils/regexEscape';

export type LeadData = {
  _id?: string;
  date: string;
  client: string;
  phone: string;
  email: string;
  budget?: number;
  request?: string;
  status?: string;
  removed?: boolean;
  enabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface ILeadRepository {
  findById(id: string): Promise<LeadData | null>;
  findAll(
    page?: number,
    limit?: number,
    sort?: string
  ): Promise<{
    data: LeadData[];
    pagination: { page: number; pages: number; count: number; limit: number };
  }>;
  create(data: Partial<LeadData>): Promise<LeadData>;
  update(id: string, data: Partial<LeadData>): Promise<LeadData | null>;
  softDelete(id: string): Promise<LeadData | null>;
  search(query: string, fields?: string[], limit?: number): Promise<LeadData[]>;
  findByClient(clientId: string): Promise<LeadData[]>;
  findByStatus(status: string): Promise<LeadData[]>;
}

export class LeadRepository implements ILeadRepository {
  private leadModel = Lead;

  private mapToLeadData(doc: any): LeadData {
    return {
      _id: doc._id?.toString(),
      date: doc.date,
      client: doc.client,
      phone: doc.phone,
      email: doc.email,
      budget: doc.budget,
      request: doc.request,
      status: doc.status,
      removed: doc.removed,
      enabled: doc.enabled,
      createdAt: doc.created || doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<LeadData | null> {
    const result = await this.leadModel.findOne({ _id: id, removed: false }).lean();
    return result ? this.mapToLeadData(result) : null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    sort: string = 'created:-1'
  ): Promise<{
    data: LeadData[];
    pagination: { page: number; pages: number; count: number; limit: number };
  }> {
    const skip = (page - 1) * limit;
    const sortOption = this.parseSort(sort);

    const [data, count] = await Promise.all([
      this.leadModel.find({ removed: false }).skip(skip).limit(limit).sort(sortOption).lean(),
      this.leadModel.countDocuments({ removed: false }),
    ]);

    const pages = Math.ceil(count / limit);

    return {
      data: data.map(d => this.mapToLeadData(d)),
      pagination: { page, pages, count, limit },
    };
  }

  async create(data: Partial<LeadData>): Promise<LeadData> {
    const result = await this.leadModel.create(data);
    return this.mapToLeadData(result);
  }

  async update(id: string, data: Partial<LeadData>): Promise<LeadData | null> {
    const result = await this.leadModel
      .findOneAndUpdate(
        { _id: id, removed: false },
        { $set: data },
        { new: true, runValidators: true }
      )
      .lean();
    return result ? this.mapToLeadData(result) : null;
  }

  async softDelete(id: string): Promise<LeadData | null> {
    const result = await this.leadModel
      .findOneAndUpdate({ _id: id, removed: false }, { $set: { removed: true } }, { new: true })
      .lean();
    return result ? this.mapToLeadData(result) : null;
  }

  async search(
    query: string,
    fields: string[] = ['client', 'phone', 'email'],
    limit: number = 10
  ): Promise<LeadData[]> {
    const escapedQuery = escapeRegex(query);

    const searchConditions = fields.map(field => ({
      [field]: { $regex: new RegExp(escapedQuery, 'i') },
    }));

    const results = await this.leadModel
      .find({
        $or: searchConditions,
        removed: false,
      })
      .limit(limit)
      .lean();

    return results.map(d => this.mapToLeadData(d));
  }

  async findByClient(clientId: string): Promise<LeadData[]> {
    const results = await this.leadModel.find({ client: clientId, removed: false }).lean();
    return results.map(d => this.mapToLeadData(d));
  }

  async findByStatus(status: string): Promise<LeadData[]> {
    const results = await this.leadModel.find({ status, removed: false }).lean();
    return results.map(d => this.mapToLeadData(d));
  }

  private parseSort(sort: string): Record<string, 1 | -1> {
    if (!sort) return { created: -1 };
    const [field, order] = sort.split(':');
    return { [field]: order === '1' ? 1 : -1 };
  }
}
