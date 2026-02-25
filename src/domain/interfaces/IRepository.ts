export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(pagination?: PaginationParams): Promise<PaginatedResult<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  search(query: string, fields: string[]): Promise<T[]>;
}

export interface PaginationParams {
  page: number;
  itemsPerPage: number;
  sort?: string;
  filter?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    itemsPerPage: number;
    total: number;
    pages: number;
  };
}

export interface SearchParams {
  query: string;
  fields: string[];
  limit?: number;
}
