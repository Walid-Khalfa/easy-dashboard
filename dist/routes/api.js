"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const errorHandlers_1 = require("../handlers/errorHandlers");
const authController_1 = require("../controllers/authController");
const rbac_1 = require("../middleware/rbac");
// Import controllers
const adminController = __importStar(require("../controllers/adminController"));
const clientController_1 = __importDefault(require("../controllers/clientController"));
const leadController_1 = __importDefault(require("../controllers/leadController"));
const productController_1 = __importDefault(require("../controllers/productController"));
// Apply authentication to all routes below
router.use(authController_1.isValidToken);
// Admin management (Restricted to ADMIN role)
router.route("/admin/create").post((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(adminController.create));
router.route("/admin/read/:id").get((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(adminController.read));
router.route("/admin/update/:id").patch((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(adminController.update));
router.route("/admin/delete/:id").delete((0, rbac_1.checkPermission)(rbac_1.permissions.DELETE_ADMIN), (0, errorHandlers_1.catchErrors)(adminController.deleteAdmin));
router.route("/admin/search").get((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(adminController.search));
router.route("/admin/list").get((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(adminController.list));
router.route("/admin/password-update/:id").patch((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(adminController.updatePassword));
// Client management
router.route("/client/create").post((0, errorHandlers_1.catchErrors)(clientController_1.default.create));
router.route("/client/read/:id").get((0, errorHandlers_1.catchErrors)(clientController_1.default.read));
router.route("/client/update/:id").patch((0, errorHandlers_1.catchErrors)(clientController_1.default.update));
router.route("/client/delete/:id").delete((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(clientController_1.default.delete));
router.route("/client/search").get((0, errorHandlers_1.catchErrors)(clientController_1.default.search));
router.route("/client/list").get((0, errorHandlers_1.catchErrors)(clientController_1.default.list));
// Lead management
router.route("/lead/create").post((0, errorHandlers_1.catchErrors)(leadController_1.default.create));
router.route("/lead/read/:id").get((0, errorHandlers_1.catchErrors)(leadController_1.default.read));
router.route("/lead/update/:id").patch((0, errorHandlers_1.catchErrors)(leadController_1.default.update));
router.route("/lead/delete/:id").delete((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(leadController_1.default.delete));
router.route("/lead/search").get((0, errorHandlers_1.catchErrors)(leadController_1.default.search));
router.route("/lead/list").get((0, errorHandlers_1.catchErrors)(leadController_1.default.list));
// Product management
router.route("/product/create").post((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(productController_1.default.create));
router.route("/product/read/:id").get((0, errorHandlers_1.catchErrors)(productController_1.default.read));
router.route("/product/update/:id").patch((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(productController_1.default.update));
router.route("/product/delete/:id").delete((0, rbac_1.checkRole)([rbac_1.roles.ADMIN]), (0, errorHandlers_1.catchErrors)(productController_1.default.delete));
router.route("/product/search").get((0, errorHandlers_1.catchErrors)(productController_1.default.search));
router.route("/product/list").get((0, errorHandlers_1.catchErrors)(productController_1.default.list));
exports.default = router;
