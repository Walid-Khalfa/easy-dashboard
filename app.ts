import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routers
import apiRouter from './routes/api';
import authApiRouter from './routes/authApi';

// Import error handlers
import * as errorHandlers from './handlers/errorHandlers';

dotenv.config({ path: '.variables.env' });

// create our Express app
const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use("/api", limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "PATCH", "PUT", "POST", "DELETE"],
  exposedHeaders: ["Content-Length"],
  allowedHeaders: ["Accept", "Authorization", "x-auth-token", "Content-Type", "X-Requested-With", "Range"]
}));

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, "public")));

// Takes the raw requests and turns them into usable properties on req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions allow us to Contact data on visitors from request to request
if (process.env.DATABASE && process.env.NODE_ENV !== 'test') {
  app.use(
    session({
      secret: process.env.SECRET || 'secret',
      name: process.env.KEY || 'key',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.DATABASE }),
    })
  );
} else {
  app.use(
    session({
      secret: process.env.SECRET || 'secret',
      name: process.env.KEY || 'key',
      resave: false,
      saveUninitialized: false,
    })
  );
}

// pass variables to our templates + all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  res.locals.admin = req.admin || null;
  res.locals.currentPath = req.path;
  next();
});

// Here our API Routes
app.use("/api", authApiRouter);
app.use("/api", apiRouter);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Otherwise this was a really bad error we didn't expect!
if (app.get("env") === "development") {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

export default app;
