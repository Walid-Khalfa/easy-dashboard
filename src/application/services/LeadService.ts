import { LeadRepository, LeadData } from '../../infrastructure/repositories/LeadRepository';
import { createLeadSchema, updateLeadSchema, leadIdSchema } from '../../domain/entities/Lead';

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

export class LeadService {
  private repository: LeadRepository;

  constructor() {
    this.repository = new LeadRepository();
  }

  async create(data: unknown): Promise<ServiceResult<LeadData>> {
    const validation = createLeadSchema.safeParse(data);

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
      const lead = await this.repository.create(validation.data as any);
      return {
        success: true,
        data: lead,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create lead',
        },
      };
    }
  }

  async findById(id: string): Promise<ServiceResult<LeadData>> {
    const validation = leadIdSchema.safeParse({ params: { id } });

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
      const lead = await this.repository.findById(id);

      if (!lead) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found',
          },
        };
      }

      return {
        success: true,
        data: lead,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'READ_ERROR',
          message: error instanceof Error ? error.message : 'Failed to read lead',
        },
      };
    }
  }

  async findAll(
    page?: number,
    limit?: number,
    sort?: string
  ): Promise<ServiceResult<PaginatedResult<LeadData>>> {
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
          message: error instanceof Error ? error.message : 'Failed to list leads',
        },
      };
    }
  }

  async update(id: string, data: unknown): Promise<ServiceResult<LeadData>> {
    const idValidation = leadIdSchema.safeParse({ params: { id } });
    const dataValidation = updateLeadSchema.safeParse({ body: data, params: { id } });

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
      const lead = await this.repository.update(id, dataValidation.data as any);

      if (!lead) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found',
          },
        };
      }

      return {
        success: true,
        data: lead,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update lead',
        },
      };
    }
  }

  async delete(id: string): Promise<ServiceResult<LeadData>> {
    const validation = leadIdSchema.safeParse({ params: { id } });

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
      const lead = await this.repository.softDelete(id);

      if (!lead) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found',
          },
        };
      }

      return {
        success: true,
        data: lead,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete lead',
        },
      };
    }
  }

  async search(
    query: string,
    fields?: string[],
    limit?: number
  ): Promise<ServiceResult<LeadData[]>> {
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
          message: error instanceof Error ? error.message : 'Failed to search leads',
        },
      };
    }
  }
}
