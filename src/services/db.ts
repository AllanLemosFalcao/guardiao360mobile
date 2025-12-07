import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const getDB = async () => {
  if (!db) {
    // MUDANÇA: Versão v4 para criar as novas colunas de partida
    db = await SQLite.openDatabaseAsync('guardiao360_v4.db');
  }
  return db;
};

export const initDB = async () => {
  const database = await getDB();

  try {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS ocorrencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid_local TEXT,
        numero_ocorrencia TEXT,
        tipo_viatura TEXT,
        numero_viatura TEXT,
        grupamento TEXT,
        ponto_base TEXT,
        cod_local_ocorrencia TEXT,
        data_acionamento TEXT,
        hora_acionamento TEXT,
        forma_acionamento TEXT,
        local_vtr_acionamento TEXT,
        
        -- NOVAS COLUNAS: GPS DE PARTIDA --
        latitude_partida TEXT,
        longitude_partida TEXT,
        
        regiao TEXT,
        ais TEXT,
        municipio TEXT,
        bairro TEXT,
        tipo_logradouro TEXT,
        logradouro TEXT,
        numero_km TEXT,
        complemento TEXT,
        ponto_referencia TEXT,
        
        -- GPS DE CHEGADA --
        data_hora_chegada_local TEXT,
        latitude_chegada TEXT,
        longitude_chegada TEXT,
        
        apoio_orgaos TEXT,
        viaturas_envolvidas TEXT,
        dificuldades_atuacao TEXT,
        
        natureza_final TEXT,
        grupo TEXT,
        subgrupo TEXT,
        cod_cgo TEXT,
        
        situacao_ocorrencia TEXT,
        motivo_nao_atendida TEXT,
        detalhe_sem_atuacao TEXT,
        
        historico_final TEXT,
        chefe_guarnicao TEXT,
        
        hora_saida_local TEXT,
        hora_chegada_quartel TEXT,
        km_final TEXT,
        
        status TEXT DEFAULT 'RASCUNHO',
        data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vitimas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ocorrencia_id INTEGER,
        nome TEXT,
        sexo TEXT,
        idade TEXT,
        classificacao TEXT,
        etnia TEXT,
        lgbt TEXT,
        destino TEXT,
        tipo_hospital TEXT,
        nome_hospital TEXT,
        sofreu_acidente_transito TEXT,
        condicao_seguranca TEXT,
        assinatura_path TEXT,
        status_assinatura TEXT,
        FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id)
      );

      CREATE TABLE IF NOT EXISTS midias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ocorrencia_id INTEGER,
        caminho_arquivo TEXT,
        tipo TEXT,
        data_captura TEXT,
        legenda TEXT,
        FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id)
      );
    `);
    console.log('Banco de Dados V4 (com GPS Partida) inicializado!');
  } catch (error) {
    console.error('Erro ao inicializar tabelas:', error);
    throw error;
  }
};

export const executeSql = async (sql: string, params: any[] = []) => {
  const database = await getDB();
  const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

  try {
    if (isSelect) {
      const rows = await database.getAllAsync(sql, params);
      return { 
        rows: { 
          _array: rows, 
          length: rows.length,
          item: (idx: number) => rows[idx] 
        } 
      };
    } else {
      const result = await database.runAsync(sql, params);
      return {
        insertId: result.lastInsertRowId,
        rowsAffected: result.changes
      };
    }
  } catch (error) {
    console.error("Erro no executeSql:", error);
    throw error;
  }
};