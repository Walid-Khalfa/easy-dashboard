# Authentication & Security Overview

Easy-Dashboard Pro implements a comprehensive authentication and security system built on industry best practices.

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Easy-Dashboard                           │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React)                                              │
│  └── Stores JWT in memory (Redux), NOT localStorage            │
└────────────────────────┬────────────────────────────────────────┘
                         │ httpOnly Cookies
┌────────────────────────▼────────────────────────────────────────┐
│  Backend (Express + MongoDB)                                    │
│  ├── JWT Access Token (15 min) - Short-lived for API auth       │
│  ├── JWT Refresh Token (7 days) - Long-lived for session       │
│  ├── Token Blocklist (Redis/In-Memory) - For logout handling   │
│  └── Rate Limiting - 5 login attempts per 15 minutes          │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Login Sequence

1. **Client** sends `POST /api/auth/login` with email + password
2. **Server** validates credentials against MongoDB
3. **Server** generates:
   - Access token (15 min expiry) - for API requests
   - Refresh token (7 day expiry) - for session renewal
4. **Server** sets tokens as httpOnly cookies:
   ```http
   Set-Cookie: token=<access_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=900
   Set-Cookie: refreshToken=<refresh_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
   ```
5. **Client** receives success, stores token state in Redux

### Token Refresh Flow

1. Client makes API request with expired access token
2. Server returns `401 Unauthorized`
3. Client calls `POST /api/auth/refresh`
4. Server validates refresh token
5. Server issues new access token
6. Client retries original request

### Logout Flow

1. Client calls `POST /api/auth/logout`
2. Server adds both tokens to blocklist
3. Tokens cannot be used even if captured

## Security Measures

| Feature          | Implementation                 | Location                              |
| ---------------- | ------------------------------ | ------------------------------------- |
| Password Hashing | bcryptjs (salt rounds: 10)     | `controllers/authController.ts`       |
| Token Signing    | JWT with HS256                 | `controllers/authController.ts`       |
| Cookie Security  | httpOnly + Secure + SameSite   | `controllers/authController.ts:31-36` |
| Rate Limiting    | 5 attempts / 15 min            | `middleware/rbac.ts` + `app.ts`       |
| Account Lockout  | lockedUntil timestamp          | `models/Admin.ts`                     |
| Token Blocklist  | Redis (prod) / In-memory (dev) | `utils/tokenBlocklist.ts`             |

## Environment-Specific Behavior

### Development

- Refresh token uses default secret (logged warning)
- In-memory token blocklist
- Verbose error messages

### Production

- Custom JWT_REFRESH_SECRET required
- Redis token blocklist recommended
- Generic error messages (prevent information leakage)
- HTTPS enforced via HSTS headers

## Related Documentation

- [Cookies Configuration](./cookies.md)
- [Token Management](./tokens.md)
- [Rate Limiting](./rate-limiting.md)
- [Account Lockout](./account-lockout.md)
- [RBAC & Permissions](./rbac.md)
