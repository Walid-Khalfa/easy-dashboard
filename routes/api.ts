import express from 'express';
const router = express.Router();
import { catchErrors } from '../handlers/errorHandlers';
import { isValidToken } from '../controllers/authController';
import { checkRole, roles, checkPermission, permissions } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import * as crudValidation from '../validations/crud';
import * as authValidation from '../validations/auth';

// Import controllers
import * as adminController from "../controllers/adminController";
import clientController from "../controllers/clientController";
import leadController from "../controllers/leadController";
import productController from "../controllers/productController";

// Apply authentication to all routes below
router.use(isValidToken);

// Admin management (Restricted to ADMIN role)
router.route("/admin/create").post(checkRole([roles.ADMIN]), validate(authValidation.adminCreateSchema), catchErrors(adminController.create));
router.route("/admin/read/:id").get(checkRole([roles.ADMIN]), validate(authValidation.adminIdSchema), catchErrors(adminController.read));
router.route("/admin/update/:id").patch(checkRole([roles.ADMIN]), validate(authValidation.adminUpdateSchema), catchErrors(adminController.update));
router.route("/admin/delete/:id").delete(checkPermission(permissions.DELETE_ADMIN), validate(authValidation.adminIdSchema), catchErrors(adminController.deleteAdmin));
router.route("/admin/search").get(checkRole([roles.ADMIN]), validate(crudValidation.searchSchema), catchErrors(adminController.search));
router.route("/admin/list").get(checkRole([roles.ADMIN]), validate(crudValidation.paginationSchema), catchErrors(adminController.list));
router.route("/admin/password-update/:id").patch(checkRole([roles.ADMIN]), validate(authValidation.adminPasswordUpdateSchema), catchErrors(adminController.updatePassword));

// Client management
router.route("/client/create").post(validate(crudValidation.clientCreateSchema), catchErrors(clientController.create));
router.route("/client/read/:id").get(validate(crudValidation.clientIdSchema), catchErrors(clientController.read));
router.route("/client/update/:id").patch(validate(crudValidation.clientUpdateSchema), catchErrors(clientController.update));
router.route("/client/delete/:id").delete(checkRole([roles.ADMIN]), validate(crudValidation.clientIdSchema), catchErrors(clientController.delete));
router.route("/client/search").get(validate(crudValidation.searchSchema), catchErrors(clientController.search));
router.route("/client/list").get(validate(crudValidation.paginationSchema), catchErrors(clientController.list));

// Lead management
router.route("/lead/create").post(validate(crudValidation.leadCreateSchema), catchErrors(leadController.create));
router.route("/lead/read/:id").get(validate(crudValidation.leadIdSchema), catchErrors(leadController.read));
router.route("/lead/update/:id").patch(validate(crudValidation.leadUpdateSchema), catchErrors(leadController.update));
router.route("/lead/delete/:id").delete(checkRole([roles.ADMIN]), validate(crudValidation.leadIdSchema), catchErrors(leadController.delete));
router.route("/lead/search").get(validate(crudValidation.searchSchema), catchErrors(leadController.search));
router.route("/lead/list").get(validate(crudValidation.paginationSchema), catchErrors(leadController.list));

// Product management
router.route("/product/create").post(checkRole([roles.ADMIN]), validate(crudValidation.productCreateSchema), catchErrors(productController.create));
router.route("/product/read/:id").get(validate(crudValidation.productIdSchema), catchErrors(productController.read));
router.route("/product/update/:id").patch(checkRole([roles.ADMIN]), validate(crudValidation.productUpdateSchema), catchErrors(productController.update));
router.route("/product/delete/:id").delete(checkRole([roles.ADMIN]), validate(crudValidation.productIdSchema), catchErrors(productController.delete));
router.route("/product/search").get(validate(crudValidation.searchSchema), catchErrors(productController.search));
router.route("/product/list").get(validate(crudValidation.paginationSchema), catchErrors(productController.list));

export default router;
