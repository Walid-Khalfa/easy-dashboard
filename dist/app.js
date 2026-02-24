"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routers
const api_1 = __importDefault(require("./routes/api"));
const authApi_1 = __importDefault(require("./routes/authApi"));
// Import error handlers
const errorHandlers = __importStar(require("./handlers/errorHandlers"));
dotenv_1.default.config({ path: '.variables.env' });
// create our Express app
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "PATCH", "PUT", "POST", "DELETE"],
    exposedHeaders: ["Content-Length"],
    allowedHeaders: ["Accept", "Authorization", "x-auth-token", "Content-Type", "X-Requested-With", "Range"]
}));
// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// Takes the raw requests and turns them into usable properties on req.body
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Sessions allow us to Contact data on visitors from request to request
if (process.env.DATABASE && process.env.NODE_ENV !== 'test') {
    app.use((0, express_session_1.default)({
        secret: process.env.SECRET || 'secret',
        name: process.env.KEY || 'key',
        resave: false,
        saveUninitialized: false,
        store: connect_mongo_1.default.create({ mongoUrl: process.env.DATABASE }),
    }));
}
else {
    app.use((0, express_session_1.default)({
        secret: process.env.SECRET || 'secret',
        name: process.env.KEY || 'key',
        resave: false,
        saveUninitialized: false,
    }));
}
// pass variables to our templates + all requests
app.use((req, res, next) => {
    // @ts-ignore
    res.locals.admin = req.admin || null;
    res.locals.currentPath = req.path;
    next();
});
// Here our API Routes
app.use("/api", authApi_1.default);
app.use("/api", api_1.default);
// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);
// Otherwise this was a really bad error we didn't expect!
if (app.get("env") === "development") {
    /* Development Error Handler - Prints stack trace */
    app.use(errorHandlers.developmentErrors);
}
// production error handler
app.use(errorHandlers.productionErrors);
exports.default = app;
