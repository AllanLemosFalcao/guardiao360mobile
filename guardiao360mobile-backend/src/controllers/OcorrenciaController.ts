import { Request, Response } from 'express';
import pool from '../config/db';

export const OcorrenciaController = {
  
  // CRIAR NOVA OCORRÊNCIA (COM DONO E VÍTIMAS)
  criar: async (req: Request, res: Response) => {
    const conn = await pool.getConnection();
    
    try {
      await conn.beginTransaction(); // Segurança: Salva tudo ou nada

      const dados = req.body;
      const vitimas = dados.vitimas || []; 

      console.log(`📦 Recebendo Ocorrência: ${dados.numero_ocorrencia} (User ID: ${dados.usuario_id})`);

      // 1. INSERIR OCORRÊNCIA (Agora com usuario_id)
      const queryOco = `
        INSERT INTO ocorrencias (
          usuario_id, uuid_local, numero_ocorrencia, tipo_viatura, numero_viatura, grupamento, ponto_base,
          cod_local_ocorrencia, data_acionamento, hora_acionamento, forma_acionamento, local_vtr_acionamento,
          latitude_partida, longitude_partida,
          regiao, ais, municipio, bairro, tipo_logradouro, logradouro, numero_km, complemento, ponto_referencia,
          data_hora_chegada_local, latitude_chegada, longitude_chegada,
          natureza_final, grupo, subgrupo, situacao_ocorrencia, motivo_nao_atendida, detalhe_sem_atuacao,
          historico_final, chefe_guarnicao, hora_saida_local, status
        ) VALUES (?)
      `;

      // Array de valores na ordem exata da query acima
      const valoresOco = [
        dados.usuario_id, // <--- NOVO CAMPO: ID DO DONO
        dados.uuid_local, dados.numero_ocorrencia, dados.tipo_viatura, dados.numero_viatura, dados.grupamento, dados.ponto_base,
        dados.cod_local_ocorrencia, dados.data_acionamento, dados.hora_acionamento, dados.forma_acionamento, dados.local_vtr_acionamento,
        dados.latitude_partida, dados.longitude_partida,
        dados.regiao, dados.ais, dados.municipio, dados.bairro, dados.tipo_logradouro, dados.logradouro, dados.numero_km, dados.complemento, dados.ponto_referencia,
        dados.data_hora_chegada_local, dados.latitude_chegada, dados.longitude_chegada,
        dados.natureza_final, dados.grupo, dados.subgrupo, dados.situacao_ocorrencia, dados.motivo_nao_atendida, dados.detalhe_sem_atuacao,
        dados.historico_final, dados.chefe_guarnicao, dados.hora_saida_local, 'FINALIZADO'
      ];

      const [resultOco]: any = await conn.query(queryOco, [valoresOco]);
      const novoIdMySQL = resultOco.insertId;

      // 2. INSERIR VÍTIMAS (Se houver)
      if (vitimas.length > 0) {
        const queryVit = `
          INSERT INTO vitimas (
            ocorrencia_id, nome, sexo, idade, classificacao, etnia, lgbt, 
            destino, tipo_hospital, nome_hospital, 
            sofreu_acidente_transito, condicao_seguranca, 
            assinatura_path, status_assinatura
          ) VALUES ?
        `;

        const valoresVit = vitimas.map((v: any) => [
          novoIdMySQL,
          v.nome, v.sexo, v.idade, v.classificacao, v.etnia, v.lgbt,
          v.destino, v.tipo_hospital, v.nome_hospital,
          v.sofreu_acidente_transito, v.condicao_seguranca,
          v.assinatura_path, v.status_assinatura
        ]);

        await conn.query(queryVit, [valoresVit]);
        console.log(`✅ ${vitimas.length} vítimas salvas.`);
      }

      await conn.commit(); 
      res.status(201).json({ message: 'Sincronização completa!', id: dados.uuid_local });

    } catch (error) {
      await conn.rollback(); 
      console.error('Erro ao salvar dados:', error);
      res.status(500).json({ error: 'Erro interno ao salvar dados.' });
    } finally {
      conn.release();
    }
  },

  // LISTAR OCORRÊNCIAS (COM FILTRO POR USUÁRIO)
  listar: async (req: Request, res: Response) => {
    try {
      const usuarioId = req.query.usuario_id;
      
      let query = 'SELECT * FROM ocorrencias';
      let params: any[] = [];

      // Se vier o ID na URL, filtra. Se não vier, traz tudo (Admin).
      if (usuarioId) {
        query += ' WHERE usuario_id = ?';
        params.push(usuarioId);
      }
      
      query += ' ORDER BY id DESC';

      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar dados' });
    }
  }
};