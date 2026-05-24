// routes/auth.ts
import { Router } from "express";
import { register, login, refreshTokens, logout } from "../controllers/authController";
import { validate, registerSchema, loginSchema }   from "../middleware/validate";
import { authLimiter }                             from "../middleware/rateLimiter";
const authRouter = Router();
authRouter.post("/register", authLimiter, validate(registerSchema), register);
authRouter.post("/login",    authLimiter, validate(loginSchema),    login);
authRouter.post("/refresh",  refreshTokens);
authRouter.post("/logout",   logout);
export { authRouter };
