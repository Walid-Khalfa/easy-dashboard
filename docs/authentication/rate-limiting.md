# Rate Limiting

Easy-Dashboard implements rate limiting to protect against brute-force attacks on authentication endpoints.

## Rate Limit Configuration

### Login Rate Limiting

```typescript
// controllers/authController.ts:38-45
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
});
```

### API Rate Limiting

```typescript
// app.ts:57-62
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
```

## Rate Limit Summary

| Endpoint             | Limit        | Window | Response      |
| -------------------- | ------------ | ------ | ------------- |
| `/api/auth/login`    | 5 attempts   | 15 min | 429 + message |
| `/api/auth/register` | 5 attempts   | 15 min | 429 + message |
| `/api/*` (all)       | 100 requests | 15 min | 429 + message |

## HTTP Response Headers

Easy-Dashboard uses standard rate limit headers:

```http
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1706200500
```

| Header                | Description                       |
| --------------------- | --------------------------------- |
| `RateLimit-Limit`     | Maximum requests allowed          |
| `RateLimit-Remaining` | Requests remaining in window      |
| `RateLimit-Reset`     | Unix timestamp when window resets |

## Implementation Details

### express-rate-limit Configuration

```typescript
// Key differences from default
{
  standardHeaders: true,    // Return RateLimit-* headers
  legacyHeaders: false,    // Don't use X-RateLimit-*
  skipSuccessfulRequests: false,  // Count ALL requests (success + fail)
  skipFailedRequests: false,      // Don't skip failed requests
  handler: (req, res) => {      // Custom response
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.'
    });
  }
}
```

## Attack Mitigation

### Brute Force Protection

```
Attack Timeline:
─────────────────────────────────────────────────────────────▶

Attempt 1-5:    ❌ 401 (invalid credentials) - Counted
Attempt 6:      ❌ 429 (rate limited) - Blocked 15 min
Attempt 7+:    ❌ 429 (rate limited) - Still blocked

After 15 min:  ✓ 401 (normal response) - Counter reset
```

### Distributed Attack Protection

Rate limiting is based on IP address:

- Single IP: Max 5 login attempts / 15 min
- Multiple IPs: Each gets independent limit

## Customization

### Modify Login Attempts

```typescript
// For stricter limits
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // Only 3 attempts
  // ...
});
```

### Modify API Limits

```typescript
// app.ts
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Stricter API limit
  // ...
});
```

## Production Considerations

### Redis-Backed Rate Limiting

For multi-server deployments, consider Redis-backed storage:

```typescript
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL);

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
});
```

### Headers in Production

Ensure reverse proxy forwards rate limit headers:

```nginx
# nginx.conf
proxy_set_header X-RateLimit-Limit $limit;
proxy_set_header X-RateLimit-Remaining $remaining;
proxy_set_header X-RateLimit-Reset $reset;
```

## Related Documentation

- [Authentication Overview](./overview.md)
- [Account Lockout](./account-lockout.md)
