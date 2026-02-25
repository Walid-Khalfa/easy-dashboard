import Client from '../../../models/Client';

export type ClientData = {
  _id?: string;
  removed?: boolean;
  enabled?: boolean;
  company: string;
  name: string;
  surname: string;
  bankAccount?: string;
  companyRegNumber?: string;
  companyTaxNumber?: string;
  companyTaxID?: string;
  customField?: { fieldName: string; fieldValue: string }[];
  address?: string;
  country?: string;
  phone: string;
  email?: string;
  website?: string;
  created?: Date;
  updatedAt?: Date;
};

export interface IClientRepository {
  findById(id: string): Promise<ClientData | null>;
  findAll(
    page?: number,
    limit?: number,
    sort?: string
  ): Promise<{
    data: ClientData[];
    pagination: { page: number; pages: number; count: number; limit: number };
  }>;
  create(data: Partial<ClientData>): Promise<ClientData>;
  update(id: string, data: Partial<ClientData>): Promise<ClientData | null>;
  softDelete(id: string): Promise<ClientData | null>;
  search(query: string, fields?: string[], limit?: number): Promise<ClientData[]>;
  findByCompany(companyId: string): Promise<ClientData[]>;
}

export class ClientRepository implements IClientRepository {
  private clientModel = Client;

  private mapToClientData(doc: any): ClientData {
    return {
      _id: doc._id?.toString(),
      removed: doc.removed,
      enabled: doc.enabled,
      company: doc.company,
      name: doc.name,
      surname: doc.surname,
      bankAccount: doc.bankAccount,
      companyRegNumber: doc.companyRegNumber,
      companyTaxNumber: doc.companyTaxNumber,
      companyTaxID: doc.companyTaxID,
      customField: doc.customField,
      address: doc.address,
      country: doc.country,
      phone: doc.phone,
      email: doc.email,
      website: doc.website,
      created: doc.created,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<ClientData | null> {
    const result = await this.clientModel.findOne({ _id: id, removed: false }).lean();
    return result ? this.mapToClientData(result) : null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    sort: string = 'created:-1'
  ): Promise<{
    data: ClientData[];
    pagination: { page: number; pages: number; count: number; limit: number };
  }> {
    const skip = (page - 1) * limit;
    const sortOption = this.parseSort(sort);

    const [data, count] = await Promise.all([
      this.clientModel.find({ removed: false }).skip(skip).limit(limit).sort(sortOption).lean(),
      this.clientModel.countDocuments({ removed: false }),
    ]);

    const pages = Math.ceil(count / limit);

    return {
      data: data.map(d => this.mapToClientData(d)),
      pagination: { page, pages, count, limit },
    };
  }

  async create(data: Partial<ClientData>): Promise<ClientData> {
    const result = await this.clientModel.create(data);
    return this.mapToClientData(result);
  }

  async update(id: string, data: Partial<ClientData>): Promise<ClientData | null> {
    const result = await this.clientModel
      .findOneAndUpdate(
        { _id: id, removed: false },
        { $set: data },
        { new: true, runValidators: true }
      )
      .lean();
    return result ? this.mapToClientData(result) : null;
  }

  async softDelete(id: string): Promise<ClientData | null> {
    const result = await this.clientModel
      .findOneAndUpdate({ _id: id, removed: false }, { $set: { removed: true } }, { new: true })
      .lean();
    return result ? this.mapToClientData(result) : null;
  }

  async search(
    query: string,
    fields: string[] = ['company', 'name', 'surname', 'phone', 'email'],
    limit: number = 10
  ): Promise<ClientData[]> {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const searchConditions = fields.map(field => ({
      [field]: { $regex: new RegExp(escapedQuery, 'i') },
    }));

    const results = await this.clientModel
      .find({
        $or: searchConditions,
        removed: false,
      })
      .limit(limit)
      .lean();

    return results.map(d => this.mapToClientData(d));
  }

  async findByCompany(companyId: string): Promise<ClientData[]> {
    const results = await this.clientModel.find({ company: companyId, removed: false }).lean();
    return results.map(d => this.mapToClientData(d));
  }

  private parseSort(sort: string): Record<string, 1 | -1> {
    if (!sort) return { created: -1 };
    const [field, order] = sort.split(':');
    return { [field]: order === '1' ? 1 : -1 };
  }
}
