import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testarConexao } from './config/db';
import apiRoutes from './routes/api'; // <--- Importe as rotas

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ROTAS ---
app.use('/api', apiRoutes); // <--- Prefixo /api

// Rota Raiz (Teste)
app.get('/', (req, res) => {
  res.json({ message: 'API Guardião 360 Online 🚒' });
});

app.listen(Number(PORT), '0.0.0.0', async () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Acessível na rede (Tente o IP do seu PC:3000)`);
  await testarConexao();
});