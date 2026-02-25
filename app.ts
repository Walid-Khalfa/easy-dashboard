import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

import apiRouter from './routes/api';
import authApiRouter from './routes/authApi';
import * as errorHandlers from './handlers/errorHandlers';
import { requestLogger, errorLogger } from './middleware/logger';
import * as healthController from './controllers/healthController';

dotenv.config({ path: '.variables.env' });

const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'SECRET', 'KEY', 'DATABASE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (process.env.NODE_ENV === 'production' && missingEnvVars.length > 0) {
  console.error(`ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app = express();

app.use(requestLogger as express.RequestHandler);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    crossOriginEmbedderPolicy: false,
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(compression());
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'PATCH', 'PUT', 'POST', 'DELETE'],
    exposedHeaders: ['Content-Length'],
    allowedHeaders: [
      'Accept',
      'Authorization',
      'x-auth-token',
      'Content-Type',
      'X-Requested-With',
      'Range',
    ],
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

if (process.env.DATABASE && process.env.NODE_ENV !== 'test') {
  if (!process.env.SECRET || !process.env.KEY) {
    console.error('ERROR: SECRET and KEY environment variables are required');
    process.exit(1);
  }
  app.use(
    session({
      secret: process.env.SECRET,
      name: process.env.KEY,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.DATABASE }),
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );
} else {
  app.use(
    session({
      secret:
        process.env.SECRET ||
        (() => {
          throw new Error('SECRET required in production');
        })(),
      name:
        process.env.KEY ||
        (() => {
          throw new Error('KEY required in production');
        })(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );
}

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.currentPath = req.path;
  next();
});

// Public health check endpoints
app.get('/health', healthController.healthCheck);
app.get('/health/ready', healthController.readinessCheck);

// Swagger UI (non-production only)
if (process.env.NODE_ENV !== 'production') {
  const openApiSpec = JSON.parse(fs.readFileSync(path.resolve('./docs/api/openapi.json'), 'utf-8'));

  app.use('/api/docs', swaggerUi.serve);
  app.get(
    '/api/docs',
    swaggerUi.setup(openApiSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Easy-Dashboard API Docs',
    })
  );
  app.get('/api-docs/openapi.json', (req: Request, res: Response) => {
    res.json(openApiSpec);
  });
}

app.use('/api', authApiRouter);
app.use('/api', apiRouter);

app.use(errorLogger as express.ErrorRequestHandler);

app.use(errorHandlers.notFound);

if (app.get('env') === 'development') {
  app.use(errorHandlers.developmentErrors);
}

app.use(errorHandlers.productionErrors);

export default app;
