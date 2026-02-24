"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(5, 'Password must be at least 5 characters long'),
    }),
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(5, 'Password must be at least 5 characters long'),
        passwordCheck: zod_1.z.string(),
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters long'),
        surname: zod_1.z.string().min(2, 'Surname must be at least 2 characters long'),
    }).refine((data) => data.password === data.passwordCheck, {
        message: "Passwords don't match",
        path: ["passwordCheck"],
    }),
});
