import { executeSql } from './db';
import api from './api';
import { Alert } from 'react-native';

// Trava de segurança
let isSyncing = false;

export const sincronizarDados = async (silencioso = false) => {
  if (isSyncing) {
    if (!silencioso) console.log("⏳ Sync já em andamento.");
    return;
  }

  try {
    isSyncing = true;
    if (!silencioso) console.log("🔄 Iniciando sincronização completa...");

    // 1. Buscar OCORRÊNCIAS finalizadas
    const resOco = await executeSql(
      `SELECT * FROM ocorrencias WHERE status = 'FINALIZADO';`
    );
    const ocorrenciasPendentes = resOco.rows._array;

    if (ocorrenciasPendentes.length === 0) {
      if (!silencioso) Alert.alert("Tudo em dia", "Nada para enviar.");
      return;
    }

    let sucessos = 0;
    let falhas = 0;

    // 2. Loop de envio
    for (const oco of ocorrenciasPendentes) {
      try {
        console.log(`📦 Preparando pacote: ${oco.numero_ocorrencia}`);

        // A. Busca VÍTIMAS desta ocorrência no SQLite
        const resVit = await executeSql(
          `SELECT * FROM vitimas WHERE ocorrencia_id = ?`, 
          [oco.id]
        );
        const listaVitimas = resVit.rows._array;

        // B. Monta o Objeto Completo (JSON Aninhado)
        const pacoteEnvio = {
          ...oco,           // Todos os dados da ocorrência
          vitimas: listaVitimas // Adiciona o array de vítimas junto
        };

        // C. Envia para o Backend
        await api.post('/ocorrencias', pacoteEnvio);

        // D. Atualiza status local
        await executeSql(
          `UPDATE ocorrencias SET status = 'ENVIADO' WHERE id = ?;`,
          [oco.id]
        );

        sucessos++;
        console.log(`✅ Enviado: ${oco.numero_ocorrencia} (com ${listaVitimas.length} vítimas)`);

      } catch (error) {
        console.error(`❌ Falha ao enviar ${oco.numero_ocorrencia}:`, error);
        falhas++;
      }
    }

    // Feedback
    if (!silencioso) {
      if (sucessos > 0) Alert.alert("Sucesso", `${sucessos} ocorrência(s) sincronizada(s)!`);
      else if (falhas > 0) Alert.alert("Erro", "Falha ao conectar com o servidor.");
    } else {
      if (sucessos > 0) console.log(`🔄 Auto-Sync: ${sucessos} enviados.`);
    }

  } catch (error) {
    console.error("Erro no sync:", error);
  } finally {
    isSyncing = false;
  }
};