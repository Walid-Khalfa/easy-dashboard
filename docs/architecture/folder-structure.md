# Folder Structure

## Backend Architecture (src/)

```
src/
├── domain/                    # Domain Layer - Entities & Interfaces
│   ├── entities/              # Business entities & Zod schemas
│   │   ├── Lead.ts           # Lead entity + validation schemas
│   │   ├── Client.ts         # Client entity + validation schemas
│   │   └── Product.ts         # Product entity + validation schemas
│   │
│   ├── interfaces/            # Repository interfaces
│   │   ├── ILeadRepository.ts
│   │   ├── IRepository.ts
│   │   └── index.ts
│   │
│   ├── types/                 # Shared types
│   └── index.ts               # Domain exports
│
├── application/               # Application Layer - Business Logic
│   ├── services/              # Service implementations
│   │   ├── LeadService.ts
│   │   ├── ClientService.ts
│   │   └── ProductService.ts
│   │
│   ├── dto/                   # Data Transfer Objects
│   ├── errors/                # Domain errors
│   └── index.ts
│
├── infrastructure/            # Infrastructure Layer - Data Access
│   └── repositories/          # Repository implementations
│       ├── LeadRepository.ts  # MongoDB implementation
│       ├── ClientRepository.ts
│       ├── ProductRepository.ts
│       └── index.ts
│
├── interfaces/                # Interface Layer - API
│   ├── controllers/           # Express controllers
│   │   ├── LeadController.ts
│   │   ├── ClientController.ts
│   │   └── ProductController.ts
│   │
│   ├── middleware/           # Route middleware
│   └── routes/                # Route definitions
│
└── config/                    # Configuration
    ├── env.ts                 # Environment schema
    └── openapi.ts             # OpenAPI config
```

## Root Level

```
├── controllers/               # Legacy controllers (to be migrated)
│   ├── adminController.ts
│   ├── authController.ts
│   └── productController.ts
│
├── middleware/               # Express middleware
│   ├── rbac.ts              # Permission matrix
│   ├── logger.ts            # Structured logging
│   └── validate.ts          # Zod validation
│
├── models/                   # MongoDB schemas
│   ├── Admin.ts
│   ├── Lead.ts
│   ├── Client.ts
│   └── Product.ts
│
├── routes/                   # API routes
│   ├── api.ts               # Main API routes
│   └── authApi.ts           # Auth routes
│
├── handlers/                 # Error handlers
│   └── errorHandlers.ts
│
├── utils/                    # Utilities
│   ├── tokenBlocklist.ts
│   └── redis.ts
│
├── validations/             # Zod validation schemas
│   ├── auth.ts
│   └── crud.ts
│
├── docs/                     # Documentation
│   ├── adr/                 # Architecture Decision Records
│   ├── api/                 # OpenAPI spec
│   ├── authentication/       # Auth docs
│   └── deployment/           # Deployment docs
│
└── tests/                   # Test files
    ├── rbac.test.ts
    ├── leadService.test.ts
    └── *.test.ts
```

## Reference Implementation: Lead Domain

The Lead domain demonstrates the full layered architecture:

```
Lead Flow:
─────────────────────────────────────────────────────────────▶

HTTP Request
    │
    ▼
┌─────────────────────────────────────────┐
│  Interface Layer                        │
│  src/interfaces/controllers/LeadController.ts
│  - Parses request                      │
│  - Calls service                       │
│  - Formats response                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Application Layer                       │
│  src/application/services/LeadService.ts
│  - Business logic                       │
│  - Validation orchestration             │
│  - Error handling                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Infrastructure Layer                   │
│  src/infrastructure/repositories/LeadRepository.ts
│  - MongoDB queries                     │
│  - Data mapping                        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Domain Layer                           │
│  src/domain/entities/Lead.ts
│  - Zod validation schemas              │
│  - TypeScript interfaces               │
└─────────────────────────────────────────┘
```

## Conventions

| Pattern              | Location                       | Example                                         |
| -------------------- | ------------------------------ | ----------------------------------------------- |
| Entity + Schema      | `domain/entities/`             | `Lead.ts` contains `ILead` + `createLeadSchema` |
| Repository Interface | `domain/interfaces/`           | `ILeadRepository` defines contract              |
| Repository Impl      | `infrastructure/repositories/` | `LeadRepository` implements `ILeadRepository`   |
| Service              | `application/services/`        | `LeadService` contains business logic           |
| Controller           | `interfaces/controllers/`      | `LeadController` handles HTTP                   |

## Related Documentation

- [ADR-001: Layered Architecture](./adr/001-layered-architecture.md)
- [Authentication RBAC](./authentication/rbac.md)
