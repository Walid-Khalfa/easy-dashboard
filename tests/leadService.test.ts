import { LeadService } from '../src/application/services/LeadService';

jest.mock('../src/infrastructure/repositories/LeadRepository', () => {
  return {
    LeadRepository: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        date: '2024-01-15',
        client: 'Test Client',
        phone: '+1234567890',
        email: 'test@example.com',
        status: 'pending',
      }),
      findById: jest.fn().mockImplementation((id: string) => {
        if (!id) {
          throw new Error('Invalid ID format');
        }
        return Promise.resolve({
          _id: id,
          date: '2024-01-15',
          client: 'Test Client',
          phone: '+1234567890',
          email: 'test@example.com',
          status: 'pending',
        });
      }),
      findAll: jest.fn().mockResolvedValue({
        data: [],
        pagination: { page: 1, pages: 1, count: 0, limit: 10 },
      }),
      update: jest.fn().mockImplementation((id: string) => {
        if (!id) {
          throw new Error('Invalid ID format');
        }
        return Promise.resolve(null);
      }),
      softDelete: jest.fn().mockResolvedValue(null),
      search: jest.fn().mockResolvedValue([]),
    })),
  };
});

describe('LeadService - Unit Tests', () => {
  let leadService: LeadService;

  beforeEach(() => {
    leadService = new LeadService();
  });

  describe('create', () => {
    it('should fail with invalid email', async () => {
      const invalidData = {
        body: {
          date: '2024-01-15',
          client: 'Test Client',
          phone: '+1234567890',
          email: 'invalid-email',
        },
      };

      const result = await leadService.create(invalidData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with missing required fields', async () => {
      const incompleteData = {
        body: {
          date: '2024-01-15',
        },
      };

      const result = await leadService.create(incompleteData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('findById', () => {
    it('should return error for empty id', async () => {
      const result = await leadService.findById('');

      expect(result.success).toBe(false);
    });

    it('should find lead by valid id', async () => {
      const result = await leadService.findById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('update', () => {
    it('should return error for empty id', async () => {
      const result = await leadService.update('', {});

      expect(result.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should return error for empty id', async () => {
      const result = await leadService.delete('');

      expect(result.success).toBe(false);
    });
  });

  describe('search', () => {
    it('should return empty array for empty query', async () => {
      const result = await leadService.search('');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should return empty array for whitespace query', async () => {
      const result = await leadService.search('   ');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const result = await leadService.findAll(1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.pagination).toBeDefined();
    });
  });
});
