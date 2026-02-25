import { ILead, CreateLeadDTO, UpdateLeadDTO } from '../entities/Lead';

export interface ILeadRepository {
  findById(id: string): Promise<ILead | null>;
  findAll(
    page?: number,
    limit?: number,
    sort?: string
  ): Promise<{
    data: ILead[];
    pagination: { page: number; pages: number; count: number; limit: number };
  }>;
  create(data: CreateLeadDTO): Promise<ILead>;
  update(id: string, data: UpdateLeadDTO): Promise<ILead | null>;
  softDelete(id: string): Promise<ILead | null>;
  search(query: string, fields?: string[], limit?: number): Promise<ILead[]>;
  findByClient(clientId: string): Promise<ILead[]>;
  findByStatus(status: string): Promise<ILead[]>;
}
