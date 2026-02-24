import express from 'express';
const router = express.Router();
import { catchErrors } from '../handlers/errorHandlers';
import { isValidToken } from '../controllers/authController';
import { checkRole, roles, checkPermission, permissions } from '../middleware/rbac';

// Import controllers
import * as adminController from "../controllers/adminController";
import clientController from "../controllers/clientController";
import leadController from "../controllers/leadController";
import productController from "../controllers/productController";

// Apply authentication to all routes below
router.use(isValidToken);

// Admin management (Restricted to ADMIN role)
router.route("/admin/create").post(checkRole([roles.ADMIN]), catchErrors(adminController.create));
router.route("/admin/read/:id").get(checkRole([roles.ADMIN]), catchErrors(adminController.read));
router.route("/admin/update/:id").patch(checkRole([roles.ADMIN]), catchErrors(adminController.update));
router.route("/admin/delete/:id").delete(checkPermission(permissions.DELETE_ADMIN), catchErrors(adminController.deleteAdmin));
router.route("/admin/search").get(checkRole([roles.ADMIN]), catchErrors(adminController.search));
router.route("/admin/list").get(checkRole([roles.ADMIN]), catchErrors(adminController.list));
router.route("/admin/password-update/:id").patch(checkRole([roles.ADMIN]), catchErrors(adminController.updatePassword));

// Client management
router.route("/client/create").post(catchErrors(clientController.create));
router.route("/client/read/:id").get(catchErrors(clientController.read));
router.route("/client/update/:id").patch(catchErrors(clientController.update));
router.route("/client/delete/:id").delete(checkRole([roles.ADMIN]), catchErrors(clientController.delete));
router.route("/client/search").get(catchErrors(clientController.search));
router.route("/client/list").get(catchErrors(clientController.list));

// Lead management
router.route("/lead/create").post(catchErrors(leadController.create));
router.route("/lead/read/:id").get(catchErrors(leadController.read));
router.route("/lead/update/:id").patch(catchErrors(leadController.update));
router.route("/lead/delete/:id").delete(checkRole([roles.ADMIN]), catchErrors(leadController.delete));
router.route("/lead/search").get(catchErrors(leadController.search));
router.route("/lead/list").get(catchErrors(leadController.list));

// Product management
router.route("/product/create").post(checkRole([roles.ADMIN]), catchErrors(productController.create));
router.route("/product/read/:id").get(catchErrors(productController.read));
router.route("/product/update/:id").patch(checkRole([roles.ADMIN]), catchErrors(productController.update));
router.route("/product/delete/:id").delete(checkRole([roles.ADMIN]), catchErrors(productController.delete));
router.route("/product/search").get(catchErrors(productController.search));
router.route("/product/list").get(catchErrors(productController.list));

export default router;
