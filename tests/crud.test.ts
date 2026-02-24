// CRUD Validation Schemas Tests

describe('CRUD Validation Schemas', () => {
  describe('Client Schemas', () => {
    it('should have client create schema', () => {
      const { clientCreateSchema } = require('../validations/crud');
      expect(clientCreateSchema).toBeDefined();
    });

    it('should have client update schema', () => {
      const { clientUpdateSchema } = require('../validations/crud');
      expect(clientUpdateSchema).toBeDefined();
    });

    it('should have client id schema', () => {
      const clientIdSchema = require('../validations/crud').clientIdSchema;
      expect(clientIdSchema).toBeDefined();
    });
  });

  describe('Lead Schemas', () => {
    it('should have lead create schema', () => {
      const { leadCreateSchema } = require('../validations/crud');
      expect(leadCreateSchema).toBeDefined();
    });

    it('should have lead update schema', () => {
      const { leadUpdateSchema } = require('../validations/crud');
      expect(leadUpdateSchema).toBeDefined();
    });

    it('should have lead id schema', () => {
      const leadIdSchema = require('../validations/crud').leadIdSchema;
      expect(leadIdSchema).toBeDefined();
    });
  });

  describe('Product Schemas', () => {
    it('should have product create schema', () => {
      const { productCreateSchema } = require('../validations/crud');
      expect(productCreateSchema).toBeDefined();
    });

    it('should have product update schema', () => {
      const { productUpdateSchema } = require('../validations/crud');
      expect(productUpdateSchema).toBeDefined();
    });

    it('should have product id schema', () => {
      const productIdSchema = require('../validations/crud').productIdSchema;
      expect(productIdSchema).toBeDefined();
    });
  });

  describe('Common Schemas', () => {
    it('should have pagination schema', () => {
      const { paginationSchema } = require('../validations/crud');
      expect(paginationSchema).toBeDefined();
    });

    it('should have search schema', () => {
      const { searchSchema } = require('../validations/crud');
      expect(searchSchema).toBeDefined();
    });

    it('should have id param schema', () => {
      const { idParamSchema } = require('../validations/crud');
      expect(idParamSchema).toBeDefined();
    });
  });
});
