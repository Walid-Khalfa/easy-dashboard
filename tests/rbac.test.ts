import {
  roles,
  resources,
  actions,
  hasPermission,
  getPermissions,
  checkRole,
  checkPermission,
  checkResourcePermission,
  permissionMatrix,
  legacyPermissions,
} from '../middleware/rbac';
import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';

interface MockAdmin {
  role: 'admin' | 'staff';
  _id: Types.ObjectId;
}

interface MockRequest {
  admin?: MockAdmin;
}

describe('RBAC Permission Matrix', () => {
  describe('Permission Matrix Structure', () => {
    it('should have permissions defined for all roles', () => {
      expect(permissionMatrix).toHaveProperty(roles.ADMIN);
      expect(permissionMatrix).toHaveProperty(roles.STAFF);
    });

    it('admin should have all permissions', () => {
      const adminPerms = permissionMatrix[roles.ADMIN];
      expect(adminPerms).toContain('admin:create');
      expect(adminPerms).toContain('admin:read');
      expect(adminPerms).toContain('admin:update');
      expect(adminPerms).toContain('admin:delete');
      expect(adminPerms).toContain('client:create');
      expect(adminPerms).toContain('lead:create');
      expect(adminPerms).toContain('product:create');
    });

    it('staff should have limited permissions', () => {
      const staffPerms = permissionMatrix[roles.STAFF];
      expect(staffPerms).toContain('lead:create');
      expect(staffPerms).toContain('lead:read');
      expect(staffPerms).toContain('lead:update');
      expect(staffPerms).toContain('client:create');
      expect(staffPerms).toContain('product:read');
    });

    it('staff should NOT have delete permissions', () => {
      const staffPerms = permissionMatrix[roles.STAFF];
      expect(staffPerms).not.toContain('admin:delete');
      expect(staffPerms).not.toContain('client:delete');
      expect(staffPerms).not.toContain('lead:delete');
      expect(staffPerms).not.toContain('product:delete');
    });

    it('staff should NOT have admin management permissions', () => {
      const staffPerms = permissionMatrix[roles.STAFF];
      expect(staffPerms).not.toContain('admin:create');
      expect(staffPerms).not.toContain('admin:update');
      expect(staffPerms).not.toContain('admin:delete');
    });
  });

  describe('hasPermission', () => {
    it('should return true when admin has permission', () => {
      expect(hasPermission(roles.ADMIN, 'admin:delete')).toBe(true);
      expect(hasPermission(roles.ADMIN, 'lead:create')).toBe(true);
    });

    it('should return true when staff has permission', () => {
      expect(hasPermission(roles.STAFF, 'lead:create')).toBe(true);
      expect(hasPermission(roles.STAFF, 'client:read')).toBe(true);
    });

    it('should return false when staff lacks permission', () => {
      expect(hasPermission(roles.STAFF, 'admin:delete')).toBe(false);
      expect(hasPermission(roles.STAFF, 'product:create')).toBe(false);
      expect(hasPermission(roles.STAFF, 'lead:delete')).toBe(false);
    });

    it('should return false for unknown role', () => {
      expect(hasPermission('unknown' as any, 'lead:create')).toBe(false);
    });
  });

  describe('getPermissions', () => {
    it('should return all permissions for admin', () => {
      const perms = getPermissions(roles.ADMIN);
      expect(perms.length).toBeGreaterThan(20);
    });

    it('should return limited permissions for staff', () => {
      const perms = getPermissions(roles.STAFF);
      expect(perms.length).toBeLessThan(permissionMatrix[roles.ADMIN].length);
      expect(perms).toContain('lead:create');
    });
  });
});

describe('RBAC Middleware', () => {
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      admin: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('checkRole', () => {
    it('should return 401 if no admin in request', () => {
      const middleware = checkRole([roles.ADMIN]);
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if role not in allowed list', () => {
      mockRequest.admin = { role: roles.STAFF, _id: new Types.ObjectId() } as any;
      const middleware = checkRole([roles.ADMIN]);
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next if role is allowed', () => {
      mockRequest.admin = { role: roles.ADMIN, _id: new Types.ObjectId() } as any;
      const middleware = checkRole([roles.ADMIN]);
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow multiple roles', () => {
      mockRequest.admin = { role: roles.STAFF, _id: new Types.ObjectId() } as any;
      const middleware = checkRole([roles.ADMIN, roles.STAFF]);
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('checkPermission', () => {
    it('should return 401 if no admin in request', () => {
      const middleware = checkPermission('admin:delete');
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if permission not granted', () => {
      mockRequest.admin = { role: roles.STAFF, _id: new Types.ObjectId() } as any;
      const middleware = checkPermission('admin:delete');
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next if permission granted', () => {
      mockRequest.admin = { role: roles.ADMIN, _id: new Types.ObjectId() } as any;
      const middleware = checkPermission('admin:delete');
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('checkResourcePermission', () => {
    it('should allow staff to create leads', () => {
      mockRequest.admin = { role: roles.STAFF, _id: new Types.ObjectId() } as any;
      const middleware = checkResourcePermission(resources.LEAD, actions.CREATE);
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny staff to delete leads', () => {
      mockRequest.admin = { role: roles.STAFF, _id: new Types.ObjectId() } as any;
      const middleware = checkResourcePermission(resources.LEAD, actions.DELETE);
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should allow staff to read products', () => {
      mockRequest.admin = { role: roles.STAFF, _id: new Types.ObjectId() } as any;
      const middleware = checkResourcePermission(resources.PRODUCT, actions.READ);
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny staff to create products', () => {
      mockRequest.admin = { role: roles.STAFF, _id: new Types.ObjectId() } as any;
      const middleware = checkResourcePermission(resources.PRODUCT, actions.CREATE);
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });
});

describe('Legacy Permission Exports', () => {
  it('should export legacy permissions for backward compatibility', () => {
    expect(legacyPermissions.DELETE_ADMIN).toBe('admin:delete');
    expect(legacyPermissions.MANAGE_SETTINGS).toBe('admin:update');
  });
});
