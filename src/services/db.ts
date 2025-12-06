import * as SQLite from 'expo-sqlite';

// Variável para segurar a conexão com o banco
let db: SQLite.SQLiteDatabase | null = null;

// Função auxiliar para abrir o banco (Singleton)
const getDB = async () => {
  if (!db) {
    // Abre o banco usando a NOVA API Assíncrona
    db = await SQLite.openDatabaseAsync('guardiao360_v2.db');
  }
  return db;
};

export const initDB = async () => {
  const database = await getDB();

  // Na nova API, usamos execAsync para criar tabelas (pode rodar vários comandos de uma vez)
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
        
        regiao TEXT,
        ais TEXT,
        municipio TEXT,
        bairro TEXT,
        tipo_logradouro TEXT,
        logradouro TEXT,
        numero_km TEXT,
        complemento TEXT,
        ponto_referencia TEXT,
        
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
    console.log('Tabelas inicializadas com sucesso (Nova API)');
  } catch (error) {
    console.error('Erro ao inicializar tabelas:', error);
    throw error;
  }
};

// Função "Adaptadora"
// Ela usa a nova API (runAsync/getAllAsync) mas devolve os dados no formato que suas telas esperam.
export const executeSql = async (sql: string, params: any[] = []) => {
  const database = await getDB();
  
  // Verifica se é um comando de LEITURA (SELECT) ou ESCRITA (INSERT/UPDATE)
  const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

  try {
    if (isSelect) {
      // Se for SELECT, usamos getAllAsync
      const rows = await database.getAllAsync(sql, params);
      return { 
        rows: { 
          _array: rows, 
          length: rows.length,
          item: (idx: number) => rows[idx] 
        } 
      };
    } else {
      // Se for INSERT/UPDATE/DELETE, usamos runAsync
      const result = await database.runAsync(sql, params);
      return {
        insertId: result.lastInsertRowId, // Adaptando o nome novo para o antigo
        rowsAffected: result.changes      // Adaptando o nome novo para o antigo
      };
    }
  } catch (error) {
    console.error("Erro no executeSql:", error);
    throw error;
  }
};