# Health Endpoints

Easy-Dashboard provides two health check endpoints for different purposes.

## Endpoints

### GET /health - Liveness Check

Used by orchestrators (Kubernetes, Docker Compose) to verify the application is running.

```bash
curl http://localhost:8000/health
```

**Response:**

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-02-25T12:00:00.000Z",
  "uptime": 3600.5,
  "environment": "development"
}
```

**Use Case:**

- Kubernetes liveness probe
- Docker healthcheck
- Load balancer health check

---

### GET /health/ready - Readiness Check

Used before routing traffic to ensure dependencies are available.

```bash
curl http://localhost:8000/health/ready
```

**Response (Ready):**

```json
{
  "success": true,
  "status": "ready",
  "checks": {
    "database": "connected"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

**Response (Not Ready):**

```json
{
  "success": false,
  "status": "not ready",
  "checks": {
    "database": "disconnected"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

**Use Case:**

- Kubernetes readiness probe
- Before adding to load balancer pool
- Connection pool validation

---

## Implementation

```typescript
// app.ts

// Liveness - always returns 200
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Readiness - checks dependencies
app.get('/health/ready', async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    const dbState = mongoose.connection.readyState;

    const checks = {
      database: dbState === 1 ? 'connected' : 'disconnected',
    };

    const allHealthy = Object.values(checks).every(v => v === 'connected');

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      status: allHealthy ? 'ready' : 'not ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      success: false,
      status: 'not ready',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});
```

---

## Docker Compose Configuration

```yaml
services:
  backend:
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## Kubernetes Configuration

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 10
```

---

## Response Fields

| Field         | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| `success`     | boolean | Overall health status                                            |
| `status`      | string  | Health status: `healthy` / `not healthy` / `ready` / `not ready` |
| `timestamp`   | ISO8601 | Server timestamp                                                 |
| `uptime`      | number  | Seconds since process started                                    |
| `environment` | string  | `development` / `production` / `test`                            |
| `checks`      | object  | Individual component health (readiness only)                     |

---

## Related Documentation

- [Deployment Checklist](./checklist.md)
- [Docker Setup](../docker-compose.yml)
