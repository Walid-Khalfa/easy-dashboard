import request from 'supertest';
import app from '../app';
import Admin from '../models/Admin';

jest.mock('../models/Admin');

describe('Auth API', () => {
  it('should return 400 for login without email', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'invalid-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });
});
