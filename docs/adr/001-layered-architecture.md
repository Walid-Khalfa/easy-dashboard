# ADR-001: Adopt Layered Architecture

## Status

**Accepted** - Implemented in v2.0

## Date

2026-02-25

## Context

The original Easy-Dashboard used a monolithic MVC pattern where controllers directly handled database operations. As the application grew, this became difficult to:

- Test in isolation
- Maintain consistent error handling
- Replicate functionality across new domains (Leads, Clients, Products)

## Decision

We adopted a 4-layer architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Layered Architecture                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐                       │
│   │   Interface  │───▶│  Application │                       │
│   │   (Routes)   │    │  (Services)  │                       │
│   └──────────────┘    └───────┬────────┘                       │
│                               │                                 │
│   ┌──────────────┐    ┌──────▼────────┐                       │
│   │   Domain     │◀───│Infrastructure │                       │
│   │  (Entities)  │    │ (Repositories)│                       │
│   └──────────────┘    └───────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer              | Responsibility                           | Example                 |
| ------------------ | ---------------------------------------- | ----------------------- |
| **Interface**      | HTTP handling, response formatting       | Controllers, Routes     |
| **Application**    | Business logic, validation orchestration | Services                |
| **Domain**         | Entities, interfaces, types              | Zod schemas, interfaces |
| **Infrastructure** | Data access, external services           | MongoDB repositories    |

## Consequences

### Positive

- Clear separation of concerns
- Independent testability per layer
- Consistent patterns when adding new domains
- Easier to swap data sources (e.g., MongoDB → PostgreSQL)
- Enables gradual migration (strangler pattern)

### Negative

- Additional boilerplate for new domains
- More files to navigate
- Learning curve for new developers

## Alternatives Considered

1. **Repository Pattern Only** - Didn't solve business logic organization
2. **Hexagonal Architecture** - Overkill for this application's scope
3. **Microservices** - Not needed at current scale

## Migration Strategy

Using Strangler pattern:

1. New domains (Lead, Client, Product) use new architecture
2. Legacy controllers can gradually be refactored
3. Admin domain still uses legacy pattern (to be migrated)

## Implementation Reference

- Domain entities: `src/domain/entities/`
- Repository interfaces: `src/domain/interfaces/`
- Service implementations: `src/application/services/`
- Route controllers: `src/interfaces/controllers/`

## Related ADRs

- [ADR-002: RBAC Permission Matrix](./002-rbac-permission-matrix.md)
- [ADR-003: Zod Validation Strategy](./003-zod-validation-strategy.md)
