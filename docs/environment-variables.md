# Environment Variables

This document describes all environment variables used by Easy-Dashboard. For local development, copy `.env.example` to `.variables.env` and fill in the values.

## Required Variables

| Variable             | Type   | Required | Default       | Description                                   |
| -------------------- | ------ | -------- | ------------- | --------------------------------------------- |
| `NODE_ENV`           | enum   | Yes      | `development` | Application environment                       |
| `PORT`               | number | No       | `8000`        | Server port                                   |
| `DATABASE`           | string | Yes      | -             | MongoDB connection string                     |
| `SECRET`             | string | Yes      | -             | Session secret (min 32 chars)                 |
| `KEY`                | string | Yes      | -             | Session key (min 32 chars)                    |
| `JWT_SECRET`         | string | Yes      | -             | Access token secret (min 32 chars)            |
| `JWT_REFRESH_SECRET` | string | Yes\*    | -             | Refresh token secret (required in production) |
| `FRONTEND_URL`       | string | Yes      | -             | Frontend URL for CORS                         |

\*Required in production. Falls back to default in development.

## Optional Variables

| Variable               | Type   | Default    | Description                     |
| ---------------------- | ------ | ---------- | ------------------------------- |
| `JWT_TOKEN_EXPIRATION` | number | `18000000` | Access token TTL in ms (15 min) |
| `JWT_SCHEME`           | string | `jwt`      | Auth scheme name                |
| `JWT_TOKEN_PREFIX`     | string | `Bearer`   | Auth header prefix              |
| `JWT_TOKEN_HASH_ALGO`  | string | `SHA-256`  | Hash algorithm                  |
| `REDIS_URL`            | -      | -          | Redis URL for token blocklist   |

## Detailed Description

### NODE_ENV

Application environment. Affects behavior:

- `development`: Verbose errors, Swagger docs enabled
- `production`: Generic errors, Swagger disabled, secrets required
- `test`: Test configuration

```bash
NODE_ENV=development  # Dev
NODE_ENV=production  # Prod
NODE_ENV=test        # Testing
```

### DATABASE

MongoDB connection string.

```bash
# Local MongoDB
DATABASE=mongodb://localhost:27017/easy-dashboard

# MongoDB Atlas
DATABASE=mongodb+srv://<username>:<password>@cluster.mongodb.net/easy-dashboard
```

### JWT_SECRET & JWT_REFRESH_SECRET

**Critical security variables.** Must be long, random strings.

```bash
# Generate secure secrets (Linux/Mac)
openssl rand -base64 32

# Example
JWT_SECRET=your-super-secure-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-super-secure-secret-min-32
```

### FRONTEND_URL

Used for CORS configuration. Must match your frontend URL exactly.

```bash
# Development
FRONTEND_URL=http://localhost:3000

# Production
FRONTEND_URL=https://your-domain.com
```

### REDIS_URL (Optional)

For production, use Redis for token blocklist. Development falls back to in-memory.

```bash
REDIS_URL=redis://localhost:6379

# Or with auth
REDIS_URL=redis://:password@redis-host:6379
```

## Example Configuration

### Development (.variables.env)

```bash
NODE_ENV=development
PORT=8000
DATABASE=mongodb://localhost:27017/easy-dashboard
SECRET=dev-secret-change-in-production-32chars
KEY=dev-key-change-in-production-32chars
JWT_SECRET=dev-jwt-secret-min-32-characters
JWT_REFRESH_SECRET=dev-refresh-secret-min-32-characters
JWT_TOKEN_EXPIRATION=18000000
JWT_SCHEME=jwt
JWT_TOKEN_PREFIX=Bearer
JWT_TOKEN_HASH_ALGO=SHA-256
FRONTEND_URL=http://localhost:3000
```

### Production (.variables.env)

```bash
NODE_ENV=production
PORT=8000
DATABASE=mongodb+srv://admin:password@cluster.mongodb.net/easy-dashboard?retryWrites=true&w=majority
SECRET=<generated-64-char-secret>
KEY=<generated-64-char-key>
JWT_SECRET=<generated-64-char-secret>
JWT_REFRESH_SECRET=<generated-64-char-secret>
JWT_TOKEN_EXPIRATION=18000000
JWT_SCHEME=jwt
JWT_TOKEN_PREFIX=Bearer
JWT_TOKEN_HASH_ALGO=SHA-256
REDIS_URL=redis://:complex-password@redis.cloud.provider.com:6379
FRONTEND_URL=https://your-app.com
```

## Validation

The application validates required variables at startup:

```typescript
// app.ts
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'SECRET', 'KEY', 'DATABASE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (process.env.NODE_ENV === 'production' && missingEnvVars.length > 0) {
  console.error(`ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}
```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use different secrets** for each environment
3. **Rotate secrets** periodically
4. **Use strong randomness** (e.g., `openssl rand -base64 32`)
5. **Use secrets management** in production (AWS Secrets Manager, HashiCorp Vault, etc.)

## Related Documentation

- [Authentication Overview](../authentication/overview.md)
- [Cookies Configuration](../authentication/cookies.md)
- [Deployment Checklist](../deployment/checklist.md)
