import express from "express";
import { AuthController } from "../../controller/public/auth.controller.js";
import validateRequest from "../../middleware/validateRequest.js";
import { AuthValidation } from "../../validation/auth.validation.js";
const router = express.Router();

router.post(
  "/auth/reset-password",
  validateRequest(AuthValidation.resetPasswordZodSchema),
  AuthController.resetPassword
);

router.post(
  "/auth/forgot-password",
  validateRequest(AuthValidation.forgotPasswordZodSchema),
  AuthController.forgotPassword
);

router.post(
  "/auth/sign-up",
  validateRequest(AuthValidation.registerZodSchema),
  AuthController.register
);

router.post(
  "/auth/sign-in",
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.login
);

router.post(
  "/auth/admin/sign-in",
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.adminLogin
);

router.post(
  "/auth/google-sign-in",
  validateRequest(AuthValidation.googleLoginZodSchema),
  AuthController.googleLogin
);

router.post(
  "/auth/refresh/token",
  validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthController.refreshToken
);

export const AuthRoutes = router;
