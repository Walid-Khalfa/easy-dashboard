"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
jest.mock('../models/Admin');
describe('Auth API', () => {
    it('should return 400 for login without email', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/login')
            .send({ password: 'password123' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
    it('should return 400 for invalid email format', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/login')
            .send({ email: 'invalid-email', password: 'password123' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Validation failed');
    });
});
