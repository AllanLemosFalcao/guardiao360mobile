import { Request, Response } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs'; // Usaremos na versão final para criptografar

// SEGREDO DO TOKEN (Deveria estar no .env, mas vamos facilitar aqui)
const JWT_SECRET = process.env.JWT_SECRET || 'segredo-super-secreto-do-guardiao';

export const AuthController = {
  
  login: async (req: Request, res: Response) => {
    try {
      const { email, senha } = req.body;

      // 1. Busca o usuário no banco
      const [rows]: any = await pool.query(
        'SELECT * FROM usuarios WHERE email = ?', 
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const usuario = rows[0];

      // 2. Verifica a senha
      // MODO SIMPLES (Para testar agora com o INSERT que fizemos):
      if (senha !== usuario.senha) {
         return res.status(401).json({ error: 'Senha incorreta' });
      }

      /* // MODO PROFISSIONAL (Com Criptografia - Ativaremos depois):
      const senhaBate = await bcrypt.compare(senha, usuario.senha);
      if (!senhaBate) return res.status(401).json({ error: 'Senha incorreta' });
      */

      // 3. Gera o Token (O Crachá)
      const token = jwt.sign(
        { id: usuario.id, perfil: usuario.perfil, nome: usuario.nome }, 
        JWT_SECRET, 
        { expiresIn: '24h' } // Token expira em 1 dia
      );

      // 4. Retorna os dados para o App
      res.json({
        auth: true,
        token: token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          patente: usuario.patente,
          email: usuario.email
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};