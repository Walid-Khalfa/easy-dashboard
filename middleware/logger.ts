import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface RequestWithId extends Request {
  id: string;
  startTime?: number;
}

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'authorization',
  'cookie',
  'x-api-key',
  'creditCard',
  'cvv',
  'ssn',
];

const SENSITIVE_PATTERNS = [/Bearer\s+/i, /token=/i, /jwt=/i, /sessionId=/i];

function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(value)) {
        return '[REDACTED]';
      }
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => redactValue(item));
  }

  if (typeof value === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactValue(val);
      }
    }
    return redacted;
  }

  return value;
}

function formatLog(level: string, message: string, meta: Record<string, unknown> = {}): string {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  return JSON.stringify(logEntry);
}

export const logger = {
  info: (message: string, meta: Record<string, unknown> = {}) => {
    console.log(formatLog('info', message, meta));
  },
  warn: (message: string, meta: Record<string, unknown> = {}) => {
    console.warn(formatLog('warn', message, meta));
  },
  error: (message: string, meta: Record<string, unknown> = {}) => {
    console.error(formatLog('error', message, meta));
  },
  debug: (message: string, meta: Record<string, unknown> = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatLog('debug', message, meta));
    }
  },
};

export const requestLogger = (req: RequestWithId, res: Response, next: NextFunction) => {
  req.id = (req.headers['x-request-id'] as string) || randomUUID();
  req.startTime = Date.now();

  const originalSend = res.send;
  res.send = function (body: unknown): Response {
    res.removeHeader('x-request-id');
    res.setHeader('x-request-id', req.id);
    return originalSend.call(this, body);
  };

  const logResponse = () => {
    const duration = Date.now() - (req.startTime || 0);
    const redactedBody = res.statusCode >= 400 ? redactValue(req.body) : undefined;

    logger.info('HTTP Request completed', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      requestBody: redactedBody,
    });
  };

  res.on('finish', logResponse);
  res.on('error', (err: Error) => {
    logger.error('Response error', {
      requestId: req.id,
      error: err.message,
      stack: err.stack,
    });
  });

  const redactedQuery = redactValue(req.query);
  const redactedBody = redactValue(req.body);

  logger.info('HTTP Request started', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    query: redactedQuery,
    body: redactedBody,
    headers: {
      host: req.get('host'),
      userAgent: req.get('user-agent'),
      contentType: req.get('content-type'),
      accept: req.get('accept'),
    },
  });

  next();
};

export const errorLogger = (err: Error, req: RequestWithId, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    requestId: req.id,
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  });
  next(err);
};

export { redactValue };
