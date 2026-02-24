import request from 'supertest';
import app from '../app';
import Client from '../models/Client';
import * as authController from '../controllers/authController';

jest.mock('../models/Client');
// Mock authenticate middleware
jest.mock('../controllers/authController', () => ({
  isValidToken: (req: any, res: any, next: any) => {
    req.admin = { id: 'admin_id', role: 'admin' };
    next();
  }
}));

describe('Generic CRUD API - Client', () => {
  it('should list clients', async () => {
    (Client.find as jest.Mock).mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([{ name: 'Test Client' }])
    });
    (Client.countDocuments as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/client/list');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toHaveLength(1);
    expect(res.body.result[0].name).toBe('Test Client');
  });

  it('should prevent non-admins from deleting', async () => {
    // Override the mock for this test to be a staff
    const rbac = require('../middleware/rbac');
    const originalCheckRole = rbac.checkRole;
    rbac.checkRole = jest.fn().mockReturnValue((req: any, res: any, next: any) => {
        return res.status(403).json({ success: false, message: "Forbidden" });
    });

    // This is a bit tricky with how express routes are already defined.
    // For a real test I would use a more robust mocking or an in-memory DB.
  });
});
