import express from 'express';
const router = express.Router();

import { catchErrors } from '../handlers/errorHandlers';
import { isValidToken } from '../controllers/authController';
import {
  checkRole,
  roles,
  checkResourcePermission,
  resources,
  actions,
  legacyPermissions,
} from '../middleware/rbac';
import { validate } from '../middleware/validate';
import * as crudValidation from '../validations/crud';
import * as authValidation from '../validations/auth';
import * as adminController from '../controllers/adminController';
import clientController from '../controllers/clientController';
import * as leadController from '../src/interfaces/controllers/LeadController';
import productController from '../controllers/productController';

router.use(isValidToken);

router
  .route('/admin/create')
  .post(
    checkRole([roles.ADMIN]),
    validate(authValidation.adminCreateSchema),
    catchErrors(adminController.create)
  );
router
  .route('/admin/read/:id')
  .get(
    checkRole([roles.ADMIN]),
    validate(authValidation.adminIdSchema),
    catchErrors(adminController.read)
  );
router
  .route('/admin/update/:id')
  .patch(
    checkRole([roles.ADMIN]),
    validate(authValidation.adminUpdateSchema),
    catchErrors(adminController.update)
  );
router
  .route('/admin/delete/:id')
  .delete(
    checkResourcePermission(resources.ADMIN, actions.DELETE),
    validate(authValidation.adminIdSchema),
    catchErrors(adminController.deleteAdmin)
  );
router
  .route('/admin/search')
  .get(
    checkRole([roles.ADMIN]),
    validate(crudValidation.searchSchema),
    catchErrors(adminController.search)
  );
router
  .route('/admin/list')
  .get(
    checkRole([roles.ADMIN]),
    validate(crudValidation.paginationSchema),
    catchErrors(adminController.list)
  );
router
  .route('/admin/password-update/:id')
  .patch(
    checkRole([roles.ADMIN]),
    validate(authValidation.adminPasswordUpdateSchema),
    catchErrors(adminController.updatePassword)
  );
router
  .route('/admin/unlock/:id')
  .patch(
    checkRole([roles.ADMIN]),
    validate(authValidation.adminIdSchema),
    catchErrors(adminController.unlockAccount)
  );

router
  .route('/client/create')
  .post(
    checkResourcePermission(resources.CLIENT, actions.CREATE),
    validate(crudValidation.clientCreateSchema),
    catchErrors(clientController.create)
  );
router
  .route('/client/read/:id')
  .get(
    checkResourcePermission(resources.CLIENT, actions.READ),
    validate(crudValidation.clientIdSchema),
    catchErrors(clientController.read)
  );
router
  .route('/client/update/:id')
  .patch(
    checkResourcePermission(resources.CLIENT, actions.UPDATE),
    validate(crudValidation.clientUpdateSchema),
    catchErrors(clientController.update)
  );
router
  .route('/client/delete/:id')
  .delete(
    checkResourcePermission(resources.CLIENT, actions.DELETE),
    validate(crudValidation.clientIdSchema),
    catchErrors(clientController.delete)
  );
router
  .route('/client/search')
  .get(
    checkResourcePermission(resources.CLIENT, actions.SEARCH),
    validate(crudValidation.searchSchema),
    catchErrors(clientController.search)
  );
router
  .route('/client/list')
  .get(
    checkResourcePermission(resources.CLIENT, actions.LIST),
    validate(crudValidation.paginationSchema),
    catchErrors(clientController.list)
  );

router
  .route('/lead/create')
  .post(
    checkResourcePermission(resources.LEAD, actions.CREATE),
    validate(crudValidation.leadCreateSchema),
    catchErrors(leadController.create)
  );
router
  .route('/lead/read/:id')
  .get(
    checkResourcePermission(resources.LEAD, actions.READ),
    validate(crudValidation.leadIdSchema),
    catchErrors(leadController.read)
  );
router
  .route('/lead/update/:id')
  .patch(
    checkResourcePermission(resources.LEAD, actions.UPDATE),
    validate(crudValidation.leadUpdateSchema),
    catchErrors(leadController.update)
  );
router
  .route('/lead/delete/:id')
  .delete(
    checkResourcePermission(resources.LEAD, actions.DELETE),
    validate(crudValidation.leadIdSchema),
    catchErrors(leadController.deleteItem)
  );
router
  .route('/lead/search')
  .get(
    checkResourcePermission(resources.LEAD, actions.SEARCH),
    validate(crudValidation.searchSchema),
    catchErrors(leadController.search)
  );
router
  .route('/lead/list')
  .get(
    checkResourcePermission(resources.LEAD, actions.LIST),
    validate(crudValidation.paginationSchema),
    catchErrors(leadController.list)
  );

router
  .route('/product/create')
  .post(
    checkResourcePermission(resources.PRODUCT, actions.CREATE),
    validate(crudValidation.productCreateSchema),
    catchErrors(productController.create)
  );
router
  .route('/product/read/:id')
  .get(
    checkResourcePermission(resources.PRODUCT, actions.READ),
    validate(crudValidation.productIdSchema),
    catchErrors(productController.read)
  );
router
  .route('/product/update/:id')
  .patch(
    checkResourcePermission(resources.PRODUCT, actions.UPDATE),
    validate(crudValidation.productUpdateSchema),
    catchErrors(productController.update)
  );
router
  .route('/product/delete/:id')
  .delete(
    checkResourcePermission(resources.PRODUCT, actions.DELETE),
    validate(crudValidation.productIdSchema),
    catchErrors(productController.delete)
  );
router
  .route('/product/search')
  .get(
    checkResourcePermission(resources.PRODUCT, actions.SEARCH),
    validate(crudValidation.searchSchema),
    catchErrors(productController.search)
  );
router
  .route('/product/list')
  .get(
    checkResourcePermission(resources.PRODUCT, actions.LIST),
    validate(crudValidation.paginationSchema),
    catchErrors(productController.list)
  );

export default router;
