import {
  ProductRepository,
  ProductData,
} from '../../infrastructure/repositories/ProductRepository';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from '../../domain/entities/Product';

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

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  async create(data: unknown): Promise<ServiceResult<ProductData>> {
    const validation = createProductSchema.safeParse(data);

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
      const product = await this.repository.create(validation.data as any);
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create product',
        },
      };
    }
  }

  async findById(id: string): Promise<ServiceResult<ProductData>> {
    const validation = productIdSchema.safeParse({ params: { id } });

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
      const product = await this.repository.findById(id);

      if (!product) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'READ_ERROR',
          message: error instanceof Error ? error.message : 'Failed to read product',
        },
      };
    }
  }

  async findAll(
    page?: number,
    limit?: number,
    sort?: string
  ): Promise<ServiceResult<PaginatedResult<ProductData>>> {
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
          message: error instanceof Error ? error.message : 'Failed to list products',
        },
      };
    }
  }

  async update(id: string, data: unknown): Promise<ServiceResult<ProductData>> {
    const idValidation = productIdSchema.safeParse({ params: { id } });
    const dataValidation = updateProductSchema.safeParse({ body: data, params: { id } });

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
      const product = await this.repository.update(id, dataValidation.data as any);

      if (!product) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update product',
        },
      };
    }
  }

  async delete(id: string): Promise<ServiceResult<ProductData>> {
    const validation = productIdSchema.safeParse({ params: { id } });

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
      const product = await this.repository.softDelete(id);

      if (!product) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete product',
        },
      };
    }
  }

  async search(
    query: string,
    fields?: string[],
    limit?: number
  ): Promise<ServiceResult<ProductData[]>> {
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
          message: error instanceof Error ? error.message : 'Failed to search products',
        },
      };
    }
  }
}
