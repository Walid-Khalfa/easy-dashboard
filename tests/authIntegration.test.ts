import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import Admin from '../models/Admin';

// Test configuration
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123',
  name: 'Test',
  surname: 'User',
};

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const testDbUrl = process.env.TEST_DATABASE || 'mongodb://localhost:27017/easy-dashboard-test';
    await mongoose.connect(testDbUrl);
    
    // Clean up any existing test user
    await Admin.deleteMany({ email: TEST_USER.email });
  });

  afterAll(async () => {
    // Clean up and disconnect
    await Admin.deleteMany({ email: TEST_USER.email });
    await mongoose.connection.close();
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
          passwordCheck: TEST_USER.password,
          name: TEST_USER.name,
          surname: TEST_USER.surname,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.admin).toBeDefined();
      expect(response.body.admin.email).toBe(TEST_USER.email.toLowerCase());
    });

    it('should reject duplicate email registration', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
          passwordCheck: TEST_USER.password,
          name: TEST_USER.name,
          surname: TEST_USER.surname,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'invalid-email',
          password: TEST_USER.password,
          passwordCheck: TEST_USER.password,
          name: TEST_USER.name,
          surname: TEST_USER.surname,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'newuser@example.com',
          password: 'short',
          passwordCheck: 'short',
          name: 'New',
          surname: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject mismatched passwords', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'newuser2@example.com',
          password: TEST_USER.password,
          passwordCheck: 'DifferentPassword',
          name: 'New',
          surname: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.result.token).toBeDefined();
      expect(response.body.result.refreshToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: TEST_USER.password,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: TEST_USER.email,
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('Account Lockout Mechanism', () => {
    const lockoutTestUser = {
      email: 'lockout-test@example.com',
      password: 'LockoutTest123',
      name: 'Lockout',
      surname: 'Test',
    };

    beforeAll(async () => {
      // Create a test user for lockout testing
      const existingUser = await Admin.findOne({ email: lockoutTestUser.email });
      if (!existingUser) {
        const admin = new Admin({
          email: lockoutTestUser.email,
          password: new Admin().generateHash(lockoutTestUser.password),
          name: lockoutTestUser.name,
          surname: lockoutTestUser.surname,
        });
        await admin.save();
      }
    });

    afterAll(async () => {
      await Admin.deleteMany({ email: lockoutTestUser.email });
    });

    it('should track failed login attempts', async () => {
      // First failed attempt
      const response1 = await request(app)
        .post('/api/login')
        .send({
          email: lockoutTestUser.email,
          password: 'WrongPassword1',
        });

      expect(response1.status).toBe(401);
      expect(response1.body.remainingAttempts).toBeDefined();
      expect(response1.body.remainingAttempts).toBeLessThan(5);

      // Verify failed attempts were recorded
      const admin = await Admin.findOne({ email: lockoutTestUser.email });
      expect(admin?.failedLoginAttempts).toBeGreaterThan(0);
    });

    it('should lock account after 5 failed attempts', async () => {
      // Reset the user first
      await Admin.updateOne(
        { email: lockoutTestUser.email },
        { $set: { failedLoginAttempts: 4, lockedUntil: null } }
      );

      // 5th failed attempt
      const response = await request(app)
        .post('/api/login')
        .send({
          email: lockoutTestUser.email,
          password: 'WrongPassword5',
        });

      expect(response.status).toBe(423);
      expect(response.body.locked).toBe(true);
      expect(response.body.message).toContain('locked');

      // Verify lockout was set
      const admin = await Admin.findOne({ email: lockoutTestUser.email });
      expect(admin?.lockedUntil).toBeDefined();
      expect(admin?.lockedUntil).toBeInstanceOf(Date);
    });

    it('should reject login when account is locked', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: lockoutTestUser.email,
          password: lockoutTestUser.password,
        });

      expect(response.status).toBe(423);
      expect(response.body.locked).toBe(true);
    });

    it('should clear lockout after successful login', async () => {
      // Clear lockout manually
      await Admin.updateOne(
        { email: lockoutTestUser.email },
        { $set: { failedLoginAttempts: 0, lockedUntil: null } }
      );

      const response = await request(app)
        .post('/api/login')
        .send({
          email: lockoutTestUser.email,
          password: lockoutTestUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify lockout was cleared
      const admin = await Admin.findOne({ email: lockoutTestUser.email });
      expect(admin?.failedLoginAttempts).toBe(0);
      expect(admin?.lockedUntil).toBeUndefined();
    });
  });

  describe('POST /api/logout', () => {
    let authToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Login to get tokens
      const response = await request(app)
        .post('/api/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        });

      authToken = response.body.result.token;
      refreshToken = response.body.result.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/logout')
        .set('x-auth-token', authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/logout');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Login to get refresh token
      const response = await request(app)
        .post('/api/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        });

      refreshToken = response.body.result.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/api/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.result.token).toBeDefined();
      expect(response.body.result.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/api/refresh')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});

describe('Token Blocklist Tests', () => {
  let authToken: string;

  beforeEach(async () => {
    // Ensure test user exists
    const existingUser = await Admin.findOne({ email: TEST_USER.email });
    if (!existingUser) {
      const admin = new Admin({
        email: TEST_USER.email,
        password: new Admin().generateHash(TEST_USER.password),
        name: TEST_USER.name,
        surname: TEST_USER.surname,
      });
      await admin.save();
    }

    // Login to get token
    const response = await request(app)
      .post('/api/login')
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

    authToken = response.body.result.token;
  });

  it('should reject revoked token after logout', async () => {
    // First logout
    await request(app)
      .post('/api/logout')
      .set('x-auth-token', authToken);

    // Try to use the same token
    const response = await request(app)
      .get('/api/admin/list')
      .set('x-auth-token', authToken);

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('revoked');
  });
});
