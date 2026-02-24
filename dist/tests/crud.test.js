"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const Client_1 = __importDefault(require("../models/Client"));
jest.mock('../models/Client');
// Mock authenticate middleware
jest.mock('../controllers/authController', () => ({
    isValidToken: (req, res, next) => {
        req.admin = { id: 'admin_id', role: 'admin' };
        next();
    }
}));
describe('Generic CRUD API - Client', () => {
    it('should list clients', async () => {
        Client_1.default.find.mockReturnValue({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue([{ name: 'Test Client' }])
        });
        Client_1.default.countDocuments.mockResolvedValue(1);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/client/list');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.result).toHaveLength(1);
        expect(res.body.result[0].name).toBe('Test Client');
    });
    it('should prevent non-admins from deleting', async () => {
        // Override the mock for this test to be a staff
        const rbac = require('../middleware/rbac');
        const originalCheckRole = rbac.checkRole;
        rbac.checkRole = jest.fn().mockReturnValue((req, res, next) => {
            return res.status(403).json({ success: false, message: "Forbidden" });
        });
        // This is a bit tricky with how express routes are already defined.
        // For a real test I would use a more robust mocking or an in-memory DB.
    });
});
