import { Request, Response } from 'express';
import pool from '../config/db';

export const OcorrenciaController = {
  
  // CRIAR OU SINCRONIZAR OCORRÊNCIA
  criar: async (req: Request, res: Response) => {
    const conn = await pool.getConnection();
    
    try {
      await conn.beginTransaction(); // Inicia Transação

      const dados = req.body;
      const vitimas = dados.vitimas || []; 
      const midias = dados.midias || []; 

      console.log(`📦 Processando Ocorrência: ${dados.numero_ocorrencia}`);

      // 1. VERIFICAÇÃO DE DUPLICIDADE
      const [existe]: any = await conn.query(
        'SELECT id FROM ocorrencias WHERE uuid_local = ? LIMIT 1', 
        [dados.uuid_local]
      );

      let ocorrenciaIdMySQL: number;

      if (existe.length > 0) {
        ocorrenciaIdMySQL = existe[0].id;
        console.log(`⚠️ Ocorrência ${dados.numero_ocorrencia} já existe. Atualizando dados satélites.`);
      } else {
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

        const valoresOco = [
            dados.usuario_id, dados.uuid_local, dados.numero_ocorrencia, dados.tipo_viatura, dados.numero_viatura, dados.grupamento, dados.ponto_base,
            dados.cod_local_ocorrencia, dados.data_acionamento, dados.hora_acionamento, dados.forma_acionamento, dados.local_vtr_acionamento,
            dados.latitude_partida, dados.longitude_partida,
            dados.regiao, dados.ais, dados.municipio, dados.bairro, dados.tipo_logradouro, dados.logradouro, dados.numero_km, dados.complemento, dados.ponto_referencia,
            dados.data_hora_chegada_local, dados.latitude_chegada, dados.longitude_chegada,
            dados.natureza_final, dados.grupo, dados.subgrupo, dados.situacao_ocorrencia, dados.motivo_nao_atendida, dados.detalhe_sem_atuacao,
            dados.historico_final, dados.chefe_guarnicao, dados.hora_saida_local, 'FINALIZADO'
        ];

        const [resultOco]: any = await conn.query(queryOco, [valoresOco]);
        ocorrenciaIdMySQL = resultOco.insertId;
      }

      // 2. VÍTIMAS
      if (vitimas.length > 0) {
         await conn.query('DELETE FROM vitimas WHERE ocorrencia_id = ?', [ocorrenciaIdMySQL]);
         
         const queryVit = `
            INSERT INTO vitimas (
                ocorrencia_id, nome, sexo, idade, classificacao, etnia, lgbt, 
                destino, tipo_hospital, nome_hospital, 
                sofreu_acidente_transito, condicao_seguranca, 
                assinatura_path, status_assinatura
            ) VALUES ?`;
            
         const valoresVit = vitimas.map((v: any) => [
            ocorrenciaIdMySQL, v.nome, v.sexo, v.idade, v.classificacao, v.etnia, v.lgbt,
            v.destino, v.tipo_hospital, v.nome_hospital, v.sofreu_acidente_transito, v.condicao_seguranca,
            v.assinatura_path, v.status_assinatura
         ]);
         
         await conn.query(queryVit, [valoresVit]);
      }

      // 3. MÍDIAS (FOTOS)
      if (midias.length > 0) {
        await conn.query('DELETE FROM midias WHERE ocorrencia_id = ?', [ocorrenciaIdMySQL]);

        const queryMid = `INSERT INTO midias (ocorrencia_id, tipo, data_captura, caminho_arquivo) VALUES ?`;
        
        const valoresMid = midias.map((m: any) => [
            ocorrenciaIdMySQL, m.tipo || 'FOTO', m.data_captura, m.caminho_arquivo || m.uri
        ]);
        
        await conn.query(queryMid, [valoresMid]);
      }

      await conn.commit(); 
      res.status(201).json({ message: 'Sincronização realizada com sucesso!', id: dados.uuid_local });

    } catch (error) {
      await conn.rollback(); 
      console.error('Erro ao salvar dados:', error);
      res.status(500).json({ error: 'Erro interno ao salvar dados.' });
    } finally {
      conn.release();
    }
  }, // <--- ESSA VÍRGULA ERA O QUE FALTAVA

  // LISTAR OCORRÊNCIAS
  listar: async (req: Request, res: Response) => {
    try {
      const usuarioId = req.query.usuario_id;
      
      let query = 'SELECT * FROM ocorrencias';
      let params: any[] = [];

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
  }, // <--- VÍRGULA AQUI TAMBÉM É IMPORTANTE

  // EXCLUIR OCORRÊNCIA (A NOVA FUNÇÃO)
  excluir: async (req: Request, res: Response) => {
    const { identificador } = req.params; 
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      console.log(`🗑️ Tentando excluir: ${identificador}`);

      // 1. LÓGICA INTELIGENTE DE BUSCA (UUID, Protocolo ou ID)
      const queryBusca = `
        SELECT id FROM ocorrencias 
        WHERE uuid_local = ? 
           OR numero_ocorrencia = ? 
           OR id = ? 
        LIMIT 1
      `;
      
      const [rows]: any = await conn.query(queryBusca, [identificador, identificador, identificador]);
      
      if (rows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ error: 'Ocorrência não encontrada no servidor.' });
      }

      const idMySQL = rows[0].id; 

      // 2. Deleta Filhos (Cascata)
      await conn.query('DELETE FROM midias WHERE ocorrencia_id = ?', [idMySQL]);
      await conn.query('DELETE FROM vitimas WHERE ocorrencia_id = ?', [idMySQL]);

      // 3. Deleta o Pai
      await conn.query('DELETE FROM ocorrencias WHERE id = ?', [idMySQL]);

      await conn.commit();
      res.json({ message: 'Ocorrência excluída com sucesso', idDeletado: idMySQL });

    } catch (error) {
      await conn.rollback();
      console.error(error);
      res.status(500).json({ error: 'Erro ao excluir' });
    } finally {
      conn.release();
    }
  }
};