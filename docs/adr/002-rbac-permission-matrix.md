# ADR-002: RBAC Permission Matrix

## Status

**Accepted** - Implemented in v2.0

## Date

2026-02-25

## Context

We needed a centralized, maintainable access control system that could:

- Support multiple roles (Admin, Staff)
- Handle multiple resources (Lead, Client, Product, Admin)
- Allow granular permissions per action (create, read, update, delete, list, search)
- Be easily extensible for new resources

## Decision

We implemented a **Resource-Action-Permission** model with a centralized matrix.

### Permission Format

```
{resource}:{action}
```

Examples:

- `lead:create`
- `lead:read`
- `admin:delete`

### Permission Matrix

| Role  | lead:create | lead:read | lead:update | lead:delete | ... |
| ----- | ----------- | --------- | ----------- | ----------- | --- |
| ADMIN | ✅          | ✅        | ✅          | ✅          | ... |
| STAFF | ✅          | ✅        | ✅          | ❌          | ... |

**Full matrix available in** [`middleware/rbac.ts`](../../middleware/rbac.ts)

## Implementation

```typescript
// middleware/rbac.ts

export const resources = {
  LEAD: 'lead',
  CLIENT: 'client',
  PRODUCT: 'product',
  ADMIN: 'admin',
} as const;

export const actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  SEARCH: 'search',
} as const;

const permissionMatrix: Record<Role, Permission[]> = {
  [roles.ADMIN]: ['lead:create', 'lead:read' /* ... */],
  [roles.STAFF]: ['lead:create', 'lead:read' /* ... */],
};
```

### Middleware Usage

```typescript
// routes/api.ts
import { checkResourcePermission, resources, actions } from '../middleware/rbac';

router.delete(
  '/lead/delete/:id',
  checkResourcePermission(resources.LEAD, actions.DELETE),
  controller.delete
);
```

## Consequences

### Positive

- Single source of truth for permissions
- Easy to audit who can do what
- Simple to add new resources/actions
- Consistent enforcement via middleware

### Negative

- Must update matrix when adding new resources
- Need to regenerate docs when permissions change

## Adding New Resources

To add a new `order` resource:

1. Add to resources enum
2. Add permissions to role matrices
3. Use in routes with `checkResourcePermission()`

See [`middleware/rbac.ts`](../../middleware/rbac.ts) for implementation.

## Related Documentation

- [Authentication RBAC](../authentication/rbac.md)
- [API Endpoints](../api/openapi.json)

## Related ADRs

- [ADR-001: Layered Architecture](./001-layered-architecture.md)
- [ADR-003: Zod Validation Strategy](./003-zod-validation-strategy.md)
