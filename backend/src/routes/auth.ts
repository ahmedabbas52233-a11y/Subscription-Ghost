<<<<<<< HEAD
import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/authController';
import { validate, registerSchema, loginSchema } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login',    authLimiter, validate(loginSchema),    login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);
router.get('/me',        protect, me);

export default router;
=======
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
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
