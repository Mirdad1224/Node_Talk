import { Router } from "express";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  sendOTP,
  verifyOTP,
} from "../controllers/auth";
import loginLimiter from "../middlewares/loginLimiter";

const router = Router();

router.route("/register").post(loginLimiter, register, sendOTP);

router.route("/login").post(loginLimiter, login);

router.post("/verify", verifyOTP);

router.post("/send-otp", sendOTP);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

export default router;
