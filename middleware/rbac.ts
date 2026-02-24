import { Response, NextFunction } from 'express';

export const roles = {
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

export type Role = typeof roles[keyof typeof roles];

export const checkRole = (allowedRoles: Role[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: You don't have enough permissions" });
    }

    next();
  };
};

// More granular permission system
export const permissions = {
  DELETE_ADMIN: 'delete_admin',
  MANAGE_SETTINGS: 'manage_settings',
} as const;

export type Permission = typeof permissions[keyof typeof permissions];

const rolePermissions: Record<Role, Permission[]> = {
  [roles.ADMIN]: [permissions.DELETE_ADMIN, permissions.MANAGE_SETTINGS],
  [roles.STAFF]: [],
};

export const checkPermission = (permission: Permission) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userPermissions = rolePermissions[req.admin.role as Role] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ success: false, message: "Forbidden: Required permission missing" });
    }

    next();
  };
};
