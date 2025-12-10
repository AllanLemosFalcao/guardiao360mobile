// src/routes/api.ts
import { Router } from 'express';
import { OcorrenciaController } from '../controllers/OcorrenciaController';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware'; // 

const router = Router();

// --- ROTAS PÚBLICAS ---
router.post('/login', AuthController.login);

// --- ROTAS PROTEGIDAS (Exigem Token) ---
router.post('/ocorrencias', authMiddleware, OcorrenciaController.criar);
router.get('/ocorrencias', authMiddleware, OcorrenciaController.listar);
router.delete('/ocorrencias/:identificador', authMiddleware, OcorrenciaController.excluir);

export default router;