import { Response, NextFunction, Request } from 'express';
import { Document, Types } from 'mongoose';

export const resources = {
  LEAD: 'lead',
  CLIENT: 'client',
  PRODUCT: 'product',
  ADMIN: 'admin',
} as const;

export type Resource = (typeof resources)[keyof typeof resources];

export const actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  SEARCH: 'search',
} as const;

export type Action = (typeof actions)[keyof typeof actions];

export const roles = {
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

export type Role = (typeof roles)[keyof typeof roles];

export type Permission = `${Resource}:${Action}`;

interface AdminDocument extends Document {
  role: Role;
  _id: Types.ObjectId;
}

interface AuthRequest extends Request {
  admin?: AdminDocument;
}

const permissionMatrix: Record<Role, Permission[]> = {
  [roles.ADMIN]: [
    'admin:create',
    'admin:read',
    'admin:update',
    'admin:delete',
    'admin:list',
    'admin:search',
    'client:create',
    'client:read',
    'client:update',
    'client:delete',
    'client:list',
    'client:search',
    'lead:create',
    'lead:read',
    'lead:update',
    'lead:delete',
    'lead:list',
    'lead:search',
    'product:create',
    'product:read',
    'product:update',
    'product:delete',
    'product:list',
    'product:search',
  ],
  [roles.STAFF]: [
    'client:create',
    'client:read',
    'client:update',
    'client:list',
    'client:search',
    'lead:create',
    'lead:read',
    'lead:update',
    'lead:list',
    'lead:search',
    'product:read',
    'product:list',
    'product:search',
  ],
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  const rolePerms = permissionMatrix[role];
  return rolePerms?.includes(permission) ?? false;
};

export const getPermissions = (role: Role): Permission[] => {
  return permissionMatrix[role] || [];
};

export const checkRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userRole = req.admin.role;
    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: You don't have enough permissions" });
    }

    next();
  };
};

export const checkPermission = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userPermissions = permissionMatrix[req.admin.role] || [];
    if (!userPermissions.includes(permission)) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: Required permission missing' });
    }

    next();
  };
};

export const checkResourcePermission = (resource: Resource, action: Action) => {
  const permission: Permission = `${resource}:${action}`;
  return checkPermission(permission);
};

export const createPermissionMatrix = () => permissionMatrix;

export { permissionMatrix };

export const legacyPermissions = {
  DELETE_ADMIN: 'admin:delete',
  MANAGE_SETTINGS: 'admin:update',
} as const;
