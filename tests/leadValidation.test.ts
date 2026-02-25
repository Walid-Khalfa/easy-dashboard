import { createLeadSchema, updateLeadSchema, leadIdSchema } from '../src/domain/entities/Lead';

describe('Lead Domain Validation', () => {
  describe('createLeadSchema', () => {
    it('should validate valid lead data', () => {
      const validData = {
        body: {
          date: '2024-01-15',
          client: 'Test Client',
          phone: '+1234567890',
          email: 'test@example.com',
        },
      };

      const result = createLeadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        body: {
          date: '2024-01-15',
          client: 'Test Client',
          phone: '+1234567890',
          email: 'invalid-email',
        },
      };

      const result = createLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const incompleteData = {
        body: {
          date: '2024-01-15',
        },
      };

      const result = createLeadSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone number', () => {
      const invalidData = {
        body: {
          date: '2024-01-15',
          client: 'Test Client',
          phone: 'abc',
          email: 'test@example.com',
        },
      };

      const result = createLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid status values', () => {
      const statuses = ['pending', 'contacted', 'qualified', 'converted', 'lost'];

      statuses.forEach(status => {
        const data = {
          body: {
            date: '2024-01-15',
            client: 'Test Client',
            phone: '+1234567890',
            email: 'test@example.com',
            status,
          },
        };

        const result = createLeadSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const data = {
        body: {
          date: '2024-01-15',
          client: 'Test Client',
          phone: '+1234567890',
          email: 'test@example.com',
          status: 'invalid-status',
        },
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept optional budget as number', () => {
      const data = {
        body: {
          date: '2024-01-15',
          client: 'Test Client',
          phone: '+1234567890',
          email: 'test@example.com',
          budget: 5000,
        },
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject negative budget', () => {
      const data = {
        body: {
          date: '2024-01-15',
          client: 'Test Client',
          phone: '+1234567890',
          email: 'test@example.com',
          budget: -100,
        },
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateLeadSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        body: {
          client: 'Updated Client',
          status: 'contacted',
        },
        params: {
          id: '507f1f77bcf86cd799439011',
        },
      };

      const result = updateLeadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const validData = {
        body: {
          status: 'qualified',
        },
        params: {
          id: '507f1f77bcf86cd799439011',
        },
      };

      const result = updateLeadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email in update', () => {
      const invalidData = {
        body: {
          email: 'not-an-email',
        },
        params: {
          id: '507f1f77bcf86cd799439011',
        },
      };

      const result = updateLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require id in params', () => {
      const invalidData = {
        body: {
          status: 'qualified',
        },
      };

      const result = updateLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('leadIdSchema', () => {
    it('should validate valid id', () => {
      const validData = {
        params: {
          id: '507f1f77bcf86cd799439011',
        },
      };

      const result = leadIdSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const invalidData = {
        params: {
          id: '',
        },
      };

      const result = leadIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing id', () => {
      const invalidData = {
        params: {},
      };

      const result = leadIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
