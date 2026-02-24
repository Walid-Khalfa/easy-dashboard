// Integration tests for Easy-Dashboard API - Schema validation tests

describe('Auth Validation Schemas', () => {
  it('should have valid login schema', () => {
    const { loginSchema } = require('../validations/auth');
    expect(loginSchema).toBeDefined();
  });

  it('should have valid register schema', () => {
    const { registerSchema } = require('../validations/auth');
    expect(registerSchema).toBeDefined();
  });

  it('should have valid refresh schema', () => {
    const { refreshSchema } = require('../validations/auth');
    expect(refreshSchema).toBeDefined();
  });

  it('should have admin schemas', () => {
    const { adminCreateSchema, adminUpdateSchema, adminPasswordUpdateSchema } = require('../validations/auth');
    expect(adminCreateSchema).toBeDefined();
    expect(adminUpdateSchema).toBeDefined();
    expect(adminPasswordUpdateSchema).toBeDefined();
  });
});

describe('CRUD Validation Schemas', () => {
  it('should have valid client create schema', () => {
    const { clientCreateSchema } = require('../validations/crud');
    expect(clientCreateSchema).toBeDefined();
  });

  it('should have valid lead create schema', () => {
    const { leadCreateSchema } = require('../validations/crud');
    expect(leadCreateSchema).toBeDefined();
  });

  it('should have valid product create schema', () => {
    const { productCreateSchema } = require('../validations/crud');
    expect(productCreateSchema).toBeDefined();
  });

  it('should have pagination schema', () => {
    const { paginationSchema } = require('../validations/crud');
    expect(paginationSchema).toBeDefined();
  });

  it('should have search schema', () => {
    const { searchSchema } = require('../validations/crud');
    expect(searchSchema).toBeDefined();
  });
});

describe('Auth Controller', () => {
  it('should have login function', () => {
    const authController = require('../controllers/authController');
    expect(authController.login).toBeDefined();
    expect(typeof authController.login).toBe('function');
  });

  it('should have register function', () => {
    const authController = require('../controllers/authController');
    expect(authController.register).toBeDefined();
    expect(typeof authController.register).toBe('function');
  });

  it('should have isValidToken function', () => {
    const authController = require('../controllers/authController');
    expect(authController.isValidToken).toBeDefined();
    expect(typeof authController.isValidToken).toBe('function');
  });

  it('should have logout function', () => {
    const authController = require('../controllers/authController');
    expect(authController.logout).toBeDefined();
    expect(typeof authController.logout).toBe('function');
  });
});
