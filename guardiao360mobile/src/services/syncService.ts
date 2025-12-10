// src/services/syncService.ts
import { executeSql } from './db';
import api from './api';
import { Alert } from 'react-native';
import { AuthService } from './auth';

let isSyncing = false;

// Helper: Converte Data para YYYY-MM-DD
const formatarDataParaMySQL = (dataStr: string) => {
  if (!dataStr) return null;
  if (dataStr.includes('T')) return dataStr.split('T')[0];
  if (dataStr.includes('-')) return dataStr;
  
  const partes = dataStr.split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  return dataStr; 
};

// --- FUNÇÃO 1: DOWNLOAD (Nuvem -> Celular) ---
export const baixarDadosDoServidor = async () => {
  try {
    // 1. Pega usuário e Token (CORREÇÃO AQUI)
    const user = await AuthService.getUsuarioLogado();
    const token = await AuthService.getToken();

    if (!user || !token) return;

    console.log("⬇️ Verificando dados na nuvem...");

    // 2. Configura o cabeçalho com o Token
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 3. Busca no Backend enviando o Token
    const response = await api.get(`/ocorrencias?usuario_id=${user.id}`, config);
    const ocorrenciasNuvem = response.data;

    if (ocorrenciasNuvem && ocorrenciasNuvem.length > 0) {
      let baixados = 0;

      for (const oco of ocorrenciasNuvem) {
        // Verifica se já existe no SQLite
        const existe = await executeSql(
          'SELECT id FROM ocorrencias WHERE uuid_local = ? OR numero_ocorrencia = ?', 
          [oco.uuid_local, oco.numero_ocorrencia]
        );
        
        if (existe.rows.length === 0) {
          // NÃO EXISTE: Vamos salvar no SQLite
          await executeSql(
            `INSERT INTO ocorrencias (
              usuario_id, uuid_local, numero_ocorrencia, tipo_viatura, numero_viatura, 
              grupamento, ponto_base, data_acionamento, hora_acionamento,
              natureza_final, status, situacao_ocorrencia
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'FINALIZADO', ?);`,
            [
              user.id, 
              oco.uuid_local || `SVR-${Date.now()}-${Math.random()}`, 
              oco.numero_ocorrencia, 
              oco.tipo_viatura, 
              oco.numero_viatura,
              oco.grupamento,
              oco.ponto_base,
              oco.data_acionamento, 
              oco.hora_acionamento,
              oco.natureza_final,
              oco.situacao_ocorrencia || 'Atendida'
            ]
          );
          baixados++;
        }
      }

      if (baixados > 0) {
        console.log(`📥 ${baixados} ocorrências baixadas.`);
      } else {
        console.log("✅ Tudo sincronizado (Nenhum dado novo).");
      }
    }
  } catch (error: any) {
    console.error("Erro ao baixar dados:", error.message);
    if (error.response && error.response.status === 401) {
       console.log("⚠️ Token inválido no download.");
    }
  }
};

// --- FUNÇÃO 2: UPLOAD (Celular -> Nuvem) ---
export const sincronizarDados = async (silencioso = false) => {
  if (isSyncing) return;

  // Pega o Token
  const token = await AuthService.getToken();
  if (!token) {
    if (!silencioso) Alert.alert("Sessão Expirada", "Faça login novamente.");
    return;
  }

  try {
    isSyncing = true;
    
    // 1. PRIMEIRO: Baixa o que tem de novo
    await baixarDadosDoServidor();

    if (!silencioso) console.log("🔄 Enviando pendências...");

    const resOco = await executeSql(
      `SELECT * FROM ocorrencias WHERE status = 'FINALIZADO';`
    );
    const ocorrenciasPendentes = resOco.rows._array;

    if (ocorrenciasPendentes.length === 0) {
      if (!silencioso) Alert.alert("Tudo em dia", "Sincronização concluída.");
      return;
    }

    let sucessos = 0;
    const configAxios = { headers: { Authorization: `Bearer ${token}` } };

    for (const oco of ocorrenciasPendentes) {
      try {
        const resVit = await executeSql(`SELECT * FROM vitimas WHERE ocorrencia_id = ?`, [oco.id]);
        const resMid = await executeSql(`SELECT * FROM midias WHERE ocorrencia_id = ?`, [oco.id]);

        const ocorrenciaFormatada = {
          ...oco,
          data_acionamento: formatarDataParaMySQL(oco.data_acionamento),
          data_hora_chegada_local: oco.data_hora_chegada_local ? oco.data_hora_chegada_local.replace(/\//g, '-') : null,
        };

        const pacoteEnvio = {
          ...ocorrenciaFormatada,
          vitimas: resVit.rows._array,
          midias: resMid.rows._array
        };

        await api.post('/ocorrencias', pacoteEnvio, configAxios);

        await executeSql(
          `UPDATE ocorrencias SET status = 'ENVIADO' WHERE id = ?;`,
          [oco.id]
        );
        sucessos++;

      } catch (error: any) {
        console.error(`❌ Falha Ocorrência ${oco.id}:`, error);
        if (error.response && error.response.status === 401) {
          Alert.alert("Sessão Inválida", "Faça login novamente.");
          throw error; 
        }
      }
    }

    if (!silencioso && sucessos > 0) Alert.alert("Sucesso", `${sucessos} ocorrência(s) enviadas!`);

  } catch (error) {
    console.log("Erro no sync:", error);
  } finally {
    isSyncing = false;
  }
};