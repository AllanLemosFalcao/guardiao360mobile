import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

// Função auxiliar para garantir que o banco está aberto
const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('guardiao360_v5.db');
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
        
        -- DADOS DA CENTRAL (DESPACHO) --
        latitude_destino TEXT,
        longitude_destino TEXT,
        endereco_destino TEXT,
        prioridade TEXT DEFAULT 'Normal',
        
        -- DADOS OPERACIONAIS --
        tipo_viatura TEXT,
        numero_viatura TEXT,
        grupamento TEXT,
        ponto_base TEXT,
        cod_local_ocorrencia TEXT,
        
        data_acionamento TEXT,
        hora_acionamento TEXT,
        forma_acionamento TEXT,
        local_vtr_acionamento TEXT,
        
        -- GPS DE PARTIDA --
        latitude_partida TEXT,
        longitude_partida TEXT,
        
        -- ENDEREÇO DA OCORRÊNCIA --
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
        
        -- RELATÓRIO FINAL --
        natureza_final TEXT,
        grupo TEXT,
        subgrupo TEXT,
        situacao_ocorrencia TEXT,
        motivo_nao_atendida TEXT,
        detalhe_sem_atuacao TEXT,
        historico_final TEXT,
        chefe_guarnicao TEXT,
        hora_saida_local TEXT,
        
        status TEXT DEFAULT 'DESPACHADA',
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
        usuario_id INTEGER,
        ocorrencia_id INTEGER,
        caminho_arquivo TEXT,
        tipo TEXT,
        data_captura TEXT,
        FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id)
      );
    `);
    console.log('Banco de Dados V5 inicializado!');
  } catch (error) {
    console.error('Erro ao inicializar DB:', error);
  }
};

export const executeSql = async (sql: string, params: any[] = []) => {
  // Garante que temos uma conexão válida antes de tentar executar
  const database = await getDB();
  
  const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
  try {
    if (isSelect) {
      const rows = await database.getAllAsync(sql, params);
      return { rows: { _array: rows, length: rows.length, item: (idx: number) => rows[idx] } };
    } else {
      const result = await database.runAsync(sql, params);
      return { insertId: result.lastInsertRowId, rowsAffected: result.changes };
    }
  } catch (error) {
    console.error("SQL Error:", error);
    throw error;
  }
};