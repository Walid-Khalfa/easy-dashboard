# Role-Based Access Control (RBAC)

Easy-Dashboard implements a centralized RBAC system with a resource-action-permission model.

## Permission Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    Permission Structure                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RESOURCE:ACTION = Permission                                   │
│                                                                 │
│  ┌─────────┐     ┌──────────┐     ┌─────────────────────┐    │
│  │ Resource│────▶│  Action   │────▶│   Permission        │    │
│  └─────────┘     └──────────┘     └─────────────────────┘    │
│                                                                 │
│  lead      ──▶ create ──▶ lead:create                         │
│  lead      ──▶ read   ──▶ lead:read                           │
│  lead      ──▶ update ──▶ lead:update                         │
│  lead      ──▶ delete ──▶ lead:delete                         │
│  lead      ──▶ list   ──▶ lead:list                           │
│  lead      ──▶ search ──▶ lead:search                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Resources

```typescript
// middleware/rbac.ts:4-9
export const resources = {
  LEAD: 'lead',
  CLIENT: 'client',
  PRODUCT: 'product',
  ADMIN: 'admin',
} as const;
```

| Resource  | Description                |
| --------- | -------------------------- |
| `lead`    | Lead management            |
| `client`  | Client/Customer management |
| `product` | Product management         |
| `admin`   | Admin user management      |

## Actions

```typescript
// middleware/rbac.ts:13-20
export const actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  SEARCH: 'search',
} as const;
```

| Action   | HTTP Method  | Description             |
| -------- | ------------ | ----------------------- |
| `create` | POST         | Create new entity       |
| `read`   | GET (single) | Get single entity by ID |
| `list`   | GET (list)   | Get paginated list      |
| `update` | PATCH        | Update entity           |
| `delete` | DELETE       | Soft delete entity      |
| `search` | GET (search) | Search entities         |

## Roles

```typescript
// middleware/rbac.ts:24-27
export const roles = {
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;
```

| Role    | Description                |
| ------- | -------------------------- |
| `admin` | Full system access         |
| `staff` | Limited access (no delete) |

## Permission Matrix

### ADMIN Role

| Resource | Create | Read | Update | Delete | List | Search |
| -------- | ------ | ---- | ------ | ------ | ---- | ------ |
| lead     | ✅     | ✅   | ✅     | ✅     | ✅   | ✅     |
| client   | ✅     | ✅   | ✅     | ✅     | ✅   | ✅     |
| product  | ✅     | ✅   | ✅     | ✅     | ✅   | ✅     |
| admin    | ✅     | ✅   | ✅     | ✅     | ✅   | ✅     |

### STAFF Role

| Resource | Create | Read | Update | Delete | List | Search |
| -------- | ------ | ---- | ------ | ------ | ---- | ------ |
| lead     | ✅     | ✅   | ✅     | ❌     | ✅   | ✅     |
| client   | ✅     | ✅   | ✅     | ❌     | ✅   | ✅     |
| product  | ❌     | ✅   | ❌     | ❌     | ✅   | ✅     |
| admin    | ❌     | ❌   | ❌     | ❌     | ❌   | ❌     |

## Implementation

### Middleware Usage

```typescript
// routes/api.ts
import { checkResourcePermission, resources, actions } from '../middleware/rbac';

// Check specific permission
router.delete(
  '/lead/delete/:id',
  checkResourcePermission(resources.LEAD, actions.DELETE),
  controller.delete
);

// Or check role
router.post('/admin/create', checkRole([roles.ADMIN]), controller.create);
```

### Permission Check Function

```typescript
// middleware/rbac.ts:86-93
export const hasPermission = (role: Role, permission: Permission): boolean => {
  const rolePerms = permissionMatrix[role];
  return rolePerms?.includes(permission) ?? false;
};

// Usage
hasPermission('admin', 'lead:delete'); // true
hasPermission('staff', 'lead:delete'); // false
hasPermission('staff', 'lead:create'); // true
```

## HTTP Response Codes

| Code | Condition                                |
| ---- | ---------------------------------------- |
| 401  | No token / Invalid token                 |
| 403  | Token valid, but insufficient permission |

### Example Responses

```json
// 401 Unauthorized
{
  "success": false,
  "message": "Unauthorized"
}

// 403 Forbidden (no permission)
{
  "success": false,
  "message": "Forbidden: Required permission missing"
}

// 403 Forbidden (role not allowed)
{
  "success": false,
  "message": "Forbidden: You don't have enough permissions"
}
```

## Adding New Resources

To add a new resource (e.g., `order`):

1. Add to resources enum:

```typescript
export const resources = {
  // ...existing
  ORDER: 'order',
} as const;
```

2. Add permissions to admin:

```typescript
const permissionMatrix = {
  [roles.ADMIN]: [
    // ...existing
    'order:create',
    'order:read',
    'order:update',
    'order:delete',
    'order:list',
    'order:search',
  ],
};
```

3. Add permissions to staff (as needed):

```typescript
const permissionMatrix = {
  [roles.STAFF]: [
    // ...existing
    'order:create',
    'order:read',
    'order:list',
    'order:search',
  ],
};
```

4. Use in routes:

```typescript
router.get('/order/list', checkResourcePermission(resources.ORDER, actions.LIST), controller.list);
```

## Related Documentation

- [Authentication Overview](./overview.md)
- [API Endpoints](../api/openapi.json)
