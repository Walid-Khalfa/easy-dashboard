import express from 'express';
const router = express.Router();

import { catchErrors } from '../handlers/errorHandlers';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validations/auth';

router.route("/login").post(validate(loginSchema), catchErrors(authController.login));
router.route("/register").post(validate(registerSchema), catchErrors(authController.register));
router.route("/refresh").post(catchErrors(authController.refresh));
router.route("/logout").post(authController.isValidToken, catchErrors(authController.logout));

export default router;
