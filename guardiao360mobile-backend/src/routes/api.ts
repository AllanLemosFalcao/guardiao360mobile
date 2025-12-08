import { Router } from 'express';
import { OcorrenciaController } from '../controllers/OcorrenciaController';
import { AuthController } from '../controllers/AuthController'; // <--- IMPORTAR

const router = Router();

// --- ROTAS DE AUTENTICAÇÃO ---
router.post('/login', AuthController.login); // <--- NOVA ROTA

// --- ROTAS DE OCORRÊNCIAS ---
router.post('/ocorrencias', OcorrenciaController.criar);
router.get('/ocorrencias', OcorrenciaController.listar);

export default router;