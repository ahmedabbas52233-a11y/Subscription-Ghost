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
