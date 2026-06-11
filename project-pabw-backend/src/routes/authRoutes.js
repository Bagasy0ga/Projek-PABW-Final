import express from "express";
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  verifyLoginOtp,
  logout,
  forgotPassword,
  verifyResetPasswordOtp,
  confirmResetPassword,
  changePassword,
  confirmChangePassword,
  updateProfile
} from "../controllers/authController.js";

import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

router.post("/login", login);
router.post("/login/verify-otp", verifyLoginOtp);

router.post("/logout", requireAuth, logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/verify-otp", verifyResetPasswordOtp);
router.post("/reset-password/confirm", confirmResetPassword);

router.post("/change-password", requireAuth, changePassword);
router.post("/change-password/confirm", requireAuth, confirmChangePassword);

router.put("/profile", requireAuth, updateProfile);

export default router;