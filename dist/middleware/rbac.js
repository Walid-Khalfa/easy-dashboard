"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = exports.permissions = exports.checkRole = exports.roles = void 0;
exports.roles = {
    ADMIN: 'admin',
    STAFF: 'staff',
};
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({ success: false, message: "Forbidden: You don't have enough permissions" });
        }
        next();
    };
};
exports.checkRole = checkRole;
// More granular permission system
exports.permissions = {
    DELETE_ADMIN: 'delete_admin',
    MANAGE_SETTINGS: 'manage_settings',
};
const rolePermissions = {
    [exports.roles.ADMIN]: [exports.permissions.DELETE_ADMIN, exports.permissions.MANAGE_SETTINGS],
    [exports.roles.STAFF]: [],
};
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userPermissions = rolePermissions[req.admin.role] || [];
        if (!userPermissions.includes(permission)) {
            return res.status(403).json({ success: false, message: "Forbidden: Required permission missing" });
        }
        next();
    };
};
exports.checkPermission = checkPermission;
