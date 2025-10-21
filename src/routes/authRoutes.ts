// src/routes/authRoutes.ts
import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// --- Rotas Públicas ---
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// --- Rota Protegida ---
// O middleware `authMiddleware` será executado antes do controller
router.get('/protected', authMiddleware, AuthController.getProtected);

export default router;