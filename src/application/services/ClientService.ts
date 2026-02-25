import { ClientRepository, ClientData } from '../../infrastructure/repositories/ClientRepository';
import {
  createClientSchema,
  updateClientSchema,
  clientIdSchema,
} from '../../domain/entities/Client';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pages: number;
    count: number;
    limit: number;
  };
}

export class ClientService {
  private repository: ClientRepository;

  constructor() {
    this.repository = new ClientRepository();
  }

  async create(data: unknown): Promise<ServiceResult<ClientData>> {
    const validation = createClientSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map(e => e.message).join(', '),
        },
      };
    }

    try {
      const client = await this.repository.create(validation.data as any);
      return {
        success: true,
        data: client,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create client',
        },
      };
    }
  }

  async findById(id: string): Promise<ServiceResult<ClientData>> {
    const validation = clientIdSchema.safeParse({ params: { id } });

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map(e => e.message).join(', '),
        },
      };
    }

    try {
      const client = await this.repository.findById(id);

      if (!client) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found',
          },
        };
      }

      return {
        success: true,
        data: client,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'READ_ERROR',
          message: error instanceof Error ? error.message : 'Failed to read client',
        },
      };
    }
  }

  async findAll(
    page?: number,
    limit?: number,
    sort?: string
  ): Promise<ServiceResult<PaginatedResult<ClientData>>> {
    try {
      const result = await this.repository.findAll(page, limit, sort);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list clients',
        },
      };
    }
  }

  async update(id: string, data: unknown): Promise<ServiceResult<ClientData>> {
    const idValidation = clientIdSchema.safeParse({ params: { id } });
    const dataValidation = updateClientSchema.safeParse({ body: data, params: { id } });

    if (!idValidation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: idValidation.error.errors.map(e => e.message).join(', '),
        },
      };
    }

    if (!dataValidation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: dataValidation.error.errors.map(e => e.message).join(', '),
        },
      };
    }

    try {
      const client = await this.repository.update(id, dataValidation.data as any);

      if (!client) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found',
          },
        };
      }

      return {
        success: true,
        data: client,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update client',
        },
      };
    }
  }

  async delete(id: string): Promise<ServiceResult<ClientData>> {
    const validation = clientIdSchema.safeParse({ params: { id } });

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map(e => e.message).join(', '),
        },
      };
    }

    try {
      const client = await this.repository.softDelete(id);

      if (!client) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found',
          },
        };
      }

      return {
        success: true,
        data: client,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete client',
        },
      };
    }
  }

  async search(
    query: string,
    fields?: string[],
    limit?: number
  ): Promise<ServiceResult<ClientData[]>> {
    if (!query || query.trim() === '') {
      return {
        success: true,
        data: [],
      };
    }

    try {
      const results = await this.repository.search(query, fields, limit);
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to search clients',
        },
      };
    }
  }
}
